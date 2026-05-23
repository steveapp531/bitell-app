import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import LandingPage        from "./pages/LandingPage.jsx";
import LoginPage          from "./pages/LoginPage.jsx";
import RegisterPage       from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPasswordPage  from "./pages/ResetPasswordPage.jsx";
import SubscribePage      from "./pages/SubscribePage.jsx";
import OnboardingPage     from "./pages/OnboardingPage.jsx";
import DashboardShell     from "./pages/dashboard/DashboardShell.jsx";

// After login/register, send to onboarding if not yet complete, else to dashboard
function PostAuthRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-[#0C2218]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

// Guard for onboarding — skip if already completed
function OnboardingGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboardingCompleted) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          {/* Post-auth redirect — figures out where to send the user */}
          <Route path="/home" element={<ProtectedRoute><PostAuthRedirect /></ProtectedRoute>} />

          {/* Onboarding wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <OnboardingPage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />

          {/* New dashboard (all tabs inside DashboardShell) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardShell />
              </ProtectedRoute>
            }
          />

          {/* Subscription */}
          <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/history"     element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
