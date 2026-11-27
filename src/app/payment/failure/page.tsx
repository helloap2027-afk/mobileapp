"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react";

function MobilePaymentFailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || searchParams.get("txnid") || "";
  const rawReason = searchParams.get("reason") || searchParams.get("error_Message") || "";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const cleanId = orderId.startsWith("EB_") ? orderId.substring(3) : orderId;
        const res = await fetch(`http://localhost:4000/api/v1/payments/status/${cleanId}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.data) {
            setOrder(json.data);
          }
        }
      } catch (err: any) {
        console.warn("[MobilePaymentFailure] fetch failed:", err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [orderId]);

  const failureReason =
    rawReason ||
    order?.failureReason ||
    "Payment was declined or cancelled at the gateway.";

  return (
    <div className="min-h-full max-w-md mx-auto bg-gradient-to-b from-rose-50/60 via-white to-slate-50 flex flex-col justify-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl border border-rose-100 shadow-xl p-5 text-center space-y-5 relative overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

        {loading ? (
          <div className="py-10 space-y-3">
            <RefreshCw className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Checking payment outcome...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto animate-in zoom-in-75">
              <XCircle className="w-9 h-9 text-rose-600" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold uppercase">
                <ShieldAlert className="w-3 h-3" /> Declined
              </span>
              <h1 className="text-xl font-black text-slate-900 pt-1">Payment Failed</h1>
              <p className="text-[11px] text-slate-500">No amount was deducted from your bank account.</p>
            </div>

            <div className="bg-rose-50/80 rounded-2xl p-3.5 border border-rose-200 text-left space-y-1.5 text-xs">
              <div className="flex items-start gap-1.5 text-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <span className="font-bold text-[11px] block text-slate-900">Reason</span>
                  <p className="text-rose-700 text-[10px] leading-relaxed mt-0.5">
                    {failureReason}
                  </p>
                </div>
              </div>

              {orderId && (
                <div className="pt-1.5 border-t border-rose-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Order Ref</span>
                  <span className="font-mono font-bold text-slate-800 truncate max-w-[170px]">{orderId}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </button>
              <Link
                href="/?tab=wallet"
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Wallet</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MobilePaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      }
    >
      <MobilePaymentFailureContent />
    </Suspense>
  );
}

