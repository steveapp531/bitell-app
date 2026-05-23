import React, { useState } from "react";

export default function RecommendationPanel({ recommendation }) {
  const [expanded, setExpanded] = useState(true);

  if (!recommendation) return null;

  const { status, message, tips } = recommendation;

  const statusConfig = {
    healthy: {
      label: "Financially Healthy",
      icon: "✓",
      border: "border-emerald-500/25",
      bg: "bg-emerald-500/[0.04]",
      headerBg: "bg-emerald-500/8",
      iconBg: "bg-emerald-500/15 text-emerald-400",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      tipDot: "bg-emerald-400",
      tipLine: "border-emerald-500/20",
    },
    warning: {
      label: "Needs Attention",
      icon: "⚠",
      border: "border-amber-500/25",
      bg: "bg-amber-500/[0.04]",
      headerBg: "",
      iconBg: "bg-amber-500/15 text-amber-400",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      tipDot: "bg-amber-400",
      tipLine: "border-amber-500/20",
    },
    critical: {
      label: "Action Required",
      icon: "!",
      border: "border-red-500/25",
      bg: "bg-red-500/[0.04]",
      headerBg: "",
      iconBg: "bg-red-500/15 text-red-400",
      badge: "bg-red-500/15 text-red-400 border-red-500/25",
      tipDot: "bg-red-400",
      tipLine: "border-red-500/20",
    },
  };

  const cfg = statusConfig[status] || statusConfig.warning;

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${cfg.iconBg}`}>
            {cfg.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">Financial Health Report</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              AI-generated recommendations based on your statement
            </p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-6 space-y-5">
          {/* Summary message */}
          <p className="text-slate-200 text-sm leading-relaxed border-t border-white/5 pt-4">
            {message}
          </p>

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="space-y-3">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                Action Items
              </p>
              {tips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-3.5 rounded-xl bg-slate-800/40 border ${cfg.tipLine}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full ${cfg.tipDot} opacity-80
                                flex-shrink-0 flex items-center justify-center
                                text-slate-950 text-xs font-bold mt-0.5`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
