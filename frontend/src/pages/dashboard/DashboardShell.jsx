import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { DashboardProvider } from "../../context/DashboardContext.jsx";
import BottomNav from "../../components/dashboard/BottomNav.jsx";
import AccountPanel from "../../components/dashboard/AccountPanel.jsx";
import HomePage from "./HomePage.jsx";
import InsightsPage from "./InsightsPage.jsx";
import AskBitellPage from "./AskBitellPage.jsx";
import FinancePage from "./FinancePage.jsx";
import AlertsPage from "./AlertsPage.jsx";
import Logo from "../../components/Logo.jsx";

// use shared Logo component

function DashboardHeader({ businessName }) {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <Logo compact />
      {businessName ? (
        <span className="text-sm font-semibold text-gray-800">{businessName}</span>
      ) : null}
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
      case "payments":  return <FinancePage />;
      case "alerts":    return <AlertsPage />;
      default:          return <HomePage onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DashboardHeader businessName={businessName} />

        {/* Scrollable content area — padded for bottom nav. Wider container for laptop screens. */}
        <main className="pb-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AccountPanel />
          {renderTab()}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </DashboardProvider>
  );
}
