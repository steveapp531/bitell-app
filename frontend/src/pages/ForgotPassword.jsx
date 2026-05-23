// ============================================================
//  src/pages/auth/ForgotPasswordPage.jsx
//
//  Flow: user enters email → POST /api/auth/forgot-password →
//  backend emails a reset link → show success state.
//  Always shows success (backend never reveals if email exists).
// ============================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";
import { authAPI } from "../utils/api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30
                          flex items-center justify-center text-2xl">
            📬
          </div>
          <p className="text-slate-300 text-sm text-center leading-relaxed">
            If <span className="text-white font-medium">{email}</span> is registered,
            you'll receive a password reset link within a few minutes.
          </p>
          <p className="text-slate-500 text-xs text-center">
            Check your spam folder if you don't see it.
          </p>
          <Link
            to="/login"
            className="mt-2 w-full py-2.5 rounded-xl text-center bg-slate-800
                       hover:bg-slate-700 text-slate-300 text-sm transition-all border border-slate-700"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ada@mybusiness.com"
          required
        />
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400
                     disabled:bg-slate-700 disabled:text-slate-500
                     text-slate-950 font-semibold text-sm transition-all
                     shadow-lg shadow-emerald-500/20"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
        <Link
          to="/login"
          className="text-center text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ← Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}