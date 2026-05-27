import React, { useState } from "react";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { debtorsAPI } from "../../utils/api.js";

// Payments page reuses Debtors UI but renamed to Payments (money in / out)
function fmt(val, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency;
  if (!val && val !== 0) return "—";
  if (Math.abs(val) >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `${sym}${Math.round(val / 1_000)}k`;
  return `${sym}${val.toLocaleString()}`;
}

export default function PaymentsPage() {
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
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
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
      <p className="text-sm text-gray-500 mb-5">Track money in and out — who owes you and who you owe.</p>

      {!loadingDebtors && active.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">No records yet</p>
          <p className="text-sm text-gray-500 mb-5">Add payments and receivables to start tracking your cash flows.</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {active.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "#0C2218" }}>{(d.name||"").slice(0,2).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{d.name}</p>
                    {d.description && <p className="text-xs text-gray-500">{d.description}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 font-mono">{fmt(d.amount)}</p>
                  <p className="text-xs font-medium text-gray-500">{d.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleMarkPaid(d._id)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: "#22C55E" }}>Mark paid</button>
                <button onClick={() => handleDelete(d._id)} className="px-3 py-2.5 rounded-xl text-sm text-gray-600 bg-gray-100">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
