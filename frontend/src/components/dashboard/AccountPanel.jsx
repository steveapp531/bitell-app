import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { authAPI } from "../../utils/api.js";

export default function AccountPanel() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [values, setValues] = useState({
    name: "",
    businessName: "",
    location: "",
    monthlyRevenue: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) return;
    setValues({
      name: user.name || "",
      businessName: user.businessName || "",
      location: user.location || "",
      monthlyRevenue: user.monthlyRevenue || "",
      avatarUrl: user.avatarUrl || "",
    });
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }, [user]);

  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt) - Date.now()) / 86400000))
    : null;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await authAPI.updateMe({
        name: values.name,
        businessName: values.businessName,
        location: values.location,
        monthlyRevenue: values.monthlyRevenue,
        avatarUrl: values.avatarUrl,
      });
      await refreshUser();
      setMessage("Profile updated successfully.");
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <section className="w-full bg-white border border-slate-200 shadow-sm rounded-[32px] p-5 mt-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-950 text-white flex items-center justify-center text-2xl font-semibold">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-16 h-16 rounded-3xl object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
            <h2 className="text-2xl font-semibold text-slate-950">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-3xl shadow-xl p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900 mb-2">Notifications</p>
                <p className="text-slate-500">No new notifications yet. Any alerts about your account will appear here.</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Business</p>
          <p className="mt-2 font-medium text-slate-950">{user.businessName || "Not set"}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Location</p>
          <p className="mt-2 font-medium text-slate-950">{user.location || "Not set"}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Revenue</p>
          <p className="mt-2 font-medium text-slate-950">{user.monthlyRevenue || "Not set"}</p>
        </div>
      </div>

      {trialDaysLeft !== null && (
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Your trial ends in {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"}.
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowEditModal(true);
            setError("");
            setMessage("");
          }}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          Edit profile
        </button>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                Full name
                <input
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Business name
                <input
                  name="businessName"
                  value={values.businessName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Location
                <input
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                Monthly revenue
                <input
                  name="monthlyRevenue"
                  value={values.monthlyRevenue}
                  onChange={handleChange}
                  placeholder="e.g. ₦2,500,000"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                Avatar image URL
                <input
                  name="avatarUrl"
                  value={values.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </label>
            </div>

            {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
            {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  await handleSave();
                }}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

