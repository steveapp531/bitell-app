import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { debtorsAPI, payablesAPI } from "../../utils/api.js";

// ── Shared helpers ────────────────────────────────────────────
function fmt(val) {
  if (!val && val !== 0) return "—";
  if (Math.abs(val) >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `₦${Math.round(val / 1_000)}k`;
  return `₦${Number(val).toLocaleString()}`;
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function getDueLabel(item) {
  if (item.status === "paid") return { label: "Paid", color: "#16A34A" };
  if (!item.dueDate) return { label: "Outstanding", color: "#6B7280" };
  const diffDays = Math.round((new Date(item.dueDate) - new Date()) / 86400000);
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, color: "#EF4444" };
  if (diffDays === 0) return { label: "Due today", color: "#F59E0B" };
  return { label: `due in ${diffDays}d`, color: "#6B7280" };
}

const PAYABLE_CATEGORIES = [
  "Rent", "Salary / Payroll", "Supplier", "Utilities", "Tax",
  "Loan Repayment", "Equipment", "Professional Services",
  "Insurance", "Logistics", "Inventory", "Other",
];

// ── WhatsApp reminder modal ───────────────────────────────────
function WhatsAppModal({ name, amount, phone, businessName, onClose }) {
  const template = `Hi ${name},\n\nJust a friendly reminder that you have an outstanding balance of ₦${Number(amount).toLocaleString()}.\n\nPlease let us know when you can settle.\n\nThank you!\nFrom ${businessName || "us"}`;
  const [message, setMessage] = useState(template);

  const handleSend = () => {
    const number = (phone || "").replace(/\D/g, "");
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#22C55E" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">WhatsApp Reminder</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Edit the message below before sending.</p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none leading-relaxed"
        />

        <button
          onClick={handleSend}
          className="w-full mt-4 py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#22C55E" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Send via WhatsApp
        </button>
        <button onClick={onClose} className="mt-2 w-full py-2.5 text-gray-500 text-sm">Cancel</button>
      </div>
    </div>
  );
}

// ── Add Debtor modal ──────────────────────────────────────────
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
        <h2 className="text-xl font-bold text-gray-900 mb-5">Add receivable</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Customer name *" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" required />
          <input type="text" placeholder="What they owe for (e.g. goods supplied)" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" />
          <input type="number" placeholder="Amount owed *" value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" required min="0" />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due date (optional)</label>
            <input type="date" value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" />
          </div>
          <input type="tel" placeholder="Phone for WhatsApp reminder (optional)" value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving || !form.name || !form.amount}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-1 disabled:opacity-50"
            style={{ backgroundColor: "#0C2218" }}>
            {saving ? "Saving…" : "Add receivable"}
          </button>
        </form>
        <button onClick={onClose} className="mt-3 w-full py-2.5 text-gray-500 text-sm">Cancel</button>
      </div>
    </div>
  );
}

