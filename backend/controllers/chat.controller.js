import { GoogleGenerativeAI } from "@google/generative-ai";
import Statement from "../models/Statement.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });

export async function chat(req, res, next) {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const user = req.user;

    // Load latest statement for financial context
    const latestStatement = await Statement.findOne({ user: user._id }).sort({ createdAt: -1 });

    let financialContext = "No financial data uploaded yet.";
    if (latestStatement) {
      const s = latestStatement.summary;
      const topCategories = (s.categoryBreakdown || [])
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((c) => `${c.category}: ${latestStatement.currency} ${c.total.toLocaleString()}`)
        .join(", ");

      financialContext = `
Business: ${user.businessName || user.name} (${user.businessType || "General business"}) in ${user.location || "Nigeria"}
Statement period: ${latestStatement.periodStart || "unknown"} to ${latestStatement.periodEnd || "unknown"}
Currency: ${latestStatement.currency || "NGN"}
Total income this period: ${s.totalIncome?.toLocaleString()}
Total expenses this period: ${s.totalExpenses?.toLocaleString()}
Net profit: ${s.netProfit?.toLocaleString()}
Profit margin: ${s.profitMargin?.toFixed(1)}%
Financial health score: ${s.financialHealthScore}/100
Cash flow trend: ${s.cashFlowTrend}
Top spending categories: ${topCategories}
Recommendation status: ${latestStatement.recommendation?.status}
`;
    }

    const systemInstruction = `You are Bitell, a friendly and knowledgeable financial assistant for small and informal businesses in Nigeria and Africa.

Your role: Help business owners understand their finances in plain, simple language — no jargon.

Rules:
- Keep responses concise and actionable (2-4 sentences max for simple questions)
- Use Naira (₦) formatting when relevant, or the business's currency
- Be warm, practical, and encouraging
- When data is missing, say so honestly and suggest uploading a bank statement
- Never make up financial figures

Business context:
${financialContext}`;

    // Build conversation for Gemini
    const geminiHistory = history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({
      systemInstruction,
      history: geminiHistory,
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    next(err);
  }
}
