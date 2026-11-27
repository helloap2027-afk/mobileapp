"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, Wallet } from "lucide-react";

function MobilePaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || searchParams.get("txnid") || "";

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("No transaction reference found in URL.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;
    let timer: any = null;

    const checkStatus = async () => {
      try {
        const cleanId = orderId.startsWith("EB_") ? orderId.substring(3) : orderId;
        const res = await fetch(`http://localhost:4000/api/v1/payments/status/${cleanId}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setOrder(json.data);
            if (json.data.status === "COMPLETED") {
              setLoading(false);
              return;
            }
            if (json.data.status === "FAILED") {
              router.push(`/payment/failure?orderId=${cleanId}&reason=${encodeURIComponent(json.data.failureReason || "Payment marked as failed by gateway")}`);
              return;
            }
          }
        }
      } catch (err: any) {
        console.warn("[MobilePaymentSuccess] Status check failed:", err?.message);
      }

      attempts++;
      if (attempts < maxAttempts) {
        timer = setTimeout(checkStatus, 2000);
      } else {
        setLoading(false);
      }
    };

    checkStatus();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [orderId, router]);

  return (
    <div className="min-h-full max-w-md mx-auto bg-gradient-to-b from-emerald-50/60 via-white to-slate-50 flex flex-col justify-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-5 text-center space-y-5 relative overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        {loading ? (
          <div className="py-10 space-y-3">
            <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-base font-black text-slate-900">Verifying Payment...</h2>
            <p className="text-[11px] text-slate-500">Communicating with Easebuzz gateway.</p>
          </div>
        ) : error ? (
          <div className="py-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="text-base font-black text-slate-900">Error</h2>
            <p className="text-xs text-slate-500">{error}</p>
            <Link
              href="/"
              className="inline-block px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto animate-in zoom-in-75">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold uppercase">
                <ShieldCheck className="w-3 h-3" /> Confirmed
              </span>
              <h1 className="text-xl font-black text-slate-900 pt-1">Payment Successful</h1>
              <p className="text-[11px] text-slate-500">Wallet balance / Plan has been updated.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 text-[11px]">Amount</span>
                <span className="text-base font-black text-slate-900">
                  ₹{Number(order?.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Purpose</span>
                <span className="font-bold text-slate-800 uppercase">
                  {order?.purpose ? String(order.purpose).replace(/_/g, " ") : "Wallet Top-up"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Ref</span>
                <span className="font-mono font-semibold text-slate-700 truncate max-w-[180px]">
                  {order?.orderId || orderId}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Gateway</span>
                <span className="font-bold text-indigo-700">Easebuzz</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Link
                href="/?tab=wallet"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Wallet className="w-4 h-4" />
                <span>Go to My Wallet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MobilePaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <MobilePaymentSuccessContent />
    </Suspense>
  );
}

