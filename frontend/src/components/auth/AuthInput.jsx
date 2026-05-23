// ============================================================
//  src/components/auth/AuthInput.jsx — Reusable Form Input
//
//  WHY: All three auth forms (login, register, reset) share
//  the same input style. One component, zero duplication.
// ============================================================

import React, { useState } from "react";

/**
 * @param {string}   label
 * @param {string}   type       — "text"|"email"|"password"
 * @param {string}   value
 * @param {Function} onChange
 * @param {string}   placeholder
 * @param {string}   [error]    — field-level error message
 * @param {boolean}  [required]
 */
export default function AuthInput({ label, type = "text", value, onChange, placeholder, error, required }) {
  const [show, setShow] = useState(false); // for password toggle
  const inputType = type === "password" ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-slate-300 text-sm font-medium">
        {label}{required && <span className="text-emerald-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-4 py-2.5 rounded-xl text-sm
            bg-slate-800/60 border
            text-slate-100 placeholder-slate-600
            focus:outline-none focus:ring-2 focus:ring-emerald-500/40
            transition-all duration-150
            ${error ? "border-red-500/60 focus:border-red-500" : "border-slate-700 focus:border-emerald-500/60"}
          `}
        />
        {/* Show/hide toggle for password fields */}
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}