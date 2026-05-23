// ============================================================
//  controllers/upload.controller.js — Core Upload + AI Pipeline v3
//
//  Changes from v2:
//   • Handles new Gemini response format: { currency, transactions }
//   • Stores currency in summary
//   • Computes financialHealthScore (0–100)
//   • generateRecommendation produces actionable, practical tips
// ============================================================

import fs from "fs";
import { extractTextFromFile } from "../utils/fileParser.js";
import { analyzeTransactions } from "../utils/gemini.service.js";
import Statement from "../models/Statement.js";
import User from "../models/User.js";

export async function processFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file received." });
  }
  const { path: filePath, mimetype, originalname } = req.file;
  console.log(`\n📁  Processing: ${originalname} for user ${req.user.email}`);
  try {
    const rawText = await extractTextFromFile(filePath, mimetype);
    const { currency, transactions } = await analyzeTransactions(rawText);

    if (transactions.length === 0) {
      return res.status(422).json({ success: false, error: "No transactions found in this file." });
    }

    const summary = computeSummary(transactions, currency);
    const recommendation = generateRecommendation(summary);

    const statement = await Statement.create({
      user: req.user._id,
      filename: originalname,
      transactions,
      summary,
      recommendation,
      periodStart: summary.monthlyTrends[0]?.rawMonth || null,
      periodEnd: summary.monthlyTrends[summary.monthlyTrends.length - 1]?.rawMonth || null,
      currency,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { statementsAnalysed: 1 } });

    console.log(`✅  Saved statement ${statement._id} (${currency})`);
    res.status(200).json({
      success: true,
      statementId: statement._id,
      filename: originalname,
      transactions,
      summary,
      recommendation,
      currency,
    });
  } catch (err) {
    next(err);
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

export async function getStatementHistory(req, res, next) {
  try {
    const statements = await Statement.find({ user: req.user._id })
      .select("filename summary.totalIncome summary.totalExpenses summary.netProfit summary.profitMargin summary.financialHealthScore summary.transactionCount currency createdAt periodStart periodEnd")
      .sort({ createdAt: -1 });
    res.json({ success: true, statements });
  } catch (err) { next(err); }
}

export async function getStatement(req, res, next) {
  try {
    const statement = await Statement.findOne({ _id: req.params.id, user: req.user._id });
    if (!statement) return res.status(404).json({ success: false, error: "Statement not found." });
    res.json({ success: true, statement });
  } catch (err) { next(err); }
}

// ── Private Helpers ──────────────────────────────────────────

function computeSummary(transactions, currency = "USD") {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0
    ? parseFloat(((netProfit / totalIncome) * 100).toFixed(1))
    : 0;

  // Monthly breakdown
  const monthlyMap = {};
  transactions.forEach(t => {
    const month = t.date ? t.date.slice(0, 7) : "Unknown";
    if (!monthlyMap[month]) monthlyMap[month] = { rawMonth: month, income: 0, expenses: 0 };
    if (t.type === "income") monthlyMap[month].income += t.amount;
    else monthlyMap[month].expenses += t.amount;
  });

  const monthlyTrends = Object.values(monthlyMap)
    .sort((a, b) => a.rawMonth.localeCompare(b.rawMonth))
    .map(m => ({
      month: formatMonthLabel(m.rawMonth),
      rawMonth: m.rawMonth,
      income: parseFloat(m.income.toFixed(2)),
      expenses: parseFloat(m.expenses.toFixed(2)),
      profit: parseFloat((m.income - m.expenses).toFixed(2)),
    }));

  // Category breakdown
  const categoryMap = {};
  transactions.forEach(t => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { category: t.category, type: t.type, total: 0 };
    }
    categoryMap[t.category].total += t.amount;
  });

  const categoryBreakdown = Object.values(categoryMap)
    .sort((a, b) => b.total - a.total)
    .map(c => ({ ...c, total: parseFloat(c.total.toFixed(2)) }));

  // Financial health score
  const financialHealthScore = computeHealthScore(profitMargin, monthlyTrends, categoryBreakdown, totalExpenses);

  // Cash flow trend (positive = improving revenue in last 3 months)
  const cashFlowTrend = computeCashFlowTrend(monthlyTrends);

  return {
    currency,
    totalIncome: parseFloat(totalIncome.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    netProfit: parseFloat(netProfit.toFixed(2)),
    profitMargin,
    transactionCount: transactions.length,
    monthlyTrends,
    categoryBreakdown,
    financialHealthScore,
    cashFlowTrend,
  };
}

