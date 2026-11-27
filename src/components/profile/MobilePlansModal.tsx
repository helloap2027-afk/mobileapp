"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Lock,
  ArrowRight,
  Store,
  User,
} from "lucide-react";
import { MobilePlanCheckoutModal } from "../MobilePlanCheckoutModal";

interface MobilePlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userRole?: "CUSTOMER" | "BUSINESS" | "GUEST";
  onRequireLogin: () => void;
}

const API_BASE = "http://localhost:4000/api/v1";

export function MobilePlansModal({
  isOpen,
  onClose,
  isAuthenticated,
  userRole = "GUEST",
  onRequireLogin,
}: MobilePlansModalProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAudience, setActiveAudience] = useState<"CUSTOMER" | "BUSINESS">(
    userRole === "BUSINESS" ? "BUSINESS" : "CUSTOMER"
  );
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);

  useEffect(() => {
    if (userRole === "BUSINESS") {
      setActiveAudience("BUSINESS");
    } else {
      setActiveAudience("CUSTOMER");
    }
  }, [userRole]);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/subscriptions/plans`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data.filter((p: any) => p.status === "ACTIVE"));
      } else {
        // Fallback to /plans/available
        const res2 = await fetch(`${API_BASE}/plans/available`);
        const json2 = await res2.json();
        if (json2.success && Array.isArray(json2.data)) {
          setPlans(json2.data.filter((p: any) => p.status === "ACTIVE"));
        } else {
          setError("Failed to load published plans from server.");
        }
      }
    } catch {
      setError("Network error fetching subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const filteredPlans = plans.filter((p) => {
    if (activeAudience === "BUSINESS") {
      return p.audience === "BUSINESS" || p.audience === "MERCHANT";
    }
    return p.audience === "CUSTOMER" || !p.audience;
  });

  const handlePlanClick = (plan: any) => {
    if (!isAuthenticated) {
      onClose();
      onRequireLogin();
      return;
    }
    setCheckoutPlan(plan);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-[#0B1220]/75 backdrop-blur-xs z-50 flex flex-col justify-end animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] w-full h-[92%] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-250 border-t border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0076D7] to-[#0B1220] px-4 py-3.5 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-xs font-black tracking-tight text-white">
                Plans & Subscriptions
              </h3>
              <p className="text-[9px] text-blue-200 font-medium">
                {isAuthenticated ? `Authorized for ${userRole}` : "Public Published Pricing"}
              </p>
            </div>
          </div>
        </div>

        {/* Audience Selector (When Guest or Dual-Role) */}
        {!isAuthenticated && (
          <div className="px-4 pt-3 pb-1 bg-white border-b border-slate-100 flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveAudience("CUSTOMER")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeAudience === "CUSTOMER"
                  ? "bg-[#0076D7] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Plans</span>
            </button>
            <button
              onClick={() => setActiveAudience("BUSINESS")}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                activeAudience === "BUSINESS"
                  ? "bg-[#FF6B35] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Partner Plans</span>
            </button>
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="px-4 py-2 bg-slate-50 flex items-center justify-center shrink-0 border-b border-slate-200/60">
          <div className="bg-white p-0.5 rounded-xl border border-slate-200 flex items-center shadow-2xs">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${
                billingCycle === "MONTHLY"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                billingCycle === "YEARLY"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0076D7]" />
              <p className="text-xs font-bold text-slate-500">Loading plans from database...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <p className="text-xs text-rose-700 font-bold">{error}</p>
              <button
                onClick={fetchPlans}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No active plans published for this category.
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const isPopular = Boolean(plan.is_popular);
              const price =
                billingCycle === "YEARLY" && plan.annual_price && plan.annual_price > 0
                  ? plan.annual_price
                  : plan.price;
              const periodLabel = billingCycle === "YEARLY" ? "/year" : "/month";

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl p-4 transition relative border shadow-2xs ${
                    isPopular
                      ? "border-[#FF6B35] ring-1 ring-[#FF6B35]/20"
                      : "border-slate-200"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-[#FF6B35] to-[#E5531E] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-sm font-black text-slate-900">{plan.name}</h4>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">
                        {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                      </span>
                      {price > 0 && (
                        <span className="text-[10px] text-slate-400 font-bold ml-0.5">
                          {periodLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-[11px] text-slate-500 mb-3">{plan.description}</p>
                  )}

                  {/* Feature Checklist */}
                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <ul className="space-y-1.5 mb-3.5 pt-2 border-t border-slate-100">
                      {plan.features.map((feat: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-2 text-[11px] text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98 ${
                      isPopular
                        ? "bg-[#FF6B35] hover:bg-[#E5531E] text-white"
                        : "bg-[#0076D7] hover:bg-blue-700 text-white"
                    }`}
                  >
                    {!isAuthenticated && <Lock className="w-3 h-3" />}
                    <span>
                      {isAuthenticated
                        ? plan.button_text || `Subscribe for ₹${price}`
                        : "Login to Choose Plan"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-3 flex items-center justify-between text-[11px] text-slate-500 font-semibold shrink-0">
          <div className="flex items-center gap-1 text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure 100% Tax Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            Close
          </button>
        </div>

      </div>

      {checkoutPlan && (
        <MobilePlanCheckoutModal
          isOpen={Boolean(checkoutPlan)}
          onClose={() => setCheckoutPlan(null)}
          plan={checkoutPlan}
          billingCycle={billingCycle}
          userRole={activeAudience}
          onPaymentSuccess={() => {
            setCheckoutPlan(null);
            alert("Subscription Activated Successfully!");
          }}
        />
      )}
    </div>
  );
}

