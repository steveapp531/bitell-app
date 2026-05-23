import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import LandingPage          from "./pages/LandingPage.jsx";
import LoginPage            from "./pages/LoginPage.jsx";
import RegisterPage         from "./pages/RegisterPage.jsx";
import ForgotPasswordPage   from "./pages/ForgotPassword.jsx";
import ResetPasswordPage    from "./pages/ResetPasswordPage.jsx";
import SubscribePage        from "./pages/SubscribePage.jsx";
import StatementHistoryPage from "./pages/StatementHistoryPage.jsx";

import Header        from "./components/dashboard/Header.jsx";
import UploadPage    from "./pages/UploadPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

// ── Protected dashboard shell ─────────────────────────────────
// Owns the upload→dashboard state and shares setData with history page.
function DashboardApp() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const handleHistoryLoad = (statement) => {
    setData({
      transactions: statement.transactions,
      summary: statement.summary,
      recommendation: statement.recommendation,
      filename: statement.filename,
      currency: statement.currency || statement.summary?.currency,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans">
      <Header onReset={data ? () => setData(null) : null} hasData={!!data} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            index
            element={
              !data
                ? <UploadPage onSuccess={setData} />
                : <DashboardPage data={data} onReset={() => setData(null)} />
            }
          />
          <Route
            path="history"
            element={<StatementHistoryPage onLoad={handleHistoryLoad} />}
          />
        </Routes>
      </main>
    </div>
  );
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

          {/* Protected */}
          <Route
            path="/dashboard/*"
            element={<ProtectedRoute><DashboardApp /></ProtectedRoute>}
          />
          <Route path="/subscribe" element={<ProtectedRoute><SubscribePage /></ProtectedRoute>} />

          {/* Redirect legacy /history to /dashboard/history */}
          <Route path="/history" element={<Navigate to="/dashboard/history" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
