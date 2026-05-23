import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your 14-day free trial — no credit card required."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          label="Full name"
          type="text"
          value={form.name}
          onChange={set("name")}
          placeholder="Your full name"
          error={errors.name}
          required
        />
        <AuthInput
          label="Email address"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@yourbusiness.com"
          error={errors.email}
          required
        />
        <AuthInput
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder="At least 8 characters"
          error={errors.password}
          required
        />
        <AuthInput
          label="Confirm password"
          type="password"
          value={form.confirm}
          onChange={set("confirm")}
          placeholder="Repeat password"
          error={errors.confirm}
          required
        />

        {apiError && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {apiError}
          </div>
        )}

        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-start">
          <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
          <p className="text-emerald-300 text-xs leading-relaxed">
            14-day free trial starts immediately. Full access — no payment needed.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400
                     disabled:bg-slate-700 disabled:text-slate-500
                     text-slate-950 font-semibold text-sm transition-all duration-150
                     shadow-lg shadow-emerald-500/20 mt-1"
        >
          {loading ? "Creating account…" : "Create account & start trial"}
        </button>

        <p className="text-center text-slate-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
