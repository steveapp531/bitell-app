import { GoogleGenerativeAI } from "@google/generative-ai";
import Statement from "../models/Statement.js";
import dotenv from "dotenv";
dotenv.config();

export async function chat(req, res, next) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ success: false, error: "AI service not configured. Please set GEMINI_API_KEY on the server." });
    }
    // Initialize Gemini client lazily so the module can load without an API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
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
      // Ensure we have monthly trends; if not, compute from raw transactions
      let monthlyTrends = (s && s.monthlyTrends) || [];
      if ((!monthlyTrends || monthlyTrends.length === 0) && Array.isArray(latestStatement.transactions)) {
        const byMonth = {};
        for (const t of latestStatement.transactions) {
          // Expect ISO-like date 'YYYY-MM-DD' or similar
          const rawMonth = (t.date || "").slice(0, 7); // 'YYYY-MM'
          if (!rawMonth) continue;
          if (!byMonth[rawMonth]) byMonth[rawMonth] = { income: 0, expenses: 0 };
          if (t.type === "income") byMonth[rawMonth].income += Number(t.amount || 0);
          else byMonth[rawMonth].expenses += Number(t.amount || 0);
        }
        monthlyTrends = Object.keys(byMonth)
          .sort()
          .map((raw) => ({
            rawMonth: raw,
            month: raw,
            income: Math.round(byMonth[raw].income),
            expenses: Math.round(byMonth[raw].expenses),
            profit: Math.round((byMonth[raw].income || 0) - (byMonth[raw].expenses || 0)),
          }));
      }

      const topCategories = (s?.categoryBreakdown || [])
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map((c) => `${c.category}: ${latestStatement.currency} ${c.total.toLocaleString()}`)
        .join(", ");

      // Build a concise monthly breakdown string (up to last 6 months)
      const recentMonths = (monthlyTrends || []).slice(-6).map((m) => `${m.rawMonth}: income ${latestStatement.currency} ${m.income.toLocaleString()}, expenses ${m.expenses.toLocaleString()}` ).join('; ');

      financialContext = `Business: ${user.businessName || user.name} (${user.businessType || "General business"}) in ${user.location || "Nigeria"}\nStatement period: ${latestStatement.periodStart || "unknown"} to ${latestStatement.periodEnd || "unknown"}\nCurrency: ${latestStatement.currency || "NGN"}\nTotal income this period: ${s?.totalIncome?.toLocaleString() || 0}\nTotal expenses this period: ${s?.totalExpenses?.toLocaleString() || 0}\nNet profit: ${s?.netProfit?.toLocaleString() || 0}\nProfit margin: ${s?.profitMargin ? s.profitMargin.toFixed(1) + '%' : 'N/A'}\nFinancial health score: ${s?.financialHealthScore || 'N/A'}/100\nCash flow trend: ${s?.cashFlowTrend || 'N/A'}\nTop spending categories: ${topCategories || 'N/A'}\nMonthly breakdown (recent): ${recentMonths || 'N/A'}\nRecommendation status: ${latestStatement.recommendation?.status || 'N/A'}`;
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

    // Build conversation for Gemini. Pass the system instruction as a
    // Content object via `systemInstruction` and only include user/assistant
    // messages in the history. This avoids the API error about a leading
    // system content.
    const geminiHistory = history.map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      history: geminiHistory,
    });

    let result;
    try {
      result = await chat.sendMessage(message);
    } catch (gErr) {
      console.error("Gemini error:", gErr?.message || gErr);
      return res.status(502).json({ success: false, error: "AI service error: " + (gErr?.message || "unexpected error") });
    }

    const reply = result.response?.text?.() || result.response?.output || "";

    res.json({ reply });
  } catch (err) {
    next(err);
  }
}
