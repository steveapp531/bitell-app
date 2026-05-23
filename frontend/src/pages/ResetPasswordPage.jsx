// ============================================================
//  src/pages/auth/ResetPasswordPage.jsx
//
//  Flow: user clicks email link → lands here with ?token=xxx →
//  enters new password → POST /api/auth/reset-password →
//  auto-login → navigate to /dashboard.
// ============================================================

import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { authAPI } from "../utils/api.js";

export default function ResetPasswordPage() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();
  const token           = params.get("token") || "";
  const { refreshUser } = useAuth();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  // Token missing from URL — show helpful error
  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="">
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm mb-4">
            This reset link is missing or invalid. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
          >
            Request new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, password);
      // Backend returns a fresh JWT — persist it
      localStorage.setItem("bitell_token", res.data.token);
      localStorage.setItem("bitell_user", JSON.stringify(res.data.user));
      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
        />
        <AuthInput
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat new password"
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
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthLayout>
  );
}