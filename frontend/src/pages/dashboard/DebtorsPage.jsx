import React, { useState } from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { debtorsAPI } from "../../utils/api.js";

function fmt(val, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency;
  if (!val && val !== 0) return "—";
  if (Math.abs(val) >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${sym}${Math.round(val / 1_000)}k`;
  return `${sym}${val.toLocaleString()}`;
}

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getDueLabel(debtor) {
  if (debtor.status === "paid") return { label: "Paid", color: "#16A34A" };
  if (!debtor.dueDate) return { label: "Outstanding", color: "#6B7280" };
  const now = new Date();
  const due = new Date(debtor.dueDate);
  const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: "#EF4444" };
  if (diffDays === 0) return { label: "Due today", color: "#F59E0B" };
  return { label: `due in ${diffDays}d`, color: "#6B7280" };
}

function buildWhatsAppLink(phone, name, amount, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency;
  const msg = encodeURIComponent(
    `Hi ${name}, just a friendly reminder that you have an outstanding balance of ${sym}${amount?.toLocaleString()} with us. Please let us know when you can settle. Thank you! 🙏`
  );
  const number = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${number || ""}?text=${msg}`;
}

function AddDebtorModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", amount: "", dueDate: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) return;
    setSaving(true);
    setError("");
    try {
      await debtorsAPI.create(form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Add debtor</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Customer name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20"
            required
          />
          <input
            type="text"
            placeholder="What they owe for (e.g. Wedding catering)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20"
          />
          <input
            type="number"
            placeholder="Amount owed *"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20"
            required
            min="0"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Due date (optional)</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20"
              />
            </div>
          </div>
          <input
            type="tel"
            placeholder="Phone for WhatsApp (optional)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={saving || !form.name || !form.amount}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-1 disabled:opacity-50"
            style={{ backgroundColor: "#0C2218" }}
          >
            {saving ? "Saving…" : "Add debtor"}
          </button>
        </form>
        <button onClick={onClose} className="mt-3 w-full py-2.5 text-gray-500 text-sm">Cancel</button>
      </div>
    </div>
  );
}

function DebtorCard({ debtor, onMarkPaid, onDelete }) {
  const { label, color } = getDueLabel(debtor);
  const isPaid = debtor.status === "paid";

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm ${isPaid ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: "#0C2218" }}
          >
            {getInitials(debtor.name)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{debtor.name}</p>
            {debtor.description && <p className="text-xs text-gray-500">{debtor.description}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 font-mono">{fmt(debtor.amount)}</p>
          <p className="text-xs font-medium" style={{ color }}>{label}</p>
        </div>
      </div>

      {!isPaid && (
        <div className="flex gap-2">
          <a
            href={buildWhatsAppLink(debtor.phone, debtor.name, debtor.amount)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white"
            style={{ backgroundColor: "#22C55E" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send WhatsApp reminder
          </a>
          <button
            onClick={() => onMarkPaid(debtor._id)}
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Mark paid
          </button>
          <button
            onClick={() => onDelete(debtor._id)}
            className="p-2.5 rounded-xl text-gray-400 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function DebtorsPage() {
  const { debtors, debtorStats, loadingDebtors, reloadDebtors } = useDashboard();
  const [showAdd, setShowAdd] = useState(false);

  const activeDebtors = debtors.filter((d) => d.status !== "paid");
  const paidDebtors = debtors.filter((d) => d.status === "paid");

  const handleMarkPaid = async (id) => {
    try {
      await debtorsAPI.update(id, { status: "paid" });
      reloadDebtors();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this debtor?")) return;
    try {
      await debtorsAPI.delete(id);
      reloadDebtors();
    } catch {}
  };

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Debtors</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
          style={{ backgroundColor: "#0C2218" }}
        >
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">People who owe you money.</p>

      {/* Summary cards */}
      {debtors.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: "#0C2218" }}>
            <p className="text-xs text-green-300 mb-1">Outstanding</p>
            <p className="text-xl font-bold font-mono">{fmt(debtorStats.totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Overdue</p>
            <p className="text-xl font-bold text-gray-900">
              {debtorStats.overdueCount} <span className="text-sm font-normal text-gray-500">customers</span>
            </p>
          </div>
        </div>
      )}

      {loadingDebtors && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {!loadingDebtors && activeDebtors.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">No debtors yet</p>
          <p className="text-sm text-gray-500 mb-5">Track customers who owe you money and send WhatsApp reminders.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#0C2218" }}
          >
            Add first debtor
          </button>
        </div>
      )}

      {/* Active debtors */}
      {activeDebtors.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {activeDebtors.map((d) => (
            <DebtorCard
              key={d._id}
              debtor={d}
              onMarkPaid={handleMarkPaid}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Paid debtors */}
      {paidDebtors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Paid</p>
          <div className="flex flex-col gap-2">
            {paidDebtors.map((d) => (
              <DebtorCard
                key={d._id}
                debtor={d}
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddDebtorModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); reloadDebtors(); }}
        />
      )}
    </div>
  );
}
