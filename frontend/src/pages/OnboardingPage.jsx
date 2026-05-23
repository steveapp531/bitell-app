import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const BUSINESS_TYPES = [
  "Restaurant / food",
  "Salon / beauty",
  "Mini-mart / kiosk",
  "Pharmacy",
  "Fashion",
  "Logistics",
  "Online vendor",
  "Distributor",
  "Agency / services",
  "Other",
];

const REVENUE_RANGES = [
  "₦500k – ₦1M / month",
  "₦1M – ₦3M / month",
  "₦3M – ₦7M / month",
  "₦7M – ₦15M / month",
  "₦15M – ₦20M+ / month",
];

const TOTAL_STEPS = 5;

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full transition-colors duration-300"
          style={{ backgroundColor: i < step ? "#0C2218" : "#D1D5DB" }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    businessType: "",
    location: "",
    monthlyRevenue: "",
  });

  const canContinue = () => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return form.businessName.trim().length > 0;
    if (step === 3) return form.businessType.length > 0;
    if (step === 4) return form.location.trim().length > 0;
    if (step === 5) return form.monthlyRevenue.length > 0;
    return false;
  };

  const handleNext = async () => {
    if (!canContinue()) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }
    // Final step — submit
    setSaving(true);
    setError("");
    try {
      await completeOnboarding({
        businessName: form.businessName,
        businessType: form.businessType,
        location: form.location,
        monthlyRevenue: form.monthlyRevenue,
      });
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <ProgressBar step={step} />
      </div>

      {/* Back arrow */}
      <div className="px-6 pt-3 h-10">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 px-6 pt-4 pb-32 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Step {step} of {TOTAL_STEPS}
        </p>

        {/* Step 1 — Name */}
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">What's your name?</h1>
            <p className="text-gray-500 mb-8">We'll use this to greet you.</p>
            <input
              type="text"
              placeholder="e.g. Bisi Adekunle"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C2218] focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canContinue() && handleNext()}
            />
          </>
        )}

        {/* Step 2 — Business name */}
        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">What's your business called?</h1>
            <p className="text-gray-500 mb-8">The name your customers know.</p>
            <input
              type="text"
              placeholder="e.g. Bisi's Kitchen"
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C2218] focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canContinue() && handleNext()}
            />
          </>
        )}

        {/* Step 3 — Business type */}
        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">What kind of business is it?</h1>
            <p className="text-gray-500 mb-6">Pick the closest match.</p>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((f) => ({ ...f, businessType: type }))}
                  className={`px-4 py-4 text-sm font-medium text-left rounded-xl border-2 transition-all ${
                    form.businessType === type
                      ? "border-[#0C2218] bg-[#0C2218] text-white"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 4 — Location */}
        {step === 4 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Where are you based?</h1>
            <p className="text-gray-500 mb-8">City or neighbourhood.</p>
            <input
              type="text"
              placeholder="e.g. Surulere, Lagos"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C2218] focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canContinue() && handleNext()}
            />
          </>
        )}

        {/* Step 5 — Revenue */}
        {step === 5 && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Roughly, how much do you make a month?</h1>
            <p className="text-gray-500 mb-6">We use this to set safe spending limits. You can change it anytime.</p>
            <div className="flex flex-col gap-3">
              {REVENUE_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setForm((f) => ({ ...f, monthlyRevenue: range }))}
                  className={`px-5 py-4 text-base font-medium text-left rounded-xl border-2 transition-all ${
                    form.monthlyRevenue === range
                      ? "border-[#0C2218] bg-[#0C2218] text-white"
                      : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
        <button
          onClick={handleNext}
          disabled={!canContinue() || saving}
          className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            canContinue() && !saving
              ? "bg-[#0C2218] text-white hover:bg-[#163828]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Setting up...
            </span>
          ) : step === TOTAL_STEPS ? (
            <>Take me to my dashboard <span>→</span></>
          ) : (
            <>Continue <span>→</span></>
          )}
        </button>
      </div>
    </div>
  );
}
