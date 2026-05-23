// ============================================================
//  utils/gemini.service.js — Google Gemini AI Integration v4
//
//  Changes from v3:
//   • Returns { currency, transactions } — auto-detects statement currency
//   • Retry with exponential backoff on transient Gemini failures
//   • Improved system prompt for more consistent output
// ============================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
console.log("🤖  Gemini model configured:", GEMINI_MODEL);

// ── System Prompt ───────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a highly accurate financial data extraction and categorization engine.

Your ONLY job is to read raw bank statement text and return a valid JSON object.

STRICT RULES:
1. Output ONLY a raw JSON object. No markdown, no code fences, no explanation, no preamble.
2. The object must have exactly two fields: "currency" and "transactions".
3. "currency": Detect the ISO 4217 currency code from the statement (e.g. "NGN", "USD", "GBP", "GHS", "KES", "ZAR", "EUR"). Look for currency symbols (₦, $, £, GH₵, KSh, R, €) or explicit currency labels. Default to "USD" only if truly undetectable.
4. "transactions": array of transaction objects. Each object must have exactly these fields:
   - "date"        : string — ISO 8601 format (YYYY-MM-DD). Infer the year if missing.
   - "description" : string — cleaned merchant/payee name, max 60 chars.
   - "amount"      : number — ALWAYS positive. The sign is determined by "type".
   - "type"        : string — MUST be exactly "income" or "expense".
   - "category"    : string — MUST be one of the allowed categories below.
5. Allowed categories:
   INCOME categories : "Sales Revenue", "Service Income", "Investment Returns",
                       "Loan Received", "Refund Received", "Other Income"
   EXPENSE categories: "Payroll", "Rent & Utilities", "Software & Subscriptions",
                       "Marketing & Advertising", "Travel & Transport",
                       "Office Supplies", "Bank Charges & Fees",
                       "Tax & Government", "Insurance", "Inventory & COGS",
                       "Professional Services", "Other Expense"
6. If a line is not a transaction (e.g. opening balance, statement header), skip it.
7. If a date cannot be determined, use the closest inferrable date.
8. Never invent amounts. Use exactly what is in the text.

Example of valid output:
{
  "currency": "NGN",
  "transactions": [
    {"date":"2024-03-01","description":"Payroll Run","amount":12500.00,"type":"expense","category":"Payroll"},
    {"date":"2024-03-02","description":"Client Invoice #1042","amount":8750.00,"type":"income","category":"Sales Revenue"}
  ]
}
`;

/**
 * Sends raw bank statement text to Gemini and returns structured data.
 * Handles large files via chunking and retries on transient failures.
 *
 * @param {string} rawText
 * @returns {Promise<{ currency: string, transactions: Array }>}
 */
export async function analyzeTransactions(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("No readable text found in the uploaded file.");
  }

  console.log(`\n📊  Analyzing ${(rawText.length / 1024).toFixed(2)} KB of statement data...`);
  const startTime = Date.now();

  const chunks = chunkText(rawText, 50000);
  console.log(`📦  Processing in ${chunks.length} chunk(s)...`);

  let allTransactions = [];
  let detectedCurrency = "USD"; // fallback

  for (let i = 0; i < chunks.length; i++) {
    const chunkNum = i + 1;
    console.log(`   ⏳  Chunk ${chunkNum}/${chunks.length}...`);

    try {
      const result = await processChunkWithRetry(chunks[i]);
      // Use currency from first chunk (most likely to have statement header)
      if (i === 0 && result.currency) {
        detectedCurrency = result.currency;
      }
      allTransactions = allTransactions.concat(result.transactions);
      console.log(`   ✅  Chunk ${chunkNum}: ${result.transactions.length} transactions (${result.currency})`);
    } catch (err) {
      console.error(`   ❌  Chunk ${chunkNum} failed after retries:`, err.message);
      throw new Error(`Failed to process chunk ${chunkNum}/${chunks.length}: ${err.message}`);
    }
  }

  const uniqueTransactions = deduplicateTransactions(allTransactions);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨  Analysis complete: ${uniqueTransactions.length} transactions in ${duration}s (${detectedCurrency})`);
  if (allTransactions.length > uniqueTransactions.length) {
    console.log(`   📈  Deduplication removed ${allTransactions.length - uniqueTransactions.length} duplicates`);
  }

  return { currency: detectedCurrency, transactions: uniqueTransactions };
}

/**
 * Process a chunk with exponential backoff retry (up to 3 attempts).
 * @private
 */
async function processChunkWithRetry(chunkText, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processChunk(chunkText);
    } catch (err) {
      lastError = err;
      // Don't retry on parse errors — the model returned garbage, retrying won't help
      if (err.message.includes("unparseable") || err.message.includes("not a JSON")) {
        throw err;
      }
      if (attempt < maxRetries) {
        const delay = 1500 * attempt; // 1.5s, 3s
        console.warn(`   ⚠️  Attempt ${attempt} failed, retrying in ${delay}ms: ${err.message}`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Send one chunk to Gemini and parse the result.
 * @private
 */
async function processChunk(chunkText) {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  });

  const userPrompt = `
Extract all transactions from this bank statement text. Detect the currency.
Return ONLY the JSON object with "currency" and "transactions" fields. Nothing else.

BANK STATEMENT TEXT:
---
${chunkText}
---
`;

  const result = await model.generateContent(userPrompt);
  const responseText = result.response.text();

  const cleaned = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Raw Gemini response:", responseText.slice(0, 500));
    throw new Error(
      "AI returned an unparseable response. Please try a cleaner bank statement file."
    );
  }

  // Handle both new format { currency, transactions } and old format (plain array)
  let currency = "USD";
  let transactions;

  if (Array.isArray(parsed)) {
    // Old format fallback
    transactions = parsed;
  } else if (parsed && Array.isArray(parsed.transactions)) {
    currency = parsed.currency || "USD";
    transactions = parsed.transactions;
  } else {
    throw new Error("AI response was not in the expected format.");
  }

  return {
    currency,
    transactions: transactions.map((t) => ({
      ...t,
      amount: parseFloat(t.amount) || 0,
    })),
  };
}

/**
 * Split text into chunks preserving line integrity.
 * @private
 */
function chunkText(text, maxChunkSize = 50000) {
  if (text.length <= maxChunkSize) return [text];

  const lines = text.split("\n");
  const chunks = [];
  let currentChunk = "";

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  if (currentChunk.length > 0) chunks.push(currentChunk);
  return chunks.length === 0 ? [text] : chunks;
}

/**
 * Remove duplicate transactions identified by date + description + amount + type.
 * @private
 */
function deduplicateTransactions(transactions) {
  const seen = new Set();
  return transactions.filter((t) => {
    const key = `${t.date}|${t.description}|${t.amount}|${t.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
