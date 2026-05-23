import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicStats } from "../utils/api.js";

// ── Logo ─────────────────────────────────────────────────────
function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: dark ? "white" : "#0C2218" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill={dark ? "#0C2218" : "white"} />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke={dark ? "#0C2218" : "white"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-[#0C2218]"}`}>Bitell</span>
    </div>
  );
}

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
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
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
    description: "Know your safe-to-spend amount, predict cash shortages, and see exactly where your money is going — before problems hit.",
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
    title: "Debtors & Collections",
    description: "Track who owes you money, when it's due, and send WhatsApp reminders in one tap. Never lose track of outstanding balances again.",
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
    description: "Bitell learns your restocking cycles, spending patterns, and seasonal trends. It remembers what you forget — so you can plan ahead.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Tax & Record Ready",
    description: "Auto-generate income summaries, expense reports, and profit/loss statements. Stay ready whenever records are needed — no scrambling.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload your bank statement",
    description: "Drop your PDF or CSV bank statement. Bitell reads it instantly — no formatting required.",
  },
  {
    step: "02",
    title: "Bitell analyses everything",
    description: "Transactions are categorised, trends detected, and cash flow is computed automatically.",
  },
  {
    step: "03",
    title: "See your complete picture",
    description: "Dashboard, insights, alerts, and forecasts — all updated every time you upload.",
  },
  {
    step: "04",
    title: "Ask questions, take action",
    description: "Chat with Bitell about your money. Get recommendations. Make confident decisions.",
  },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ statementsAnalysed: 0 });

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Logo />
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
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
          style={{ backgroundColor: "#EBF7F2", borderColor: "#A7F3D0", color: "#0C2218" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Financial Operating System for African Businesses
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
          Finally understand{" "}
          <span style={{ color: "#0C2218" }}>what's happening</span>{" "}
          with your business money
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Bitell turns your bank statement into a complete financial picture — cash flow, insights, alerts, and a financial assistant — built for restaurants, salons, shops, and every serious African business.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#0C2218" }}
          >
            Start for free — no card needed
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

        <p className="text-sm text-gray-400 mt-5">
          {stats.statementsAnalysed > 100
            ? `${stats.statementsAnalysed.toLocaleString()}+ statements analysed`
            : "Upload any bank statement · Results in seconds"}
        </p>
      </section>

      {/* ── Hero mock card ─────────────────────────────────────── */}
      <section className="max-w-sm mx-auto px-5 pb-20">
        <div className="rounded-3xl p-6 text-white shadow-2xl" style={{ backgroundColor: "#0C2218" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold tracking-widest text-green-300 uppercase">Available Cash</p>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500 text-white">Healthy</span>
          </div>
          <p className="text-4xl font-bold mb-5">₦1,524,000</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl p-3" style={{ backgroundColor: "#163829" }}>
              <p className="text-xs text-green-300 mb-1">↗ In this month</p>
              <p className="text-lg font-bold">₦1.6M</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: "#163829" }}>
              <p className="text-xs text-red-300 mb-1">↘ Out this month</p>
              <p className="text-lg font-bold">₦1.3M</p>
            </div>
          </div>
          <div className="rounded-xl p-3.5" style={{ backgroundColor: "#EBF7F2" }}>
            <p className="text-xs font-bold text-green-800 mb-1">BITELL NOTICED</p>
            <p className="text-xs text-gray-700">At your current spending rate, cash may run low in 9 days. The ₦450k rent is due next week.</p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: "#0C2218" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <StatPill value="10+" label="business types served" />
            <StatPill value="₦0" label="accounting knowledge needed" />
            <StatPill value="30s" label="from upload to insights" />
            <StatPill value="100%" label="built for African business" />
          </div>
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
              Most business owners are financially reactive — not proactive
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="2.5">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium text-gray-700">"{q}"</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#0C2218" }}>
        <div className="max-w-2xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Stop guessing. Start knowing.</h2>
          <p className="text-lg text-green-300 mb-10">
            Clarity, control, and confidence — for every business that takes its money seriously.
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
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
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
