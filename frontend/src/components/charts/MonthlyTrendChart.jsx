import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { formatCurrencyCompact, formatCurrency } from "../../utils/formatters.js";

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload || payload.length === 0) return null;
  const fmt = (v) => formatCurrency(v, currency);
  const net = (payload[0]?.value || 0) - (payload[1]?.value || 0);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3.5 shadow-2xl min-w-[160px]">
      <p className="text-slate-300 text-xs font-semibold mb-2.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs mb-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400 capitalize">{entry.name}:</span>
          <span className="font-mono text-white font-medium ml-auto">{fmt(entry.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="border-t border-slate-700 mt-2 pt-2 flex items-center gap-2 text-xs">
          <span className="text-slate-400">Net:</span>
          <span className={`font-mono font-semibold ml-auto ${net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {fmt(net)}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * @param {Array}   data          — monthlyTrends from summary
 * @param {string}  highlightMonth — rawMonth to highlight (e.g. "2024-03")
 * @param {string}  currency      — ISO 4217 code for axis labels
 */
export default function MonthlyTrendChart({ data, highlightMonth, currency = "USD" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No monthly data available
      </div>
    );
  }

  const compact = (v) => formatCurrencyCompact(v, currency);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          barCategoryGap="30%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={{ stroke: "#1e293b" }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={compact}
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "IBM Plex Mono" }}
            axisLine={false}
            tickLine={false}
            width={65}
          />

          <Tooltip
            content={<CustomTooltip currency={currency} />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />

          <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell
                key={entry.rawMonth}
                fill={
                  !highlightMonth || entry.rawMonth === highlightMonth
                    ? "#34d399"
                    : "#1e3a2f"
                }
              />
            ))}
          </Bar>

          <Bar dataKey="expenses" name="Expenses" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry) => (
              <Cell
                key={entry.rawMonth}
                fill={
                  !highlightMonth || entry.rawMonth === highlightMonth
                    ? "#f87171"
                    : "#3b1f1f"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