// ── Debtor card ───────────────────────────────────────────────
function DebtorCard({ debtor, businessName, onMarkPaid, onDelete }) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const { label, color } = getDueLabel(debtor);
  const isPaid = debtor.status === "paid";

  return (
    <>
      <div className={`bg-white rounded-2xl p-4 shadow-sm ${isPaid ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: "#0C2218" }}>
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
            <button
              onClick={() => setShowWhatsApp(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white"
              style={{ backgroundColor: "#22C55E" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Send reminder
            </button>
            <button onClick={() => onMarkPaid(debtor._id)}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Paid
            </button>
            <button onClick={() => onDelete(debtor._id)}
              className="p-2.5 rounded-xl text-gray-400 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {showWhatsApp && (
        <WhatsAppModal
          name={debtor.name}
          amount={debtor.amount}
          phone={debtor.phone}
          businessName={businessName}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </>
  );
}

// ── Receivables tab ───────────────────────────────────────────
function ReceivablesTab({ businessName }) {
  const { debtors, debtorStats, loadingDebtors, reloadDebtors } = useDashboard();
  const [showAdd, setShowAdd] = useState(false);

  const active = debtors.filter((d) => d.status !== "paid");
  const paid = debtors.filter((d) => d.status === "paid");

  const handleMarkPaid = async (id) => {
    try { await debtorsAPI.update(id, { status: "paid" }); reloadDebtors(); } catch {}
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this record?")) return;
    try { await debtorsAPI.delete(id); reloadDebtors(); } catch {}
  };

  return (
    <div>
      {debtors.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: "#0C2218" }}>
            <p className="text-xs text-green-300 mb-1">Outstanding</p>
            <p className="text-xl font-bold font-mono">{fmt(debtorStats.totalOutstanding)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Overdue</p>
            <p className="text-xl font-bold text-gray-900">
              {debtorStats.overdueCount} <span className="text-sm font-normal text-gray-500">records</span>
            </p>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(true)}
        className="w-full mb-5 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-[#0C2218] hover:text-[#0C2218] transition-colors flex items-center justify-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add receivable
      </button>

      {loadingDebtors && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {!loadingDebtors && active.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" strokeLinecap="round" />
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">No receivables yet</p>
          <p className="text-sm text-gray-500">Track customers who owe you money. Send WhatsApp reminders with a tap.</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {active.map((d) => (
            <DebtorCard key={d._id} debtor={d} businessName={businessName}
              onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Collected</p>
          <div className="flex flex-col gap-2">
            {paid.map((d) => (
              <DebtorCard key={d._id} debtor={d} businessName={businessName}
                onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddDebtorModal onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); reloadDebtors(); }} />
      )}
    </div>
  );
}

// ── Add Payable modal ─────────────────────────────────────────
function AddPayableModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    payee: "", description: "", amount: "", dueDate: "",
    category: "Other", isRecurring: false, recurringFrequency: "", phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.payee.trim() || !form.amount) return;
    setSaving(true);
    setError("");
    try {
      await payablesAPI.create({
        ...form,
        recurringFrequency: form.isRecurring ? form.recurringFrequency || "monthly" : null,
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Add payable</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="text" placeholder="Payee / vendor name *" value={form.payee}
            onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" required />
          <input type="text" placeholder="What is this for? (e.g. January rent)" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" />
          <input type="number" placeholder="Amount *" value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" required min="0" />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20 bg-white">
            {PAYABLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due date (optional)</label>
            <input type="date" value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" />
          </div>
          <input type="tel" placeholder="Payee phone (optional)" value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20" />

          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-6 rounded-full transition-colors relative ${form.isRecurring ? "bg-[#0C2218]" : "bg-gray-200"}`}
              onClick={() => setForm((f) => ({ ...f, isRecurring: !f.isRecurring }))}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isRecurring ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700">Recurring payment</span>
          </label>

          {form.isRecurring && (
            <select value={form.recurringFrequency}
              onChange={(e) => setForm((f) => ({ ...f, recurringFrequency: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none bg-white">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving || !form.payee || !form.amount}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-1 disabled:opacity-50"
            style={{ backgroundColor: "#0C2218" }}>
            {saving ? "Saving…" : "Add payable"}
          </button>
        </form>
        <button onClick={onClose} className="mt-3 w-full py-2.5 text-gray-500 text-sm">Cancel</button>
      </div>
    </div>
  );
}

// ── Payable card ──────────────────────────────────────────────
function PayableCard({ payable, onMarkPaid, onDelete }) {
  const { label, color } = getDueLabel(payable);
  const isPaid = payable.status === "paid";

  const categoryColor = {
    "Rent": "#8B5CF6", "Salary / Payroll": "#3B82F6", "Supplier": "#F59E0B",
    "Utilities": "#06B6D4", "Tax": "#EF4444", "Loan Repayment": "#EC4899",
    "Equipment": "#6366F1", "Professional Services": "#14B8A6",
    "Insurance": "#64748B", "Logistics": "#F97316", "Inventory": "#22C55E", "Other": "#9CA3AF",
  }[payable.category] || "#9CA3AF";

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm ${isPaid ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: categoryColor }}>
            {getInitials(payable.payee)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{payable.payee}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: categoryColor }}>
                {payable.category}
              </span>
              {payable.isRecurring && (
                <span className="text-xs text-gray-400">· {payable.recurringFrequency}</span>
              )}
            </div>
            {payable.description && <p className="text-xs text-gray-500 mt-0.5">{payable.description}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 font-mono">{fmt(payable.amount)}</p>
          <p className="text-xs font-medium" style={{ color }}>{label}</p>
        </div>
      </div>

      {!isPaid && (
        <div className="flex gap-2">
          {payable.phone && (
            <a href={`https://wa.me/${(payable.phone).replace(/\D/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white"
              style={{ backgroundColor: "#22C55E" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contact
            </a>
          )}
          <button onClick={() => onMarkPaid(payable._id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Mark paid
          </button>
          <button onClick={() => onDelete(payable._id)}
            className="p-2.5 rounded-xl text-gray-400 bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Payables tab ──────────────────────────────────────────────
function PayablesTab() {
  const { payables, payablesStats, loadingPayables, reloadPayables } = useDashboard();
  const [showAdd, setShowAdd] = useState(false);

  const active = payables.filter((p) => p.status !== "paid");
  const paid = payables.filter((p) => p.status === "paid");

  const handleMarkPaid = async (id) => {
    try { await payablesAPI.update(id, { status: "paid" }); reloadPayables(); } catch {}
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this record?")) return;
    try { await payablesAPI.delete(id); reloadPayables(); } catch {}
  };

  return (
    <div>
      {payables.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-2xl p-3.5 text-white col-span-1" style={{ backgroundColor: "#0C2218" }}>
            <p className="text-[10px] text-green-300 mb-1">Upcoming</p>
            <p className="text-base font-bold font-mono">{fmt(payablesStats.totalUpcoming)}</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm">
            <p className="text-[10px] text-gray-400 mb-1">Overdue</p>
            <p className="text-base font-bold text-gray-900">{payablesStats.overdueCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-3.5 shadow-sm">
            <p className="text-[10px] text-gray-400 mb-1">Due soon</p>
            <p className="text-base font-bold text-orange-500">{payablesStats.dueSoonCount}</p>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(true)}
        className="w-full mb-5 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-[#0C2218] hover:text-[#0C2218] transition-colors flex items-center justify-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add payable
      </button>

      {loadingPayables && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin w-6 h-6 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {!loadingPayables && active.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">No payables yet</p>
          <p className="text-sm text-gray-500">Track rent, salaries, supplier payments, and other bills you owe.</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {active.map((p) => (
            <PayableCard key={p._id} payable={p} onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {paid.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Paid</p>
          <div className="flex flex-col gap-2">
            {paid.map((p) => (
              <PayableCard key={p._id} payable={p} onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddPayableModal onClose={() => setShowAdd(false)}
          onCreated={() => { setShowAdd(false); reloadPayables(); }} />
      )}
    </div>
  );
}

// ── Main FinancePage ──────────────────────────────────────────
export default function FinancePage() {
  const { user } = useAuth();
  const businessName = user?.businessName || user?.name || "your business";
  const [activeSubTab, setActiveSubTab] = useState("receivables");

  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Ledger</h1>
      <p className="text-sm text-gray-500 mb-5">Track money owed to you and bills you need to pay.</p>

      {/* Sub-tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        <button
          onClick={() => setActiveSubTab("receivables")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === "receivables"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Receivables
        </button>
        <button
          onClick={() => setActiveSubTab("payables")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === "payables"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Payables
        </button>
      </div>

      {activeSubTab === "receivables" ? (
        <ReceivablesTab businessName={businessName} />
      ) : (
        <PayablesTab />
      )}
    </div>
  );
}
