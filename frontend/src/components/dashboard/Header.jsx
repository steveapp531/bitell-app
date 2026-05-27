import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Logo from "../Logo.jsx";

export default function Header({ onReset, hasData }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt) - Date.now()) / 86400000))
    : null;

  return (
    <header className="border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Logo />

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Trial badge */}
            {user?.subscriptionStatus === "trial" && trialDaysLeft !== null && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-400 text-xs">{trialDaysLeft}d trial</span>
              </div>
            )}

            {/* AI ready indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-xs font-mono">AI Ready</span>
            </div>

            {/* History link */}
            <Link
              to="/dashboard/history"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                         text-slate-400 hover:text-white text-xs transition-colors"
            >
              History
            </Link>

            {/* New Statement button */}
            {hasData && onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           bg-slate-800 hover:bg-slate-700 border border-slate-700
                           text-slate-300 hover:text-white text-xs transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                New
              </button>
            )}

            {/* User avatar + menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-1"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30
                                  flex items-center justify-center text-emerald-400 text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-10 w-44 bg-slate-900 border border-slate-800
                                  rounded-xl shadow-2xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-white text-xs font-medium truncate">{user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard/history"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-slate-400 hover:text-white text-xs transition-colors"
                    >
                      Statement History
                    </Link>
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 text-slate-400 hover:text-white text-xs transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
