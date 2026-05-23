// ============================================================
//  src/components/dashboard/KpiCard.jsx — Metric Summary Card
//
//  WHY: KPI cards are the "hero numbers" of the dashboard.
//  Extracting them as a reusable component means we can render
//  Revenue, Expenses, Profit, and Margin with one consistent
//  design just by passing different props.
// ============================================================

import React from "react";

/**
 * @param {Object}  props
 * @param {string}  props.label       — card title e.g. "Total Revenue"
 * @param {string}  props.value       — formatted value to display e.g. "$12,500.00"
 * @param {string}  props.icon        — emoji or SVG shorthand
 * @param {string}  props.accent      — Tailwind color key: "emerald"|"red"|"blue"|"amber"
 * @param {string}  [props.sublabel]  — small text below the value
 * @param {boolean} [props.isPositive]— controls green/red coloring for profit
 */
export default function KpiCard({ label, value, icon, accent, sublabel, isPositive }) {
  // Map accent keys to Tailwind class sets
  const accentMap = {
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      value: "text-emerald-400",
      glow: "shadow-emerald-500/5",
    },
    red: {
      icon: "bg-red-500/10 text-red-400 border-red-500/20",
      value: "text-red-400",
      glow: "shadow-red-500/5",
    },
    blue: {
      icon: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      value: "text-blue-400",
      glow: "shadow-blue-500/5",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      value: "text-amber-400",
      glow: "shadow-amber-500/5",
    },
  };

  // If isPositive is explicitly provided, override value color for profit display
  let valueColorClass = accentMap[accent]?.value || "text-white";
  if (isPositive !== undefined) {
    valueColorClass = isPositive ? "text-emerald-400" : "text-red-400";
  }

  const colors = accentMap[accent] || accentMap.blue;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-slate-900 border border-slate-800
        p-6 shadow-xl ${colors.glow}
        transition-transform duration-200 hover:-translate-y-0.5
      `}
    >
      {/* Subtle radial gradient glow in top-right corner */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, var(--tw-gradient-stops))`,
        }}
      />

      {/* ── Top Row: Icon + Label ──────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        {/* Icon badge */}
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center
                      text-lg ${colors.icon}`}
        >
          {icon}
        </div>
      </div>

      {/* ── Value (hero number) ───────────────────────────── */}
      <div className={`text-2xl font-bold font-financial tracking-tight mb-1 ${valueColorClass}`}>
        {value}
      </div>

      {/* ── Label ─────────────────────────────────────────── */}
      <div className="text-slate-400 text-sm font-medium">{label}</div>

      {/* ── Optional Sublabel ─────────────────────────────── */}
      {sublabel && (
        <div className="text-slate-600 text-xs mt-1">{sublabel}</div>
      )}
    </div>
  );
}