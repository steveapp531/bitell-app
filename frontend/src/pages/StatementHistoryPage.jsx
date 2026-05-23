import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatementHistory, getStatementById } from "../utils/api.js";
import { formatCurrency, formatPercent } from "../utils/formatters.js";

function HealthBadge({ score }) {
  if (score === undefined || score === null) return null;
  const color = score >= 70 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${color}`}>
      {score}/100
    </span>
  );
}

function StatusBadge({ margin }) {
  if (margin === undefined || margin === null) return null;
  const [color, label] =
    margin >= 20 ? ["text-emerald-400 bg-emerald-500/10 border-emerald-500/20", "Healthy"]
    : margin >= 5 ? ["text-amber-400 bg-amber-500/10 border-amber-500/20", "Fair"]
    : margin >= 0 ? ["text-orange-400 bg-orange-500/10 border-orange-500/20", "Thin"]
    : ["text-red-400 bg-red-500/10 border-red-500/20", "Loss"];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${color}`}>{label}</span>
  );
}

export default function StatementHistoryPage({ onLoad }) {
  const navigate = useNavigate();
  const [statements, setStatements] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [loadingId, setLoadingId]   = useState(null);

  useEffect(() => {
    getStatementHistory()
      .then(data => setStatements(data.statements || []))
      .catch(() => setError("Failed to load statement history."))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (id) => {
    setLoadingId(id);
    try {
      const res = await getStatementById(id);
      if (res.success && onLoad) {
        onLoad(res.statement);
        navigate("/dashboard");
      }
    } catch {
      setError("Failed to load statement.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-6 pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Statement History</h1>
            <p className="text-slate-500 text-sm mt-1">
              All previously analysed statements — click any to reload its dashboard.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400
                       text-slate-950 text-sm font-semibold transition-all
                       shadow-lg shadow-emerald-500/20"
          >
            + New Statement
          </button>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && statements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No statements uploaded yet.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-all"
            >
              Upload your first statement
            </button>
          </div>
        )}

        {/* Statement list */}
        {!loading && !error && statements.length > 0 && (
          <div className="space-y-3">
            {statements.map((s) => {
              const currency = s.currency || s.summary?.currency || "USD";
              const fmt = (v) => formatCurrency(v, currency);
              const isProfit = (s.summary?.netProfit || 0) >= 0;

              return (
                <button
                  key={s._id}
                  onClick={() => handleOpen(s._id)}
                  disabled={!!loadingId}
                  className="w-full text-left bg-slate-900 border border-slate-800
                             hover:border-slate-600 rounded-2xl p-5 transition-all
                             hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20
                             disabled:opacity-50 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                    {/* File icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700
                                    flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-semibold truncate">{s.filename}</p>
                        <StatusBadge margin={s.summary?.profitMargin} />
                        <HealthBadge score={s.summary?.financialHealthScore} />
                        {currency && currency !== "USD" && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            {currency}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-slate-500 text-xs">
                          {new Date(s.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        {s.periodStart && s.periodEnd && (
                          <>
                            <span className="text-slate-700 text-xs">·</span>
                            <span className="text-slate-500 text-xs">
                              {s.periodStart} → {s.periodEnd}
                            </span>
                          </>
                        )}
                        {s.summary?.transactionCount && (
                          <>
                            <span className="text-slate-700 text-xs">·</span>
                            <span className="text-slate-500 text-xs">
                              {s.summary.transactionCount} transactions
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* KPI summary */}
                    <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-emerald-400 font-mono text-sm font-semibold">
                          {fmt(s.summary?.totalIncome)}
                        </div>
                        <div className="text-slate-600 text-xs">Revenue</div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-mono text-sm font-semibold">
                          {fmt(s.summary?.totalExpenses)}
                        </div>
                        <div className="text-slate-600 text-xs">Expenses</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-mono text-sm font-semibold ${isProfit ? "text-white" : "text-red-400"}`}>
                          {formatPercent(s.summary?.profitMargin)}
                        </div>
                        <div className="text-slate-600 text-xs">Margin</div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-slate-800 group-hover:bg-slate-700
                                      flex items-center justify-center transition-colors">
                        {loadingId === s._id
                          ? <div className="w-3 h-3 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
                          : <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        }
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
