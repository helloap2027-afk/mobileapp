"use client";

import React from "react";
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

interface PaymentResultModalProps {
  isOpen: boolean;
  status: "SUCCESS" | "FAILED";
  amount: number;
  orderId: string;
  reason?: string;
  gatewayRef?: string;
  purpose?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function PaymentResultModal({
  isOpen,
  status,
  amount,
  orderId,
  reason,
  gatewayRef,
  purpose,
  onClose,
  onRetry,
}: PaymentResultModalProps) {
  if (!isOpen) return null;

  const isSuccess = status === "SUCCESS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-['Poppins']">
      <div className="w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 text-center space-y-4 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Soft background glow */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-2xl pointer-events-none ${
            isSuccess ? "bg-emerald-400/20" : "bg-rose-400/20"
          }`}
        />

        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${
            isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
          }`}
        >
          {isSuccess ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
        </div>

        <div className="space-y-1">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isSuccess
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {isSuccess ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
            {isSuccess ? "100% Confirmed" : "Transaction Failed"}
          </span>
          <h3 className="text-lg font-black text-slate-900 pt-1">
            {isSuccess ? "Payment Successful" : "Payment Declined"}
          </h3>
          <p className="text-[11px] text-slate-500">
            {isSuccess
              ? "Your balance has been updated immediately."
              : "No amount was deducted from your account."}
          </p>
        </div>

        {/* Details Card */}
        <div
          className={`rounded-2xl p-3.5 border text-left space-y-1.5 text-xs ${
            isSuccess
              ? "bg-emerald-50/50 border-emerald-100 text-slate-700"
              : "bg-rose-50/50 border-rose-100 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/50 text-xs">
            <span className="text-slate-500 text-[11px]">Amount</span>
            <span className="font-black text-slate-900 text-sm">
              ₹{Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {purpose && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Purpose</span>
              <span className="font-bold text-slate-800 uppercase">
                {purpose.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {orderId && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-bold text-slate-700 truncate max-w-[160px]">
                {orderId}
              </span>
            </div>
          )}

          {gatewayRef && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Gateway Ref</span>
              <span className="font-mono text-slate-700">{gatewayRef}</span>
            </div>
          )}

          {!isSuccess && reason && (
            <div className="pt-1 text-[10px] text-rose-700 leading-snug">
              <span className="font-bold">Reason: </span>
              {reason}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-1 space-y-2">
          {isSuccess ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

