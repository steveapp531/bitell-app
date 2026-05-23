import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getPublicStats } from "../utils/api.js";

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

// ── Logo component reused across sections ─────────────────────
function BitellLogo({ size = "md" }) {
  const s = size === "lg" ? "w-10 h-10 text-base" : "w-8 h-8 text-sm";
  return (
    <div className={`${s} rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30`}>
      <span className="text-slate-950 font-black">B</span>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BitellLogo />
          <span className="text-white font-bold text-lg tracking-tight">
            Bi<span className="text-emerald-400">tell</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#pricing" className="hidden sm:block text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5">
            Pricing
          </a>
          <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400
                       text-slate-950 text-sm font-bold transition-all
                       shadow-lg shadow-emerald-500/25"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ statCount }) {
  const animated = useCountUp(statCount, 1800);
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-5 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#34d399 1px,transparent 1px),linear-gradient(90deg,#34d399 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Intelligence badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                        bg-emerald-500/10 border border-emerald-500/20 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium tracking-wide">
            Business Intelligence Made Simple
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-6 tracking-tight">
          Your <span className="text-emerald-400">complete financial</span>{" "}
          intelligence in minutes.
        </h1>

        <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          Stop living in spreadsheets. Bitell transforms your raw bank statements into 
          actionable business intelligence—revealing profitable trends, hidden inefficiencies, 
          and growth opportunities your competitors haven't found yet.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            to="/register"
            className="px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400
                       text-slate-950 text-base font-black transition-all
                       shadow-xl shadow-emerald-500/30 w-full sm:w-auto text-center"
          >
            Start your free 14-day trial →
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl border border-slate-700
                       hover:border-slate-600 text-slate-300 hover:text-white
                       text-base transition-all w-full sm:w-auto text-center"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* Live stats */}
        <div className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl
                        bg-slate-900/80 border border-slate-800 backdrop-blur">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {statCount > 0 ? animated.toLocaleString() : "2,000+"}
            </div>
            <div className="text-slate-500 text-xs mt-1">statements analysed</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-left">
            <div className="text-slate-300 text-sm font-semibold">Auto currency detection</div>
            <div className="text-slate-500 text-xs">NGN, USD, GHS, KES & more</div>
          </div>
          <div className="w-px h-10 bg-slate-800 hidden sm:block" />
          <div className="text-left hidden sm:block">
            <div className="text-slate-300 text-sm font-semibold">Any bank. Any format.</div>
            <div className="text-slate-500 text-xs">PDF or CSV supported</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: "📊",
      iconStyle: "font-black text-2xl text-emerald-400",
      title: "Profit by category",
      desc: "See exactly which product lines, service types, or business divisions are actually profitable. Close the ones that aren't.",
    },
    {
      icon: "📈",
      title: "Spot growth trends",
      desc: "Identify which revenue streams are accelerating, which are stalling, and where to double down. Month-by-month clarity.",
    },
    {
      icon: "💸",
      title: "Track cash flow in real-time",
      desc: "Know your actual cash position vs profit on paper. Avoid the cash flow crisis that kills businesses.",
    },
    {
      icon: "🎯",
      title: "Financial health scoring",
      desc: "A single 0–100 score combining profit margins, expense ratios, cash growth, and financial stability. Know if your business is healthy.",
    },
    {
      icon: "🔍",
      title: "Uncover expense patterns",
      desc: "Automatically detect which vendors, partners, or costs dominate your spending. Renegotiate the ones that matter most.",
    },
    {
      icon: "💡",
      title: "Get tactical recommendations",
      desc: "Bitell doesn't just show you data—it tells you what to do: reduce supplier dependency, cut subscription waste, or rebalance your revenue mix.",
    },
    {
      icon: "🌍",
      title: "Multi-currency support",
      desc: "Operate internationally with automatic detection of NGN, USD, GBP, EUR, GHS, KES, ZAR and more. Single dashboard, global business.",
    },
    {
      icon: "🔒",
      title: "Enterprise-grade security",
      desc: "Your financial data is encrypted and never shared. We own zero interest in your business information—only in making your platform secure.",
    },
  ];

  return (
    <section className="py-24 px-5 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Intelligence your competitors don't have
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Turn numbers into decisions. Every insight is built for business owners who move fast.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5
                         hover:-translate-y-1 hover:border-slate-700 transition-all duration-200"
            >
              <div className={`text-3xl mb-4 ${f.iconStyle || ""}`}>{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create your account",
      desc: "Sign up in 30 seconds. No credit card required. Get 14 days of full access to explore your business deeper.",
    },
    {
      num: "02",
      title: "Upload your bank statement",
      desc: "Drop any PDF or CSV file—any bank, any format. Bitell handles the messy parsing so you don't waste time.",
    },
    {
      num: "03",
      title: "Intelligence engine runs",
      desc: "Our platform instantly categorises transactions, detects patterns, calculates your financial health, and generates insights only human accountants would charge thousands for.",
    },
    {
      num: "04",
      title: "Make smarter business decisions",
      desc: "Revenue breakdowns, expense analysis, cash flow trends, and specific action items—everything you need to grow, delivered in seconds not days.",
    },
  ];

  return (
    <section className="py-24 px-5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">From statement to strategy in 60 seconds</h2>
          <p className="text-slate-400">Fast, accurate, and built for business velocity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4
                         hover:border-slate-700 transition-colors"
            >
              <div className="text-emerald-400 font-mono font-black text-xs opacity-50 w-8 flex-shrink-0 pt-0.5">
                {s.num}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1.5">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const profiles = [
    { emoji: "👗", type: "Fashion & Retail", desc: "Understand margins per location, per product line. Cut SKUs that drain profit. Scale what actually works." },
    { emoji: "🚚", type: "Logistics & Transport", desc: "Route profitability on demand. See which clients, lanes, or contracts are your profit engines. Fire the rest." },
    { emoji: "🍽️", type: "Food & Hospitality", desc: "Daily cash flow visibility. Know if today's service was profitable or you're burning money on low-margin traffic." },
    { emoji: "💼", type: "Professional Services", desc: "Track project profitability in real-time. Know which client relationships actually generate surplus. Raise prices accordingly." },
    { emoji: "🏗️", type: "Construction & Trades", desc: "Monitor job-level cash burn. Catch cost overruns before they become disasters. Protect project margins." },
    { emoji: "🏥", type: "Healthcare & Clinics", desc: "Revenue stream analysis. Which services drive profit? Which drain resources? Data-driven service mix decisions." },
    { emoji: "📱", type: "Tech & Agencies", desc: "Track recurring revenue vs CAC. Know which revenue stream, client, or product is your real profit engine." },
    { emoji: "🛒", type: "E-commerce", desc: "Full funnel visibility. Understand unit economics, CAC payback, and true profitability per channel or product." },
  ];

  return (
    <section className="py-24 px-5 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            Business intelligence for every industry
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Every business needs clarity on cash flow and profitability. Bitell is built for industries that operate on data.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <div
              key={p.type}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5
                         hover:border-emerald-500/20 transition-colors"
            >
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="text-white font-semibold text-sm mb-1.5">{p.type}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const quarterly = [
    "Unlimited statement uploads & analysis",
    "Multi-currency transaction intelligence",
    "Auto expense categorisation",
    "Monthly & annual profitability dashboards",
    "Financial health scoring",
    "Revenue & expense trending",
    "Email support",
  ];
  const annual = [
    ...quarterly,
    "Save 23% vs quarterly",
    "Priority support",
    "Early access to new features",
  ];

  return (
    <section className="py-24 px-5" id="pricing">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Investment that pays for itself</h2>
          <p className="text-slate-400">Most businesses make back their subscription cost in the first optimization Bitell suggests. 14-day free trial to prove it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Quarterly */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Quarterly</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-white font-mono">$29</span>
              <span className="text-slate-500 text-sm">/ 3 months</span>
            </div>
            <p className="text-emerald-400 text-xs font-mono mb-6">$9.67/month</p>
            <ul className="space-y-2.5 mb-8">
              {quarterly.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block w-full py-3 rounded-xl text-center bg-slate-800
                         hover:bg-slate-700 border border-slate-700
                         text-white text-sm font-bold transition-all"
            >
              Start free trial
            </Link>
          </div>

          {/* Annual */}
          <div className="relative bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-7">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full bg-emerald-500 text-slate-950
                               text-xs font-black shadow-lg shadow-emerald-500/30">
                Best value
              </span>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Annual</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-white font-mono">$89</span>
              <span className="text-slate-500 text-sm">/ year</span>
            </div>
            <p className="text-emerald-400 text-xs font-mono mb-6">$7.42/month · Save 23%</p>
            <ul className="space-y-2.5 mb-8">
              {annual.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block w-full py-3 rounded-xl text-center
                         bg-emerald-500 hover:bg-emerald-400
                         text-slate-950 text-sm font-black transition-all
                         shadow-lg shadow-emerald-500/25"
            >
              Start free trial
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-8">
          14-day free trial · Cancel anytime · 3-day grace period after expiry
        </p>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="py-24 px-5 border-t border-slate-800">
      <div className="max-w-2xl mx-auto text-center">
        <BitellLogo size="lg" />
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-6 mb-4 tracking-tight">
          Your financial intelligence advantage starts today.
        </h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          Join 2,000+ business owners who've replaced gut feeling with data.
          See exactly where money flows, what actually profits, and what to do about it.
        </p>
        <Link
          to="/register"
          className="inline-block px-10 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400
                     text-slate-950 font-black text-lg transition-all
                     shadow-2xl shadow-emerald-500/25"
        >
          Start your free 14-day trial →
        </Link>
        <p className="text-slate-700 text-sm mt-4">No credit card required.</p>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [statCount, setStatCount] = useState(0);

  useEffect(() => {
    getPublicStats().then((data) => {
      setStatCount(data.statementsAnalysed || 2000);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <NavBar />
      <HeroSection statCount={statCount} />
      <FeatureGrid />
      <HowItWorks />
      <WhoItsFor />
      <PricingSection />
      <FooterCTA />
      <footer className="border-t border-slate-900 py-8 px-5 text-center">
        <p className="text-slate-700 text-sm">
          © {new Date().getFullYear()} Bitell · Business Financial Intelligence
        </p>
      </footer>
    </div>
  );
}
