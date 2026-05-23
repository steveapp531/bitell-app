import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#34d399 1px,transparent 1px),linear-gradient(90deg,#34d399 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Link to="/" className="flex items-center gap-2.5 mb-8 z-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-slate-950 font-black text-base">B</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">
          Bi<span className="text-emerald-400">tell</span>
        </span>
      </Link>

      <div className="w-full max-w-md z-10 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white mb-1.5">{title}</h1>
          {subtitle && <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>}
        </div>
        {children}
      </div>

      <p className="text-slate-700 text-xs mt-6 z-10">
        © {new Date().getFullYear()} Bitell · Business Financial Intelligence
      </p>
    </div>
  );
}
