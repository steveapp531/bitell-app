import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { uploadStatement } from "../../utils/api.js";

// ── Helpers ───────────────────────────────────────────────────

function getGreeting(name) {
  const h = new Date().getHours();
  const time = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  return `Good ${time}, ${name?.split(" ")[0] || "there"} 👋`;
}

function fmt(val, currency = "NGN") {
  if (!val && val !== 0) return "—";
  if (Math.abs(val) >= 1_000_000)
    return `${currency === "NGN" ? "₦" : currency}${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000)
    return `${currency === "NGN" ? "₦" : currency}${Math.round(val / 1_000)}k`;
  return `${currency === "NGN" ? "₦" : currency}${val.toLocaleString()}`;
}

function currencySymbol(code) {
  const map = { NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "GH₵", KES: "KSh", ZAR: "R" };
  return map[code] || code;
}

function buildWeeklyData(trends = []) {
  if (!trends || trends.length === 0) return [];
  const last8 = trends.slice(-8);
  return last8.map((t, i) => ({
    label: `W${i + 1}`,
    income: t.income || 0,
    expenses: t.expenses || 0,
  }));
}

// ── Upload drop zone (for quick action) ──────────────────────
function UploadModal({ onClose, onSuccess }) {
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      setState("uploading");
      setError("");
      try {
        const data = await uploadStatement(file, (p) => {
          setProgress(p);
          if (p === 100) setState("processing");
        });
        onSuccess(data);
      } catch (err) {
        setError(err.response?.data?.message || "Upload failed. Try again.");
        setState("error");
      }
    },
    [onSuccess]
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-1">Upload bank statement</h2>
        <p className="text-gray-500 text-sm mb-5">PDF, CSV, or TXT from your bank</p>

        {state === "idle" || state === "error" ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#0C2218] transition-colors">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mb-3">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Tap to choose file</span>
            <span className="text-xs text-gray-400 mt-1">Max 10MB</span>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <input type="file" accept=".pdf,.csv,.txt" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </label>
        ) : (
          <div className="flex flex-col items-center py-8 gap-3">
            <svg className="animate-spin w-10 h-10 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-gray-600 text-sm font-medium">
              {state === "uploading" ? `Uploading… ${progress}%` : "Analysing transactions…"}
            </p>
          </div>
        )}

        <button onClick={onClose} className="mt-4 w-full py-3 text-gray-500 text-sm font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function HomePage({ onTabChange }) {
  const { user } = useAuth();
  const { statement, loadingStatement, reloadStatement } = useDashboard();
  const [showUpload, setShowUpload] = useState(false);

  const s = statement?.summary;
  const currency = statement?.currency || "NGN";
  const sym = currencySymbol(currency);

  // Current month figures from monthlyTrends
  const currentMonth = s?.monthlyTrends?.slice(-1)[0];
  const availableCash = s ? (s.netProfit || 0) : null;
  const healthScore = s?.financialHealthScore || 0;
  const healthStatus = healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Fair" : "At Risk";
  const healthColor = healthScore >= 70 ? "#22C55E" : healthScore >= 40 ? "#F59E0B" : "#EF4444";

  const weeklyData = buildWeeklyData(s?.monthlyTrends);

  // Recent transactions — last 5
  const recentTxns = statement?.transactions?.slice(-5).reverse() || [];

  // Personal withdrawals from category breakdown
  const personalWithdrawals = s?.categoryBreakdown?.find(
    (c) => c.category === "Other Expense" || c.category === "Personal"
  )?.total || 0;

  const handleUploadSuccess = () => {
    setShowUpload(false);
    reloadStatement();
  };

  // Quick actions
  const quickActions = [
    {
      id: "upload",
      label: "Upload",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => setShowUpload(true),
    },
    {
      id: "ask",
      label: "Ask Bitell",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => onTabChange("ask"),
    },
    {
      id: "insights",
      label: "Insights",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => onTabChange("insights"),
    },
    {
      id: "debtors",
      label: "Debtors",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => onTabChange("debtors"),
    },
  ];

  return (
    <div className="px-4 pt-5 pb-4">
      {/* Greeting */}
      <p className="text-base text-gray-600 mb-0.5">{getGreeting(user?.name)}</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-5">
        Here's how your business is doing.
      </h1>

      {/* Available Cash card */}
      <div
        className="rounded-2xl p-5 mb-4 text-white"
        style={{ backgroundColor: "#0C2218" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold tracking-widest text-green-300 uppercase">Available Cash</p>
          {s && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: healthColor, color: "white" }}
            >
              {healthStatus}
            </span>
          )}
        </div>
        <p className="text-4xl font-bold mb-4 font-mono">
          {loadingStatement ? (
            <span className="opacity-50 text-2xl">Loading…</span>
          ) : availableCash !== null ? (
            `${sym}${Math.abs(availableCash).toLocaleString()}`
          ) : (
            <span className="text-xl font-normal opacity-70">Upload a statement to start</span>
          )}
        </p>
        {s && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ backgroundColor: "#163829" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86EFAC" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7v10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs text-green-300">In this month</span>
              </div>
              <p className="text-base font-bold font-mono">{fmt(currentMonth?.income, currency)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: "#163829" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2.5">
                  <path d="M17 7L7 17M7 17h10M7 17V7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs text-red-300">Out this month</span>
              </div>
              <p className="text-base font-bold font-mono">{fmt(currentMonth?.expenses, currency)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-[#0C2218]">{action.icon}</div>
            <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>

      {/* BITELL NOTICED */}
      {statement?.recommendation && (
        <div
          className="rounded-2xl p-4 mb-4 border"
          style={{ backgroundColor: "#EBF7F2", borderColor: "#A7F3D0" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#0C2218" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Bitell Noticed</span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{statement.recommendation.message}</p>
        </div>
      )}

      {/* 8-week chart */}
      {weeklyData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-0.5">Last {weeklyData.length} months</p>
          <p className="text-xs text-gray-400 mb-4">Revenue vs expenses</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0C2218" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0C2218" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => fmt(val, currency)}
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="income" stroke="#0C2218" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-[#0C2218]" />
              <span className="text-xs text-gray-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-red-400 border-dashed" />
              <span className="text-xs text-gray-500">Expenses</span>
            </div>
          </div>
        </div>
      )}

      {/* Personal withdrawals (if detected) */}
      {s && personalWithdrawals > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">Owner withdrawals</span>
            </div>
            <span className="text-sm font-bold text-gray-900 font-mono">{fmt(personalWithdrawals, currency)}</span>
          </div>
          {s.totalIncome > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-2">
                {((personalWithdrawals / s.totalIncome) * 100).toFixed(0)}% of revenue went to personal accounts
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-red-500"
                  style={{ width: `${Math.min(100, (personalWithdrawals / s.totalIncome) * 100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent transactions */}
      {recentTxns.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-900">Recent transactions</p>
            <button
              onClick={() => onTabChange("insights")}
              className="text-xs font-semibold text-[#0C2218] hover:underline"
            >
              See all
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {recentTxns.map((txn, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: txn.type === "income" ? "#0C2218" : "#6B7280" }}
                >
                  {txn.description?.substring(0, 2).toUpperCase() || "TX"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{txn.description}</p>
                  <p className="text-xs text-gray-400">{txn.category}</p>
                </div>
                <span
                  className="text-sm font-bold font-mono flex-shrink-0"
                  style={{ color: txn.type === "income" ? "#16A34A" : "#DC2626" }}
                >
                  {txn.type === "income" ? "+" : "-"}{sym}{txn.amount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — no statement */}
      {!loadingStatement && !statement && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">No financial data yet</p>
          <p className="text-sm text-gray-500 mb-5">Upload your bank statement to see your full financial picture.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#0C2218" }}
          >
            Upload statement
          </button>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
