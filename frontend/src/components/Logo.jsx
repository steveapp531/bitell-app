import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ compact = false, dark = false }) {
  const sizeClass = compact ? "text-sm font-semibold" : "text-lg font-bold tracking-tight";
  const textClass = dark ? "text-white" : "text-slate-900";
  const accentClass = dark ? "text-emerald-200" : "text-emerald-600";

  return (
    <Link to="/" className="flex items-center gap-2">
      <span className={sizeClass}>
        <span className="text-black">Bi</span>
        <span className={`ml-0.5 ${accentClass}`}>tell</span>
      </span>
    </Link>
  );
}
