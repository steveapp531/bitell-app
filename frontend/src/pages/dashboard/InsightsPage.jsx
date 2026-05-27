import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useDashboard } from "../../context/DashboardContext.jsx";

function fmt(val, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency;
  if (!val && val !== 0) return "—";
  if (Math.abs(val) >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${sym}${Math.round(val / 1_000)}k`;
  return `${sym}${val.toLocaleString()}`;
}

const CHART_COLORS = [
  "#0C2218", "#22C55E", "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6"
];

function generateInsights(statement) {
  if (!statement) return [];
  const s = statement.summary;
  const currency = statement.currency || "NGN";
  const insights = [];

  // Revenue insight
  if (s.totalIncome > 0) {
    const trend = s.cashFlowTrend;
    insights.push({
      id: "revenue",
      icon: trend === "improving" ? "↗" : trend === "declining" ? "↘" : "→",
      iconColor: trend === "improving" ? "#22C55E" : trend === "declining" ? "#EF4444" : "#F59E0B",
      iconBg: trend === "improving" ? "#DCFCE7" : trend === "declining" ? "#FEE2E2" : "#FEF3C7",
      title: `You made ${fmt(s.totalIncome, currency)} this period`,
      detail: `Net profit: ${fmt(s.netProfit, currency)} (${s.profitMargin?.toFixed(1)}% margin). Trend is ${trend}.`,
    });
  }

  // Owner withdrawals
  const personalCat = s.categoryBreakdown?.find(
    (c) => c.category === "Other Expense"
  );
  if (personalCat && s.totalIncome > 0) {
    const pct = ((personalCat.total / s.totalIncome) * 100).toFixed(0);
    insights.push({
      id: "withdrawals",
      icon: "↘",
      iconColor: "#F59E0B",
      iconBg: "#FEF3C7",
      title: `Owner withdrawals = ${pct}% of revenue`,
      detail: `${fmt(personalCat.total, currency)} moved to other accounts. Watch this number.`,
    });
  }

  // Health warning
  if (s.financialHealthScore < 50) {
    insights.push({
      id: "health",
      icon: "!",
      iconColor: "#EF4444",
      iconBg: "#FEE2E2",
      title: "Your financial health score needs attention",
      detail: `Score: ${s.financialHealthScore}/100. ${statement.recommendation?.tips?.[0] || "Review your spending categories."}`,
    });
  }

  // Top spending category
  const topExpense = s.categoryBreakdown
    ?.filter((c) => c.type === "expense")
    .sort((a, b) => b.total - a.total)[0];
  if (topExpense) {
    insights.push({
      id: "topspend",
      icon: "i",
      iconColor: "#3B82F6",
      iconBg: "#DBEAFE",
      title: `${topExpense.category} is your biggest cost`,
      detail: `${fmt(topExpense.total, currency)} — ${((topExpense.total / s.totalExpenses) * 100).toFixed(0)}% of total expenses.`,
    });
  }

  // Transaction diversity
  if (statement.transactions?.length > 20) {
    insights.push({
      id: "volume",
      icon: "i",
      iconColor: "#3B82F6",
      iconBg: "#DBEAFE",
      title: `${statement.transactions.length} transactions analysed`,
      detail: `${statement.transactions.filter((t) => t.type === "income").length} income entries, ${statement.transactions.filter((t) => t.type === "expense").length} expense entries.`,
    });
  }

  // Recommendation tips
  (statement.recommendation?.tips || []).slice(0, 2).forEach((tip, i) => {
    insights.push({
      id: `tip-${i}`,
      icon: "→",
      iconColor: "#0C2218",
      iconBg: "#DCFCE7",
      title: tip,
      detail: null,
    });
  });

  return insights;
}

export default function InsightsPage() {
  const { statement, loadingStatement } = useDashboard();

  const currency = statement?.currency || "NGN";
  const s = statement?.summary;
  const insights = generateInsights(statement);

  // Spending breakdown for pie chart
  const spendingData = (s?.categoryBreakdown || [])
    .filter((c) => c.type === "expense" && c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center gap-2 mb-5">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: "#0C2218" }}>
          AI-generated
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bitell Insights</h1>
      <p className="text-sm text-gray-500 mb-6">What your transactions are revealing about your business.</p>

      {loadingStatement && (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin w-8 h-8 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {!loadingStatement && !statement && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-base font-bold text-gray-900 mb-2">No data yet</p>
          <p className="text-sm text-gray-500">Upload your transactions to see AI-powered insights about your business.</p>
        </div>
      )}

      {/* Insight cards */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          {insights.map((ins) => (
            <div key={ins.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: ins.iconBg, color: ins.iconColor }}
              >
                {ins.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{ins.title}</p>
                {ins.detail && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{ins.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spending breakdown */}
      {spendingData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-0.5">Where your money went</p>
          <p className="text-xs text-gray-400 mb-4">This period's spending breakdown</p>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={spendingData}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {spendingData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => fmt(val, currency)}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {spendingData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 truncate">{item.category}</p>
                  <p className="text-xs font-semibold text-gray-800 font-mono">{fmt(item.total, currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
