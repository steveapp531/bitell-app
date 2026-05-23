import React from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";

function fmt(val, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency;
  if (!val && val !== 0) return "—";
  if (Math.abs(val) >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${sym}${Math.round(val / 1_000)}k`;
  return `${sym}${val.toLocaleString()}`;
}

const SEVERITY = {
  critical: { bg: "#FEF2F2", border: "#FCA5A5", icon: "!", iconBg: "#EF4444", iconColor: "white", label: "Critical" },
  warning:  { bg: "#FFFBEB", border: "#FCD34D", icon: "!", iconBg: "#F59E0B", iconColor: "white", label: "Warning" },
  info:     { bg: "#EFF6FF", border: "#BFDBFE", icon: "i", iconBg: "#3B82F6", iconColor: "white", label: "Info" },
  positive: { bg: "#F0FDF4", border: "#BBF7D0", icon: "✓", iconBg: "#22C55E", iconColor: "white", label: "Good" },
};

function AlertCard({ alert }) {
  const style = SEVERITY[alert.severity] || SEVERITY.info;

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: style.bg, borderColor: style.border }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: style.iconBg, color: style.iconColor }}
        >
          {style.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold text-gray-900">{alert.title}</p>
            {alert.time && <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{alert.time}</span>}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{alert.detail}</p>
        </div>
      </div>
    </div>
  );
}

function generateAlerts(statement, debtors) {
  if (!statement) return [];
  const alerts = [];
  const s = statement.summary;
  const currency = statement.currency || "NGN";

  // Health score
  if (s.financialHealthScore < 40) {
    alerts.push({
      id: "health-critical",
      severity: "critical",
      title: "Financial health is critical",
      detail: `Your score is ${s.financialHealthScore}/100. ${statement.recommendation?.message || "Review your spending immediately."}`,
      time: "Latest",
    });
  } else if (s.financialHealthScore < 65) {
    alerts.push({
      id: "health-warning",
      severity: "warning",
      title: "Financial health needs attention",
      detail: `Score: ${s.financialHealthScore}/100. Your expenses are growing faster than revenue.`,
      time: "Latest",
    });
  }

  // Cash flow declining
  if (s.cashFlowTrend === "declining") {
    alerts.push({
      id: "cashflow",
      severity: "warning",
      title: "Cash flow is declining",
      detail: "Revenue is trending downward compared to recent months. Consider reviewing your pricing and expenses.",
      time: "Latest",
    });
  }

  // High expense ratio
  if (s.totalIncome > 0 && s.totalExpenses / s.totalIncome > 0.85) {
    const ratio = ((s.totalExpenses / s.totalIncome) * 100).toFixed(0);
    alerts.push({
      id: "expense-ratio",
      severity: "critical",
      title: "Expenses consuming most of revenue",
      detail: `${ratio}% of your income went to expenses this period. Profit margin is very thin.`,
      time: "Latest",
    });
  }

  // Overdue debtors
  const overdueDebtors = (debtors || []).filter((d) => d.status === "overdue");
  if (overdueDebtors.length > 0) {
    const total = overdueDebtors.reduce((sum, d) => sum + d.amount, 0);
    alerts.push({
      id: "overdue-debtors",
      severity: "warning",
      title: `${overdueDebtors.length} customer${overdueDebtors.length > 1 ? "s" : ""} overdue`,
      detail: `${fmt(total, currency)} in overdue payments. Send WhatsApp reminders from the Debtors tab.`,
      time: "Now",
    });
  }

  // Top expense spike
  const topExpense = (s.categoryBreakdown || [])
    .filter((c) => c.type === "expense")
    .sort((a, b) => b.total - a.total)[0];
  if (topExpense && s.totalExpenses > 0 && topExpense.total / s.totalExpenses > 0.4) {
    alerts.push({
      id: "expense-spike",
      severity: "info",
      title: `${topExpense.category} is your biggest cost`,
      detail: `${fmt(topExpense.total, currency)} — ${((topExpense.total / s.totalExpenses) * 100).toFixed(0)}% of total expenses. Monitor this category closely.`,
      time: "Latest",
    });
  }

  // Positive: healthy
  if (s.financialHealthScore >= 70) {
    alerts.push({
      id: "healthy",
      severity: "positive",
      title: "Business is financially healthy",
      detail: `Health score: ${s.financialHealthScore}/100. Keep managing your cash flow and expenses well.`,
      time: "Latest",
    });
  }

  // Profit milestone
  if (s.netProfit > 0) {
    alerts.push({
      id: "profit",
      severity: "positive",
      title: `You made ${fmt(s.netProfit, currency)} in net profit`,
      detail: `${s.profitMargin?.toFixed(1)}% profit margin this period. ${s.cashFlowTrend === "improving" ? "Trend is improving." : ""}`,
      time: "Latest",
    });
  }

  // Recommendation tips as info alerts
  (statement.recommendation?.tips || []).slice(0, 2).forEach((tip, i) => {
    alerts.push({
      id: `tip-${i}`,
      severity: "info",
      title: "Recommendation",
      detail: tip,
    });
  });

  return alerts;
}

export default function AlertsPage() {
  const { statement, loadingStatement, debtors } = useDashboard();
  const alerts = generateAlerts(statement, debtors);

  const critical = alerts.filter((a) => a.severity === "critical");
  const warnings = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");
  const positive = alerts.filter((a) => a.severity === "positive");

  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Alerts</h1>
      <p className="text-sm text-gray-500 mb-5">Unusual activity and things to watch.</p>

      {loadingStatement && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {!loadingStatement && !statement && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-base font-bold text-gray-900 mb-2">No alerts yet</p>
          <p className="text-sm text-gray-500">Upload a bank statement to see alerts and anomaly detection for your business.</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {[...critical, ...warnings, ...info, ...positive].map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
