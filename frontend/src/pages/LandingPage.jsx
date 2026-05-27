import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";

const chartData = {
  month: [120, 160, 140, 190, 220, 210, 240],
  quarter: [90, 130, 170, 195, 225, 210, 260, 240, 280, 300, 320, 340],
  year: [120, 140, 130, 160, 190, 220, 210, 230, 250, 280, 310, 340],
};

const rangeLabels = {
  month: "Last 30 days",
  quarter: "Last 90 days",
  year: "Last 12 months",
};

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: "#EBF7F2" }}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function IndustryPill({ name }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: "#EBF7F2", border: "1px solid #A7F3D0", color: "#0C2218" }}
    >
      {name}
    </span>
  );
}

function StatPill({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-green-300">{label}</p>
    </div>
  );
}

const INDUSTRIES = [
  "Restaurants", "Salons & beauty", "Pharmacies", "Mini-marts",
  "Fashion brands", "Logistics", "Online vendors", "Distributors",
  "Agencies", "Retail stores", "Small manufacturers", "Catering",
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Cash Flow Intelligence",
    description: "Know your safe-to-spend amount, predict cash shortages, and see exactly where your money is going, before problems hit.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Ask Bitell Anything",
    description: "\"How much did I make today?\" \"Can I afford new inventory?\" Get instant, plain-English answers from your personal financial assistant.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Payments & Collections",
    description: "Track who owes you money and what you owe, send reminders and stay on top of cash flow.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Fraud & Leakage Alerts",
    description: "Catch unusual withdrawals, duplicate payments, and suspicious patterns automatically. Protect your business from financial leakage.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Business Memory",
    description: "Bitell learns your restocking cycles, spending patterns, and seasonal trends. It remembers what you forget, so you can plan ahead.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Tax & Record Ready",
    description: "Auto-generate income summaries, expense reports, and profit/loss statements. Stay ready whenever records are needed, no scrambling.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your transactions",
    description: "Drop your PDF or CSV of your transactions. Bitell reads it instantly, no formatting required.",
  },
  {
    step: "02",
    title: "Bitell analyses everything",
    description: "Transactions are categorised, trends detected, and cash flow is computed automatically.",
  },
  {
    step: "03",
    title: "See your complete picture",
    description: "Dashboard, insights, alerts, and forecasts, all updated every time you upload.",
  },
  {
    step: "04",
    title: "Ask questions, take action",
    description: "Chat with Bitell about your money. Get recommendations. Make confident decisions.",
  },
];

