import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { DashboardProvider } from "../../context/DashboardContext.jsx";
import BottomNav from "../../components/dashboard/BottomNav.jsx";
import HomePage from "./HomePage.jsx";
import InsightsPage from "./InsightsPage.jsx";
import AskBitellPage from "./AskBitellPage.jsx";
import FinancePage from "./FinancePage.jsx";
import AlertsPage from "./AlertsPage.jsx";

function BitellLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0C2218" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Bitell</span>
    </div>
  );
}

function DashboardHeader({ businessName }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <BitellLogo />
      <div className="flex items-center gap-3">
        {businessName && (
          <span className="text-sm font-semibold text-gray-800">{businessName}</span>
        )}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative"
          >
            {/* Notification bell */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-44 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  const businessName = user?.businessName || user?.name || "";

  const renderTab = () => {
    switch (activeTab) {
      case "home":      return <HomePage onTabChange={setActiveTab} />;
      case "insights":  return <InsightsPage />;
      case "ask":       return <AskBitellPage />;
      case "debtors":   return <FinancePage />;
      case "alerts":    return <AlertsPage />;
      default:          return <HomePage onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DashboardHeader businessName={businessName} />

        {/* Scrollable content area — padded for bottom nav */}
        <main className="pb-24 max-w-lg mx-auto">
          {renderTab()}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </DashboardProvider>
  );
}
