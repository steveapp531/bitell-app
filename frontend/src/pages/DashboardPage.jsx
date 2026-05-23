import React, { useState, useMemo } from "react";
import KpiCard from "../components/dashboard/KpiCard.jsx";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart.jsx";
import RecommendationPanel from "../components/dashboard/RecomendationPanel.jsx";
import TransactionsTable from "../components/dashboard/TransactionsTable.jsx";
import { formatCurrency, formatPercent } from "../utils/formatters.js";

// ── Health score ring ─────────────────────────────────────────
function HealthScoreRing({ score }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "#34d399" : score >= 40 ? "#f59e0b" : "#f87171";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Fair" : "Weak";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="text-center -mt-14">
        <div className="text-2xl font-black font-mono" style={{ color }}>{score}</div>
        <div className="text-slate-500 text-xs mt-0.5">{label}</div>
      </div>
      <div className="mt-8 text-slate-500 text-xs">Health Score</div>
    </div>
  );
}

// ── Month selector bar ─────────────────────────────────────────
function MonthSelector({ months, selectedMonth, onSelect }) {
  return (
    <div className="flex gap-1 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
          ${!selectedMonth
            ? "bg-emerald-500 text-slate-950"
            : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          }`}
      >
        All time
      </button>
      {months.map(m => (
        <button
          key={m.rawMonth}
          onClick={() => onSelect(m.rawMonth === selectedMonth ? null : m.rawMonth)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${selectedMonth === m.rawMonth
              ? "bg-emerald-500 text-slate-950"
              : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}
        >
          {m.month}
        </button>
      ))}
    </div>
  );
}

// ── CSV export helper ──────────────────────────────────────────
function exportToCSV(transactions, currency, filename) {
  const header = "Date,Description,Category,Type,Amount,Currency";
  const rows = transactions.map(t =>
    `"${t.date || ""}","${(t.description || "").replace(/"/g, '""')}","${t.category}","${t.type}","${t.amount}","${currency}"`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename.replace(/\.[^/.]+$/, "")}_transactions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage({ data, onReset }) {
  const { transactions, summary, recommendation, filename, currency: rootCurrency } = data;
  const currency = rootCurrency || summary?.currency || "USD";

  const {
    totalIncome,
    totalExpenses,
    netProfit,
    profitMargin,
    transactionCount,
    monthlyTrends,
    categoryBreakdown,
    financialHealthScore,
    cashFlowTrend,
  } = summary;

  const [selectedMonth, setSelectedMonth] = useState(null);

  // ── Filtered data for selected month ──────────────────────
  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    return transactions.filter(t => t.date && t.date.slice(0, 7) === selectedMonth);
  }, [transactions, selectedMonth]);

  const monthSummary = useMemo(() => {
    if (!selectedMonth) return null;
    const monthData = monthlyTrends.find(m => m.rawMonth === selectedMonth);
    return monthData || null;
  }, [selectedMonth, monthlyTrends]);

  // Display totals — either full summary or selected month
  const displayIncome = monthSummary ? monthSummary.income : totalIncome;
  const displayExpenses = monthSummary ? monthSummary.expenses : totalExpenses;
  const displayProfit = monthSummary ? monthSummary.profit : netProfit;
  const displayMargin = displayIncome > 0
    ? parseFloat(((displayProfit / displayIncome) * 100).toFixed(1))
    : 0;

  const fmt = (v) => formatCurrency(v, currency);

  const cashFlowBadge = {
    improving: { label: "Improving", color: "text-emerald-400", dot: "bg-emerald-400" },
    declining:  { label: "Declining",  color: "text-red-400",     dot: "bg-red-400"     },
    stable:     { label: "Stable",     color: "text-amber-400",   dot: "bg-amber-400"   },
  }[cashFlowTrend || "stable"];

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Financial Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {filename} · {transactionCount} transactions · {currency}
            {cashFlowTrend && (
              <span className={`flex items-center gap-1 ${cashFlowBadge.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cashFlowBadge.dot}`} />
                Cash flow {cashFlowBadge.label}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filteredTransactions, currency, filename)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                       bg-slate-800 hover:bg-slate-700 border border-slate-700
                       text-slate-300 hover:text-white text-xs font-medium transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400
                       text-slate-950 text-sm font-semibold transition-all
                       shadow-lg shadow-emerald-500/20"
          >
            + New Statement
          </button>
        </div>
      </div>

      {/* ── Month selector ──────────────────────────────────── */}
      {monthlyTrends.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-white text-sm font-semibold">Monthly Breakdown</p>
            <p className="text-slate-500 text-xs">Select a month to view its data individually</p>
          </div>
          <MonthSelector
            months={monthlyTrends}
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
          {selectedMonth && monthSummary && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
              <span className="text-emerald-400 text-xs font-medium">
                Showing {monthSummary.month}
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-slate-500 text-xs">
                {filteredTransactions.length} transactions
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={fmt(displayIncome)}
          icon="💰"
          accent="emerald"
          sublabel={selectedMonth ? monthlyTrends.find(m => m.rawMonth === selectedMonth)?.month : "All income"}
        />
        <KpiCard
          label="Total Expenses"
          value={fmt(displayExpenses)}
          icon="📉"
          accent="red"
          sublabel={selectedMonth ? "Selected month" : "All expenses"}
        />
        <KpiCard
          label="Net Profit"
          value={fmt(Math.abs(displayProfit))}
          icon={displayProfit >= 0 ? "📈" : "⚠️"}
          accent={displayProfit >= 0 ? "emerald" : "red"}
          isPositive={displayProfit >= 0}
          sublabel={displayProfit >= 0 ? "Revenue surplus" : "Operating at a loss"}
        />
        <KpiCard
          label="Profit Margin"
          value={formatPercent(displayMargin)}
          icon="🎯"
          accent={displayMargin >= 20 ? "emerald" : displayMargin >= 5 ? "amber" : "red"}
          isPositive={displayMargin >= 0}
          sublabel="Net margin on revenue"
        />
      </div>

      {/* ── Recommendation panel ────────────────────────────── */}
      {!selectedMonth && <RecommendationPanel recommendation={recommendation} />}

      {/* ── Monthly chart + Health Score ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">Monthly Cash Flow</h3>
              <p className="text-slate-500 text-xs mt-0.5">Income vs expenses by month</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />Expenses
              </span>
            </div>
          </div>
          <MonthlyTrendChart
            data={monthlyTrends}
            highlightMonth={selectedMonth}
            currency={currency}
          />
        </div>

        {/* Health score panel */}
        {financialHealthScore !== undefined && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-4">
            <HealthScoreRing score={financialHealthScore} />
            <div className="w-full space-y-2 border-t border-slate-800 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Profit Margin</span>
                <span className={profitMargin >= 15 ? "text-emerald-400" : profitMargin >= 5 ? "text-amber-400" : "text-red-400"}>
                  {formatPercent(profitMargin)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cash Flow</span>
                <span className={cashFlowBadge?.color || "text-slate-400"}>
                  {cashFlowBadge?.label || "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Months</span>
                <span className="text-slate-300">{monthlyTrends.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Category breakdown + Statement summary ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Category breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-1">Top Categories</h3>
          <p className="text-slate-500 text-xs mb-5">Spend by category</p>
          <div className="space-y-3">
            {categoryBreakdown.slice(0, 6).map((cat) => {
              const max = categoryBreakdown[0]?.total || 1;
              const pct = Math.round((cat.total / max) * 100);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 text-xs truncate max-w-[130px]">{cat.category}</span>
                    <span className={`font-mono text-xs font-medium ${cat.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {fmt(cat.total)}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${cat.type === "income" ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statement summary stats */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-1">Statement Summary</h3>
          <p className="text-slate-500 text-xs mb-5">Overview of all AI-detected transactions</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: "Income Transactions",
                value: filteredTransactions.filter(t => t.type === "income").length,
                color: "text-emerald-400",
              },
              {
                label: "Expense Transactions",
                value: filteredTransactions.filter(t => t.type === "expense").length,
                color: "text-red-400",
              },
              {
                label: "Transaction Categories",
                value: new Set(filteredTransactions.map(t => t.category)).size,
                color: "text-blue-400",
              },
              {
                label: "Months Covered",
                value: monthlyTrends.length,
                color: "text-amber-400",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Transactions table ──────────────────────────────── */}
      <TransactionsTable transactions={filteredTransactions} currency={currency} />
    </div>
  );
}