function computeHealthScore(profitMargin, monthlyTrends, categoryBreakdown, totalExpenses) {
  let score = 50;

  // Profitability component (max ±30)
  if (profitMargin >= 30) score += 30;
  else if (profitMargin >= 20) score += 22;
  else if (profitMargin >= 10) score += 12;
  else if (profitMargin >= 0) score += 4;
  else if (profitMargin >= -10) score -= 15;
  else score -= 30;

  // Revenue trend component (max ±15)
  if (monthlyTrends.length >= 3) {
    const last3 = monthlyTrends.slice(-3);
    const isGrowing = last3[2].income > last3[0].income;
    const isExpensesShrinking = last3[2].expenses <= last3[0].expenses;
    if (isGrowing) score += 10;
    if (isExpensesShrinking) score += 5;
    else score -= 3;
  }

  // Expense concentration component (max ±5)
  if (totalExpenses > 0) {
    const topExpense = categoryBreakdown.filter(c => c.type === "expense")[0];
    if (topExpense) {
      const concentration = topExpense.total / totalExpenses;
      if (concentration > 0.7) score -= 5;
      else if (concentration < 0.4) score += 5;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeCashFlowTrend(monthlyTrends) {
  if (monthlyTrends.length < 2) return "stable";
  const last = monthlyTrends[monthlyTrends.length - 1];
  const prev = monthlyTrends[monthlyTrends.length - 2];
  const delta = last.profit - prev.profit;
  if (delta > 0) return "improving";
  if (delta < 0) return "declining";
  return "stable";
}

function generateRecommendation(summary) {
  const { profitMargin, totalExpenses, totalIncome, netProfit, categoryBreakdown, monthlyTrends, currency } = summary;

  let status, message;
  if (profitMargin >= 20) {
    status = "healthy";
    message = `Your business has a ${profitMargin}% profit margin — a strong result. Focus now on protecting and growing this margin.`;
  } else if (profitMargin >= 5) {
    status = "warning";
    message = `Your profit margin is ${profitMargin}% — positive but thin. Small changes in expenses or pricing can significantly improve this.`;
  } else if (profitMargin >= 0) {
    status = "warning";
    message = `Your profit margin is just ${profitMargin}%. Your business is barely breaking even. Immediate action on cost control is recommended.`;
  } else {
    status = "critical";
    message = `Your business is operating at a loss (${profitMargin}% margin). You spent ${formatAmount(Math.abs(netProfit))} more than you earned. Review the tips below to stabilise cash flow.`;
  }

  const tips = [];

  // Tip 1: Biggest expense category — specific and actionable
  const topExpense = categoryBreakdown
    .filter(c => c.type === "expense")
    .sort((a, b) => b.total - a.total)[0];

  if (topExpense && totalExpenses > 0) {
    const pct = Math.round((topExpense.total / totalExpenses) * 100);
    const expenseAmount = formatAmount(topExpense.total);
    if (pct > 40) {
      tips.push(
        `"${topExpense.category}" is your single largest cost at ${pct}% of total spend (${expenseAmount}). ` +
        `Get 3 quotes from alternative suppliers or renegotiate your current contracts to target a 10–15% reduction.`
      );
    } else {
      tips.push(
        `Your top expense category is "${topExpense.category}" (${pct}% of spend, ${expenseAmount}). ` +
        `Review this line item monthly and set a monthly budget cap.`
      );
    }
  }

  // Tip 2: Revenue or margin improvement
  if (profitMargin < 15) {
    const targetRevenue = totalExpenses > 0
      ? formatAmount(totalExpenses / 0.8) // what revenue is needed for 20% margin
      : null;
    if (targetRevenue) {
      tips.push(
        `To reach a healthy 20% margin, you need revenue of approximately ${targetRevenue} against your current costs. ` +
        `Focus on increasing pricing by 5–10% or adding a second revenue stream (e.g. a service tier, subscription, or recurring contract).`
      );
    }
  } else if (profitMargin >= 20) {
    const surplusAmount = formatAmount(netProfit * 0.5);
    tips.push(
      `You have a healthy surplus. Consider allocating ${surplusAmount} (50% of profit) into a business reserve fund or reinvesting it in marketing to grow revenue further.`
    );
  }

  // Tip 3: Cash flow pattern from monthly trends
  if (monthlyTrends.length >= 2) {
    const lossMonths = monthlyTrends.filter(m => m.profit < 0);
    const bestMonth = monthlyTrends.reduce((best, m) => m.profit > best.profit ? m : best, monthlyTrends[0]);
    const worstMonth = monthlyTrends.reduce((worst, m) => m.profit < worst.profit ? m : worst, monthlyTrends[0]);

    if (lossMonths.length > 0) {
      tips.push(
        `You recorded losses in ${lossMonths.length} month(s) (e.g. ${lossMonths[0].month}). ` +
        `Build a cash buffer of at least 1–2 months of operating costs to cover these periods without disruption.`
      );
    } else if (monthlyTrends.length >= 3) {
      tips.push(
        `Your best month was ${bestMonth.month} (profit: ${formatAmount(bestMonth.profit)}). ` +
        `Identify what drove higher revenue that month — seasonal demand, promotions, or new clients — and replicate it.`
      );
    }
  }

  // Tip 4: Bank charges flag
  const bankCharges = categoryBreakdown.find(c => c.category === "Bank Charges & Fees");
  if (bankCharges && totalExpenses > 0) {
    const pct = Math.round((bankCharges.total / totalExpenses) * 100);
    if (pct >= 3) {
      tips.push(
        `Bank charges total ${formatAmount(bankCharges.total)} (${pct}% of your expenses). ` +
        `Switch to a business account with lower transaction fees or negotiate a better tariff with your bank — this is direct savings.`
      );
    }
  }

  // Always include a subscriptions/recurring review tip
  const subs = categoryBreakdown.find(c => c.category === "Software & Subscriptions");
  if (subs) {
    tips.push(
      `You spent ${formatAmount(subs.total)} on software and subscriptions. ` +
      `Audit each tool: cancel unused ones, consolidate overlapping tools, and negotiate annual billing for the ones you keep (typically 20–30% cheaper).`
    );
  }

  // Fill with a final actionable tip if list is short
  if (tips.length < 3) {
    tips.push(
      `Set up a monthly financial review: compare revenue vs expenses to last month, identify any unexpected increases, and adjust your budget before small issues become large ones.`
    );
  }

  return { status, message, tips };
}

function formatAmount(value) {
  if (!value && value !== 0) return "—";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

function formatMonthLabel(yearMonth) {
  if (!yearMonth || yearMonth === "Unknown") return "Unknown";
  const [year, month] = yearMonth.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}
