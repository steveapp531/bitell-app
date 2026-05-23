// ============================================================
//  src/components/auth/ProtectedRoute.jsx
//
//  WHY: Wraps any route that requires authentication.
//  While the session is loading (checking localStorage),
//  shows a spinner. If no user, redirects to /login.
//  If user's access is "blocked", redirects to /subscribe.
// ============================================================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show spinner while rehydrating session from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in — send to login, remember where they were going
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Fully blocked (past grace period) — send to subscribe page
  if (user.accessLevel === "blocked") {
    return <Navigate to="/subscribe" replace />;
  }

  return children;
}