export default function LandingPage() {
  const [selectedRange, setSelectedRange] = useState("month");

  const activeSeries = chartData[selectedRange];
  const totalCash = activeSeries.reduce((sum, value) => sum + value, 0) * 12000;
  const growth = selectedRange === "month" ? 18 : selectedRange === "quarter" ? 27 : 34;
  const minValue = Math.min(...activeSeries);
  const maxValue = Math.max(...activeSeries);
  const chartPoints = activeSeries.map((value, index) => ({
    x: (index / (activeSeries.length - 1)) * 100,
    y: 100 - ((value - minValue) / (maxValue - minValue)) * 80,
  }));
  const chartPath = chartPoints.map((point, i) => `${i === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Logo dark />
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: "#0C2218" }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="text-center lg:text-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{ backgroundColor: "#EBF7F2", borderColor: "#A7F3D0", color: "#0C2218" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Financial Operating System for African Businesses
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto lg:mx-0">
              See your business money clearly, from every transaction to cash flow.
            </h1>

            <p className="text-lg text-gray-500 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Bitell turns your transactions into intelligent forecasting, alerts, payments tracking and actionable decisions, without accounting headaches.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "#0C2218" }}
              >
                Start for free, no card needed
                <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live cash flow</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-4xl font-bold text-slate-900">₦{(totalCash / 1000).toFixed(1)}k</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    +{growth}%
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{rangeLabels[selectedRange]}</p>
              </div>

              <div className="inline-flex rounded-full bg-slate-100 p-1">
                {Object.keys(rangeLabels).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selectedRange === range ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:text-emerald-700"}`}
                  >
                    {range === "month" ? "30d" : range === "quarter" ? "90d" : "12m"}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-[1.75rem] bg-transparent p-4">
                <svg viewBox="0 0 100 100" className="h-52 w-full">
                  <defs>
                    <linearGradient id="heroGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#BBF7D0" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#BBF7D0" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="100" height="100" fill="#F8FAF6" />
                  <path d={`${chartPath} L100 100 L0 100 Z`} fill="url(#heroGradient)" />
                  <path d={chartPath} fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
                  {chartPoints.map((point, index) => (
                    <circle key={index} cx={point.x} cy={point.y} r="3" fill="#16A34A" opacity="0.9" />
                  ))}
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Transactions</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{activeSeries.length * 12}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Average ticket</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">₦68k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── Trusted by (replacing generic stat bar) ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#0C2218" }}>Trusted by</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Thousands of African small businesses use Bitell to turn transactions into clarity. From retail and hospitality to logistics and e-commerce.</p>
        </div>
      </section>

      {/* ── Who it's for ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <p className="text-sm font-semibold text-center uppercase tracking-widest mb-4" style={{ color: "#0C2218" }}>
          Who it's for
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4 max-w-2xl mx-auto">
          Built for serious businesses that don't need an accountant on speed dial
        </h2>
        <p className="text-base text-gray-500 text-center max-w-xl mx-auto mb-10">
          From ₦500k to ₦20M+ monthly. If your business runs through a bank account, Bitell works for you.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {INDUSTRIES.map((name) => <IndustryPill key={name} name={name} />)}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#0C2218" }}>
            What Bitell does
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-3 max-w-2xl mx-auto">
            Not just a dashboard. A financial operating system.
          </h2>
          <p className="text-base text-gray-500 text-center max-w-xl mx-auto mb-12">
            The clarity and control you need to run your business without flying blind.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Real pain points ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#0C2218" }}>The real problem</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-tight">
              Most business owners are financially reactive, not proactive
            </h2>
            <div className="flex flex-col gap-3">
              {[
                "Cash runs out and you don't know why",
                "Personal and business money are mixed together",
                "You have no idea if you're actually profitable",
                "Debtors are tracked in your head or a notebook",
                "Every financial decision feels like a guess",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-red-100">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#0C2218" }}>Bitell changes this</p>
            <div className="flex flex-col gap-3">
              {[
                "See your cash position clearly every day",
                "Separate business from personal spending automatically",
                "Know your profit margin at a glance",
                "Track debtors and send reminders from one screen",
                "Make confident decisions with real financial data",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-green-100">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#0C2218" }}>
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-14">Up and running in minutes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step}>
                <div className="text-4xl font-black mb-4 leading-none" style={{ color: "#D1FAE5" }}>
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questions Bitell can answer ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#0C2218" }}>Ask Bitell</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Questions your business needs answered</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Where is my money going?",
            "How much can I safely spend this week?",
            "Am I actually profitable?",
            "Why is cash always finishing?",
            "Who owes me money and for how long?",
            "Is my business healthy?",
            "Are my staff leaking money?",
            "Can I survive next month?",
            "What expenses are becoming dangerous?",
          ].map((q) => (
            <div
              key={q}
              className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">{q}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#0C2218" }}>
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stop guessing. Start knowing.</h2>
          <p className="text-lg text-green-300 mb-10">
            Clarity, control, and confidence, for every business that takes its money seriously.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-white hover:bg-gray-100 transition-colors"
            style={{ color: "#0C2218" }}
          >
            Get started free
            <svg width="16" height="16" fill="none" stroke="#0C2218" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-sm text-green-400 mt-4">No credit card required · 14-day free trial</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items:center justify-between gap-4">
          <Logo dark />
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Bitell. Financial Operating System for African Businesses.
          </p>
          <div className="flex gap-5 text-sm text-gray-400">
            <Link to="/login" className="hover:text-gray-700">Sign in</Link>
            <Link to="/register" className="hover:text-gray-700">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
