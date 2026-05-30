import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  ink: "#0C2218",
  ink2: "#1a3d2a",
  g50: "#EBF7F2",
  g100: "#A7F3D0",
  g300: "#34d399",
  g500: "#10b981",
  g700: "#059669",
  red: "#ef4444",
  amber: "#f59e0b",
  bg: "#f8faf9",
  border: "#e5e7eb",
  muted: "#6b7280",
  faint: "#9ca3af",
};
const MONO = "'JetBrains Mono', monospace";

/* ── Hero dashboard data ───────────────────────────────────── */
const RANGES = {
  "30d": {
    data: [120, 160, 140, 190, 220, 210, 240],
    amount: "₦4,280,000",
    badge: "18%",
    profit: "₦820k",
    profitTag: "▲ 12% vs last period",
    top: "Payroll",
    topPct: "48% of total spend",
    sub: "Last 30 days, updated just now",
    txns: 84,
  },
  "90d": {
    data: [90, 110, 130, 120, 150, 170, 195, 185, 220, 210, 240, 260],
    amount: "₦11,850,000",
    badge: "27%",
    profit: "₦2.1M",
    profitTag: "▲ 21% vs prior quarter",
    top: "Inventory",
    topPct: "35% of total spend",
    sub: "Last 90 days, updated just now",
    txns: 241,
  },
  "12m": {
    data: [120, 140, 130, 160, 190, 150, 220, 210, 230, 250, 280, 310],
    amount: "₦38,200,000",
    badge: "34%",
    profit: "₦7.6M",
    profitTag: "▲ 34% vs last year",
    top: "Payroll",
    topPct: "41% of total spend",
    sub: "Last 12 months, updated just now",
    txns: 968,
  },
};
const RANGE_ORDER = ["30d", "90d", "12m"];

/* ── Replaced counters strip (no fabricated stats) ─────────── */
const COUNTERS = [
  { value: "Zero", label: "Accounting skills needed" },
  { value: "24/7", label: "AI financial assistant" },
  { value: "<60s", label: "Time to insight" },
  { value: "14d", label: "Free trial" },
];

/* ── Monthly intelligence data ─────────────────────────────── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INCOME = [3.1, 2.8, 3.6, 4.2, 3.9, 4.8, 5.1, 4.6, 5.3, 5.8, 6.1, 6.5];
const EXPENSES = [2.4, 2.5, 2.6, 2.8, 3.1, 3.2, 3.9, 3.4, 3.7, 3.8, 4.0, 4.2];
const STORIES = [
  "January was a solid start, with income of ₦3.1M and costs under control. Profit margin: 22.6%.",
  "February dipped slightly. Revenue fell 9.7%, so watch for seasonal patterns here.",
  "March recovered strongly. A 28.6% income jump pushed profit margin to 27.8%.",
  "April continued growing, with strong revenue at ₦4.2M. Expenses are rising, so keep an eye on it.",
  "May saw expenses spike 10.7% while income dipped. Margin compressed to 20.5%.",
  "June was your best month yet, with ₦4.8M income and a 33.3% margin. What drove this?",
  "July: highest income to date (₦5.1M) but expenses jumped 21.9%. Margin at 23.5%.",
  "August was a correction. Costs fell while income stayed strong. Margin: 26.1%.",
  "September: steady growth, with ₦5.3M income and a healthy 30.2% margin.",
  "October continued strong. Income up 9.4%. Expenses stable.",
  "November: growth accelerating, with ₦6.1M income and a strong 34.4% margin.",
  "December: your best month. ₦6.5M income at a 35.4% margin, an excellent year.",
];

/* ── Industries ────────────────────────────────────────────── */
const INDUSTRIES = [
  { emoji: "🍽️", name: "Restaurants" },
  { emoji: "💅", name: "Salons & beauty" },
  { emoji: "💊", name: "Pharmacies" },
  { emoji: "🛒", name: "Mini-marts" },
  { emoji: "👗", name: "Fashion brands" },
  { emoji: "🚚", name: "Logistics" },
  { emoji: "📦", name: "Online vendors" },
  { emoji: "🏭", name: "Distributors" },
  { emoji: "💼", name: "Agencies" },
  { emoji: "🏪", name: "Retail stores" },
  { emoji: "🔧", name: "Manufacturers" },
  { emoji: "🍱", name: "Catering" },
];

