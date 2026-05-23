import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../utils/formatters.js";

const CATEGORY_COLORS = {
  "Sales Revenue":             "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Service Income":            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Investment Returns":        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Loan Received":             "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Refund Received":           "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Other Income":              "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Payroll":                   "bg-red-500/10 text-red-400 border-red-500/20",
  "Rent & Utilities":          "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Software & Subscriptions":  "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Marketing & Advertising":   "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "Travel & Transport":        "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Office Supplies":           "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Bank Charges & Fees":       "bg-red-500/10 text-red-400 border-red-500/20",
  "Tax & Government":          "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Insurance":                 "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Inventory & COGS":          "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Professional Services":     "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  "Other Expense":             "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const DEFAULT_BADGE = "bg-slate-700/50 text-slate-400 border-slate-600/30";
const PAGE_SIZE = 15;

/**
 * @param {Array}  transactions
 * @param {string} currency — ISO 4217 code for formatting amounts
 */
export default function TransactionsTable({ transactions, currency = "USD" }) {
  const [search, setSearch]   = useState("");
  const [typeFilter, setType] = useState("all");
  const [page, setPage]       = useState(1);

  const fmt = (v) => formatCurrency(v, currency);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleType   = (v) => { setType(v);   setPage(1); };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h3 className="text-white font-semibold">Transactions</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            {filtered.length} of {transactions.length} · {currency}
          </p>
        </div>
        <div className="flex-1" />

        {/* Type filter */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
          {[["all","All"], ["income","Income"], ["expense","Expense"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => handleType(val)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all
                ${typeFilter === val
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg
                       text-slate-300 placeholder-slate-600 text-sm
                       focus:outline-none focus:border-emerald-500/50 w-36"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {["Date", "Description", "Category", "Type", "Amount"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium
                                       text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-600 text-sm">
                  No transactions match your filters
                </td>
              </tr>
            ) : (
              paginated.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors duration-100">
                  <td className="px-5 py-3.5 font-mono text-slate-400 text-xs whitespace-nowrap">
                    {t.date || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-200 text-sm max-w-xs">
                    <span className="truncate block max-w-[200px]" title={t.description}>
                      {t.description}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs border
                      ${CATEGORY_COLORS[t.category] || DEFAULT_BADGE}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border capitalize
                      ${t.type === "income"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 font-mono text-sm font-medium whitespace-nowrap
                    ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {t.type === "income" ? "+" : "−"}
                    {fmt(t.amount).replace(/^[^0-9-]/, "")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Page {page} of {totalPages}</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400
                         hover:text-white disabled:opacity-30 text-xs transition-all"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400
                         hover:text-white disabled:opacity-30 text-xs transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
