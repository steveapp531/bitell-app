// ============================================================
//  src/pages/SubscribePage.jsx — Subscription / Paywall Screen
//
//  Shown when user.accessLevel === "blocked".
//  Displays the two plan options (Quarterly / Annual).
//  Payment integration is a stub — hook up Paystack/Stripe here.
// ============================================================

import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function SubscribePage() {
  const { user, logout } = useAuth();

  const plans = [
    {
      id: "quarterly",
      label: "Quarterly",
      badge: null,
      price: "$29",
      period: "/ 3 months",
      perMonth: "$9.67/mo",
      features: [
        "Unlimited statement uploads",
        "AI transaction categorisation",
        "Monthly & annual dashboards",
        "Financial health reports",
        "Email support",
      ],
    },
    {
      id: "annual",
      label: "Annual",
      badge: "Best value",
      price: "$89",
      period: "/ year",
      perMonth: "$7.42/mo",
      features: [
        "Everything in Quarterly",
        "Save 23% vs quarterly",
        "Priority support",
        "Early access to new features",
      ],
    },
  ];

  const handleSubscribe = (planId) => {
    // TODO: Integrate Paystack / Stripe here
    // 1. Create a checkout session on the backend
    // 2. Redirect user to payment page
    // 3. On success, backend updates user.plan + subscriptionEndsAt
    alert(`Payment integration coming soon. Plan selected: ${planId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#34d399 1px,transparent 1px),linear-gradient(90deg,#34d399 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-2xl z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-slate-950 font-black text-base">B</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Bi<span className="text-emerald-400">tell</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {user?.accessLevel === "readonly"
              ? "Your trial has ended"
              : "Subscribe to continue"}
          </h1>
          <p className="text-slate-400 text-base">
            Unlock full access to Bitell — your business financial intelligence platform.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-900 border rounded-2xl p-6
                ${plan.badge ? "border-emerald-500/50" : "border-slate-800"}`}
            >
              {/* Best value badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950
                                   text-xs font-bold shadow-lg shadow-emerald-500/30">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-slate-400 text-sm mb-1">{plan.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white font-mono">{plan.price}</span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-emerald-400 text-xs mt-1 font-mono">{plan.perMonth}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${plan.badge
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
              >
                Get {plan.label}
              </button>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <div className="text-center">
          <button
            onClick={logout}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}