/* ── Questions ─────────────────────────────────────────────── */
const QUESTIONS = [
  "Where is my money going?",
  "Am I actually profitable?",
  "Can I afford new inventory?",
  "Why is cash always finishing?",
  "Is my business healthy?",
  "Can I survive next month?",
  "What expenses are dangerous?",
  "Are my staff leaking money?",
  "Who owes me money?",
];

/* ── Icons ─────────────────────────────────────────────────── */
const featureIcon = {
  cashflow: (
    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  ask: (
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  fraud: (
    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
  ),
  monthly: (
    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  memory: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  tax: (
    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const FEATURES = [
  {
    icon: featureIcon.cashflow,
    title: "Cash Flow Intelligence",
    description: "Know your safe-to-spend amount, predict shortages before they hit, and see where every naira goes.",
  },
  {
    icon: featureIcon.ask,
    title: "Ask Bitell Anything",
    description: '"Can I afford new inventory?" "Am I profitable?" Plain-English answers straight from your data.',
  },
  {
    icon: featureIcon.fraud,
    title: "Fraud & Leakage Alerts",
    description: "Unusual withdrawals, duplicate payments, and suspicious patterns caught automatically.",
  },
  {
    icon: featureIcon.monthly,
    title: "Monthly Breakdowns",
    description: "Select any month, compare performance, and understand what drove the numbers, good or bad.",
  },
  {
    icon: featureIcon.memory,
    title: "Business Memory",
    description: "Bitell learns your patterns, cycles, and seasonal trends, remembering what you can't.",
  },
  {
    icon: featureIcon.tax,
    title: "Tax & Record Ready",
    description: "Auto-generate P&L summaries and expense reports. Always ready, with no last-minute scramble.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Upload your statement",
    description: "Drop your PDF or CSV. Any bank, any format, no cleanup required.",
    icon: <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    num: "02",
    title: "Bitell analyses everything",
    description: "Transactions categorised, trends detected, and cash flow computed automatically.",
    icon: <path d="M21 12a9 9 0 11-3-6.7M21 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    num: "03",
    title: "See your complete picture",
    description: "Dashboard, insights, alerts, and monthly breakdowns, all updated live.",
    icon: <path d="M4 20h16M7 16V9m5 7V5m5 11v-4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    num: "04",
    title: "Ask questions, take action",
    description: "Chat with Bitell, get recommendations, and make confident decisions.",
    icon: <path d="M21 12a8 8 0 01-11.3 7.3L4 21l1.7-5.7A8 8 0 1121 12z" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

/* ── Helpers ───────────────────────────────────────────────── */
function buildSparkline(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((v - min) / span) * 80,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  return { pts, path };
}

/* ── Small components ──────────────────────────────────────── */
function Eyebrow({ children, dotColor = C.g500 }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.08em]"
      style={{ backgroundColor: C.g50, border: `1px solid ${C.g100}`, color: C.ink2 }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div
      className="bg-white rounded-[18px] p-6 transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      style={{ border: `1px solid ${C.border}` }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: C.g50, border: `1px solid ${C.g100}` }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.8">
          {icon}
        </svg>
      </div>
      <h3 className="text-[15px] font-bold mb-2 tracking-[-0.3px]" style={{ color: C.ink }}>{title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{description}</p>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function LandingPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [selectedMonth, setSelectedMonth] = useState(6);

  useEffect(() => {
    const id = "bitell-google-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const r = RANGES[selectedRange];
  const { pts, path } = buildSparkline(r.data);
  const barMax = 8;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Sora', sans-serif", color: C.ink }}>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-10 py-4 flex items-center justify-between">
          <Logo dark />
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
              style={{ color: C.muted, border: `1px solid ${C.border}` }}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: C.ink }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-10 pt-14 pb-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left */}
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <Eyebrow>Financial Operating System</Eyebrow>
            </div>
            <h1 className="font-extrabold leading-[1.08] tracking-[-2px] mb-5 text-4xl sm:text-5xl lg:text-[48px]" style={{ color: C.ink }}>
              Your business,<br />
              <span style={{ color: C.g700 }}>financially clear,</span><br />
              at last.
            </h1>
            <p className="text-base leading-[1.7] mb-8 max-w-md mx-auto lg:mx-0" style={{ color: C.muted }}>
              Bitell turns your transactions into intelligent forecasting, alerts, payments tracking, and actionable decisions, without the accounting headaches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: C.ink }}
              >
                Start for free, no card needed
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-medium transition-colors"
                style={{ backgroundColor: C.g50, border: `1px solid ${C.g100}`, color: C.ink }}
              >
                Sign in
              </Link>
            </div>
            <div className="mt-7 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex">
                {[
                  { l: "A", bg: "#10b981" },
                  { l: "K", bg: "#0891b2" },
                  { l: "T", bg: "#7c3aed" },
                  { l: "O", bg: "#dc2626" },
                ].map((a, i) => (
                  <div
                    key={a.l}
                    className="w-7 h-7 rounded-full border-2 border-white text-[11px] font-semibold flex items-center justify-center text-white"
                    style={{ backgroundColor: a.bg, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {a.l}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: C.faint }}>
                Trusted by African businesses, from retail to logistics.
              </p>
            </div>
          </div>

          {/* Right — live dashboard card */}
          <div
            className="rounded-[24px] bg-white p-6"
            style={{ border: `1px solid ${C.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: C.faint }}>
                  Cash flow overview
                </p>
                <p className="text-[32px] font-bold tracking-[-1px]" style={{ color: C.ink, fontFamily: MONO }}>
                  {r.amount}
                </p>
                <p className="text-xs mt-1" style={{ color: C.faint }}>{r.sub}</p>
              </div>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#dcfce7", color: "#15803d", fontFamily: MONO }}
              >
                ▲ {r.badge}
              </span>
            </div>

            {/* Range pills */}
            <div className="inline-flex gap-1 rounded-full p-[3px]" style={{ backgroundColor: C.bg }}>
              {RANGE_ORDER.map((range) => {
                const active = selectedRange === range;
                return (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
                    style={{
                      backgroundColor: active ? "#fff" : "transparent",
                      color: active ? C.ink : C.muted,
                      boxShadow: active ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {range}
                  </button>
                );
              })}
            </div>

            {/* Sparkline */}
            <div className="my-4 overflow-hidden rounded-2xl">
              <svg viewBox="0 0 100 100" className="h-36 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={C.g500} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={C.g500} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={`${path} L100 100 L0 100 Z`} fill="url(#heroGradient)" />
                <path d={path} fill="none" stroke={C.g500} strokeWidth="2.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.6" fill={C.g500} />
                ))}
              </svg>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl p-3.5" style={{ backgroundColor: C.bg }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: C.faint }}>
                  Net profit
                </p>
                <p className="text-lg font-bold" style={{ color: C.ink, fontFamily: MONO }}>{r.profit}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: C.g700 }}>{r.profitTag}</p>
              </div>
              <div className="rounded-2xl p-3.5" style={{ backgroundColor: C.bg }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: C.faint }}>
                  Top expense
                </p>
                <p className="text-lg font-bold" style={{ color: C.ink, fontFamily: MONO }}>{r.top}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: C.muted }}>{r.topPct}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Counters strip ───────────────────────────────────── */}
      <div style={{ backgroundColor: C.ink }} className="py-12">
        <div className="max-w-6xl mx-auto px-5 sm:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {COUNTERS.map((c) => (
            <div key={c.label} className="text-center">
              <p className="text-[40px] font-extrabold tracking-[-2px] text-white" style={{ fontFamily: MONO }}>
                {c.value}
              </p>
              <p className="text-xs mt-1 tracking-[0.04em]" style={{ color: C.g300 }}>{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem / Solution ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Without */}
          <div>
            <Eyebrow dotColor={C.red}>Without Bitell</Eyebrow>
            <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-5 mb-6 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
              Flying blind on<br />your own money.
            </h2>
            <div className="flex flex-col gap-3.5">
              {[
                "Cash runs out and you don't know why or when",
                "No idea whether you're actually profitable",
                "Every financial decision is a guess",
                "Spreadsheets that are always out of date",
              ].map((p) => (
                <div key={p} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#fee2e2" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: C.muted }}>{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* With — income/expense visual */}
          <div>
            <Eyebrow>With Bitell</Eyebrow>
            <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-5 mb-6 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
              Complete clarity,<br /><span style={{ color: C.g700 }}>every month.</span>
            </h2>
            <div className="rounded-[20px] p-6" style={{ backgroundColor: C.g50, border: `1px solid ${C.g100}` }}>
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: C.faint }}>Income</p>
                  <p className="text-[22px] font-bold" style={{ color: C.g700, fontFamily: MONO }}>₦5.1M</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: C.faint }}>Expenses</p>
                  <p className="text-[22px] font-bold" style={{ color: C.red, fontFamily: MONO }}>₦3.9M</p>
                </div>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-white mb-2.5">
                <div style={{ width: "57%", backgroundColor: C.g500 }} />
                <div style={{ width: "43%", backgroundColor: C.red }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px]" style={{ color: C.muted }}>Net profit</span>
                <span className="text-lg font-bold" style={{ color: C.ink, fontFamily: MONO }}>
                  ₦1.2M <span className="text-[13px] font-medium" style={{ color: C.g700 }}>23.5%</span>
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: "Sales Revenue", amt: "₦5.1M", w: "100%", color: C.g500, op: 1 },
                  { label: "Payroll", amt: "₦1.87M", w: "48%", color: C.red, op: 0.7 },
                  { label: "Rent & Utilities", amt: "₦780k", w: "20%", color: C.amber, op: 0.85 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[11px] mb-1" style={{ color: C.muted }}>
                      <span>{row.label}</span>
                      <span style={{ fontFamily: MONO }}>{row.amt}</span>
                    </div>
                    <div className="h-1.5 rounded bg-white overflow-hidden">
                      <div style={{ width: row.w, height: "100%", backgroundColor: row.color, opacity: row.op, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.bg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          <div className="text-center mb-12">
            <Eyebrow>What Bitell does</Eyebrow>
            <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-4 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
              Not a dashboard.<br /><span style={{ color: C.g700 }}>A financial operating system.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Monthly intelligence ─────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <Eyebrow>Monthly intelligence</Eyebrow>
            <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-5 mb-5 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
              See every month<br /><span style={{ color: C.g700 }}>clearly.</span>
            </h2>
            <p className="text-[15px] leading-[1.7] mb-6" style={{ color: C.muted }}>
              Click any month to isolate its performance. Track whether income grew, whether costs are rising, and get a plain-language summary of what the numbers mean.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Income vs expenses, month by month",
                "% change vs previous month, automatically",
                '"What happened this month" narrative',
              ].map((b) => (
                <div key={b} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: C.g500 }} />
                  <span className="text-[13px]" style={{ color: C.muted }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive monthly chart */}
          <div className="rounded-[20px] p-5" style={{ backgroundColor: C.bg }}>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {MONTHS.map((m, i) => {
                const active = selectedMonth === i;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(i)}
                    className="px-2.5 py-1 rounded-2xl text-[11px] font-medium transition-all"
                    style={{
                      backgroundColor: active ? C.ink : "#fff",
                      color: active ? "#fff" : C.muted,
                      border: `1px solid ${active ? C.ink : C.border}`,
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            <div className="flex items-end gap-1.5" style={{ height: 160 }}>
              {MONTHS.map((m, i) => {
                const hi = selectedMonth === i;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(i)}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <div className="flex items-end justify-center gap-[2px] w-full" style={{ height: 134 }}>
                      <div
                        className="w-1/2 rounded-t"
                        style={{
                          height: `${(INCOME[i] / barMax) * 134}px`,
                          backgroundColor: hi ? C.g500 : "rgba(16,185,129,0.22)",
                          transition: "background-color 0.2s",
                        }}
                      />
                      <div
                        className="w-1/2 rounded-t"
                        style={{
                          height: `${(EXPENSES[i] / barMax) * 134}px`,
                          backgroundColor: hi ? C.red : "rgba(239,68,68,0.18)",
                          transition: "background-color 0.2s",
                        }}
                      />
                    </div>
                    <span className="text-[9px] mt-1.5" style={{ color: hi ? C.ink : C.faint, fontFamily: MONO }}>{m}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-3 mb-1">
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: C.muted }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: C.g500 }} /> Income
              </span>
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: C.muted }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: C.red }} /> Expenses
              </span>
            </div>

            <div className="mt-2 p-3.5 bg-white rounded-2xl" style={{ border: `1px solid ${C.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: C.faint }}>
                What happened
              </p>
              <p className="text-[13px] leading-[1.6]" style={{ color: C.muted }}>{STORIES[selectedMonth]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.bg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-10 text-center">
          <Eyebrow>Who it's for</Eyebrow>
          <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-4 mb-3 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
            Built for serious businesses<br />that run through a bank account.
          </h2>
          <p className="text-[15px] max-w-md mx-auto mb-8" style={{ color: C.muted }}>
            From ₦500k to ₦20M+ monthly. Any industry, any size.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {INDUSTRIES.map((ind) => (
              <span
                key={ind.name}
                className="px-4 py-2 rounded-2xl text-[13px] font-medium"
                style={{ backgroundColor: C.g50, border: `1px solid ${C.g100}`, color: C.ink2 }}
              >
                {ind.emoji} {ind.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-10 py-20">
        <div className="text-center mb-10">
          <Eyebrow>Ask Bitell</Eyebrow>
          <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-4 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
            Questions your<br /><span style={{ color: C.g700 }}>business needs answered.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {QUESTIONS.map((q) => (
            <div
              key={q}
              className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl transition-colors"
              style={{ border: `1px solid ${C.border}` }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.g50 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.g500} strokeWidth="2.2">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[13px] font-medium" style={{ color: C.ink }}>{q}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.bg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          <div className="text-center mb-12">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] mt-4 text-3xl sm:text-[36px]" style={{ color: C.ink }}>
              Up and running<br /><span style={{ color: C.g700 }}>in minutes.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.num}>
                <div className="text-[48px] font-extrabold leading-none mb-3" style={{ color: C.g100, fontFamily: MONO }}>
                  {s.num}
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: C.g50 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.8">
                    {s.icon}
                  </svg>
                </div>
                <h3 className="text-[15px] font-bold mb-2 tracking-[-0.3px]" style={{ color: C.ink }}>{s.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: C.ink }}>
        <div className="max-w-xl mx-auto px-5 sm:px-10 text-center">
          <h2 className="font-extrabold tracking-[-1.5px] leading-[1.1] text-3xl sm:text-[40px] text-white mb-4">
            Stop guessing.<br />Start knowing.
          </h2>
          <p className="text-[15px] mb-9 leading-[1.6]" style={{ color: C.g300 }}>
            Clarity, control, and confidence, for every business that takes its money seriously.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl text-[15px] font-bold bg-white transition-colors hover:bg-gray-100"
            style={{ color: C.ink }}
          >
            Get started free
            <svg width="16" height="16" fill="none" stroke={C.ink} strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-xs mt-4" style={{ color: C.g700 }}>No credit card required · 14-day free trial</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-7" style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo dark />
          <p className="text-xs text-center" style={{ color: C.faint }}>
            © {new Date().getFullYear()} Bitell · Financial Operating System for African Businesses
          </p>
          <div className="flex gap-5">
            <Link to="/login" className="text-xs hover:opacity-70" style={{ color: C.faint }}>Sign in</Link>
            <Link to="/register" className="text-xs hover:opacity-70" style={{ color: C.faint }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}