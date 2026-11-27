"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import {
  X,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Store,
  LogIn,
  UserPlus,
  ChevronDown,
  AlertTriangle,
  Loader2,
  KeyRound,
  RefreshCw,
} from "lucide-react";

export type UserRole = "customer" | "vendor";
export type AuthTab = "login" | "register";

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any, role: UserRole, isRegistration?: boolean) => void;
  defaultRole?: UserRole;
  defaultTab?: AuthTab;
}

interface UserCheckResult {
  exists: boolean;
  fullName?: string;
  phone?: string;
  email?: string;
  hasCustomerRole?: boolean;
  hasPartnerRole?: boolean;
  businessCount?: number;
  businesses?: any[];
  message?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export function FirebaseAuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = "customer",
  defaultTab = "login",
}: FirebaseAuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [step, setStep] = useState<"AUTH_FORM" | "OTP" | "GOOGLE_ROLE_CHOICE">("AUTH_FORM");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(45);
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUserInfo, setRegisteredUserInfo] = useState<UserCheckResult | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");

  // Google dynamic flow states
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);
  const [googleRoleChoiceReason, setGoogleRoleChoiceReason] = useState<"NEW_USER" | "DUAL_ROLE">("NEW_USER");

  useEffect(() => {
    if (!isOpen) {
      setStep("AUTH_FORM");
      setOtp("");
      setError(null);
      setChallengeId(null);
      setDevOtpHint(null);
      setRegisteredUserInfo(null);
      setPendingGoogleUser(null);
      setRegFullName("");
      setRegEmail("");
    } else {
      setSelectedRole(defaultRole);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultRole, defaultTab]);

  // Resend countdown timer
  useEffect(() => {
    if (step === "OTP" && timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Industry-level check: Verify if phone or email is registered via Backend NestJS API
  const verifyUserExistence = async (identifier: string): Promise<UserCheckResult | null> => {
    try {
      const payload = identifier.includes("@") ? { email: identifier } : { phoneNumber: identifier };
      const res = await fetch("http://localhost:4000/api/v1/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {
      console.warn("Backend user verification check unavailable:", e);
    }
    return null;
  };

  // 1. Send OTP to Mobile with Industry-Level Registration Verification & Cooldown Enforcement
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let cleaned = phoneNumber.replace(/\D/g, "");
      if (cleaned.length === 10) {
        cleaned = "+91" + cleaned;
      } else if (!cleaned.startsWith("+")) {
        cleaned = "+" + cleaned;
      }

      // Check registration status before requesting OTP
      const checkResult = await verifyUserExistence(cleaned);
      setRegisteredUserInfo(checkResult);

      if (activeTab === "register") {
        if (checkResult && checkResult.exists) {
          const hasCust = !!checkResult.hasCustomerRole;
          const hasPart = !!checkResult.hasPartnerRole;

          if (selectedRole === "vendor" && hasPart) {
            throw new Error("Already this account was registered with Business Partner role. Please switch to Sign In.");
          } else if (selectedRole === "customer" && hasCust) {
            throw new Error("Already this account was registered with Customer role. Please switch to Sign In.");
          }
        }
      } else {
        // Sign-in validation
        if (!checkResult || !checkResult.exists) {
          throw new Error("No registered account found for this mobile number. First you register the account before logging in.");
        }

        const hasCust = !!checkResult.hasCustomerRole;
        const hasPart = !!checkResult.hasPartnerRole;

        if (selectedRole === "vendor" && !hasPart) {
          throw new Error("This mobile number is registered as a Customer, not a Business Partner. First you register the Business Partner account.");
        } else if (selectedRole === "customer" && !hasCust) {
          throw new Error("This mobile number is not registered as a Customer. First you register the Customer account.");
        }
      }

      // Send OTP via Backend NestJS Gateway
      const backendRole = selectedRole === "vendor" ? "PARTNER" : "CUSTOMER";
      const backendPurpose = activeTab === "register" ? "REGISTRATION" : "LOGIN";

      const res = await fetch("http://localhost:4000/api/v1/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: cleaned,
          purpose: backendPurpose,
          role: backendRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to dispatch verification OTP.");
      }

      if (data.data?.challengeId) {
        setChallengeId(data.data.challengeId);
        setDevOtpHint(data.data?.devOtp || null);
        setTimer(data.data?.resendCooldownSeconds || 45);
        setStep("OTP");
      } else {
        throw new Error("Invalid response from authentication server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      if (challengeId) {
        const res = await fetch("http://localhost:4000/api/v1/auth/otp/resend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setTimer(json.data?.resendCooldownSeconds || 45);
          if (json.data?.devOtp) setDevOtpHint(json.data.devOtp);
          return;
        }
      }
      await handleSendOtp();
    } catch (err: any) {
      setError(err.message || "Unable to resend OTP code.");
    } finally {
      setIsResending(false);
    }
  };

  // 2. Verify OTP with Backend
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) {
      setError("Session expired. Please request a new OTP.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const verifyRes = await fetch("http://localhost:4000/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          otp,
          deviceInfo: "Mobile App Web Client",
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Invalid OTP code. Please enter the valid 6-digit code.");
      }

      const authUser = verifyData.data?.user || {
        displayName: selectedRole === "vendor" ? "Business Partner" : "Customer User",
        phoneNumber: "+91" + phoneNumber,
      };

      // Save tokens & profile to localStorage
      if (typeof window !== "undefined") {
        if (verifyData.data?.accessToken) {
          localStorage.setItem("hello_access_token", verifyData.data.accessToken);
        }
        localStorage.setItem("hello_user", JSON.stringify(authUser));
        localStorage.setItem("hello_active_role", selectedRole === "vendor" ? "MERCHANT" : "CUSTOMER");
        window.dispatchEvent(new Event("hello_auth_changed"));
      }

      if (activeTab === "register") {
        // Registration complete → show modal success state briefly then redirect to login tab
        setLoggedInUser({ __isRegistration: true, ...authUser });
        setTimeout(() => {
          setLoggedInUser(null);
          setStep("AUTH_FORM");
          setActiveTab("login");
          setOtp("");
          setChallengeId(null);
          setDevOtpHint(null);
          setError(null);
        }, 2000);
        if (onSuccess) onSuccess(authUser, selectedRole, true); // isRegistration = true
      } else {
        // Login complete → close modal, let page show toast
        setLoggedInUser(authUser);
        if (onSuccess) onSuccess(authUser, selectedRole, false); // isRegistration = false
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid OTP code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Dynamic Google Sign In with Role Prompt Rules
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email || "";

      // Check role status dynamically from backend
      const checkResult = await verifyUserExistence(email);

      if (!checkResult || !checkResult.exists) {
        // User is registering / new user via Google -> Prompt to choose role
        setPendingGoogleUser(user);
        setGoogleRoleChoiceReason("NEW_USER");
        setStep("GOOGLE_ROLE_CHOICE");
      } else {
        // User exists:
        const hasCustomer = !!checkResult.hasCustomerRole;
        const hasPartner = !!checkResult.hasPartnerRole;

        if (hasCustomer && hasPartner) {
          // User has TWO roles -> Prompt to choose which role to log in with for this session
          setPendingGoogleUser(user);
          setGoogleRoleChoiceReason("DUAL_ROLE");
          setStep("GOOGLE_ROLE_CHOICE");
        } else if (hasPartner) {
          // User has only Business Partner role -> Do NOT ask, log in directly as vendor
          completeLoginWithRole(user, "vendor");
        } else {
          // User has only Customer role -> Do NOT ask, log in directly as customer
          completeLoginWithRole(user, "customer");
        }
      }
    } catch (err: any) {
      console.error(err);
      // Map Firebase error codes to friendly messages
      const code = err?.code || "";
      const friendlyError =
        code === "auth/popup-closed-by-user"
          ? "Sign-in cancelled. Please try again and complete the Google login."
          : code === "auth/popup-blocked"
            ? "Pop-up was blocked by your browser. Please allow pop-ups for this site and try again."
            : code === "auth/cancelled-popup-request"
              ? "Another sign-in is in progress. Please wait and try again."
              : code === "auth/network-request-failed"
                ? "Network error. Please check your connection and try again."
                : code === "auth/too-many-requests"
                  ? "Too many attempts. Please wait a moment and try again."
                  : code === "auth/user-disabled"
                    ? "This account has been disabled. Please contact support."
                    : code === "auth/account-exists-with-different-credential"
                      ? "An account already exists with this email using a different sign-in method."
                      : err.message || "Google Sign-in failed. Please try again.";
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const completeLoginWithRole = async (user: any, role: UserRole) => {
    setSelectedRole(role);
    setLoading(true);
    setError(null);
    try {
      const backendRole = role === "vendor" ? "PARTNER" : "CUSTOMER";
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          fullName: user.displayName || user.fullName,
          avatarUrl: user.photoURL || user.avatarUrl,
          googleUid: user.uid,
          role: backendRole,
          deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "Mobile App"
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to authenticate with backend server.");
      }

      const authData = json.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("hello_access_token", authData.accessToken);
        localStorage.setItem("hello_refresh_token", authData.refreshToken);
        localStorage.setItem("hello_user", JSON.stringify(authData.user));
        localStorage.setItem("hello_active_role", role === "vendor" ? "MERCHANT" : "CUSTOMER");
        window.dispatchEvent(new Event("hello_auth_changed"));
      }

      setLoggedInUser({ ...user, ...authData.user });
      if (onSuccess) onSuccess(authData.user, role);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Mobile Google auth error:", err);
      setError(err.message || "Authentication failed with server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGoogleRoleAndProceed = (role: UserRole) => {
    if (!pendingGoogleUser) return;
    completeLoginWithRole(pendingGoogleUser, role);
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end animate-in fade-in duration-200"
      style={{ background: "rgba(11,18,32,0.60)" }}
      onClick={onClose}
    >
      {/* Bottom Sheet — taller on register, slides up from bottom */}
      <div
        className="relative w-full bg-white overflow-hidden text-slate-800 animate-in slide-in-from-bottom duration-300 flex flex-col"
        style={{ maxHeight: "88%", borderRadius: "28px 28px 0 0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle pill */}
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Card Body with smooth internal scroll to prevent any button cut-off */}
        <div className="px-5 pb-5 pt-1 space-y-2.5 overflow-y-auto no-scrollbar">

          {/* Top Brand Header: HELLO Verified Logo */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#0070E0]">HELLO</span>
              <span className="text-xl font-black text-[#FF6B35]">.</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">
              Hyperlocal Business & Customer Network
            </p>
          </div>

          {/* Logged in / Registration success state */}
          {loggedInUser ? (
            loggedInUser.__isRegistration ? (
              /* Registration success: show briefly before switching to Login tab */
              <div className="py-8 text-center space-y-3 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-base font-black text-slate-900">Account Created! 🎉</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed px-4">
                  Your <span className="font-black text-[#0070E0]">{selectedRole === "vendor" ? "Business Partner" : "Customer"}</span> account has been verified and activated successfully.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Redirecting to Sign In...
                </div>
              </div>
            ) : (
              /* Login success: shown momentarily if needed */
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-black text-slate-900">Signed In Successfully!</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold capitalize">
                  Role: {selectedRole === "vendor" ? "🏢 Business Partner / Vendor" : "👤 Customer / User"}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Welcome {loggedInUser.displayName || loggedInUser.phoneNumber || loggedInUser.email}
                </p>
              </div>
            )
          ) : step === "GOOGLE_ROLE_CHOICE" ? (
            /* Google Role Prompt Modal (for New Registrations or Dual-Role Users) */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0070E0] mx-auto flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {googleRoleChoiceReason === "NEW_USER"
                    ? "Choose Your Account Type"
                    : "Select Your Login Role"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 px-3">
                  {googleRoleChoiceReason === "NEW_USER"
                    ? `Account: ${pendingGoogleUser?.email || "Google Account"}. Select whether you want to join as a Customer or Business Partner.`
                    : "You are registered for both Customer and Business Partner roles. Which role do you want to use for this session?"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectGoogleRoleAndProceed("customer")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0070E0] hover:bg-blue-50/50 text-center transition group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-[#0070E0] text-[#0070E0] group-hover:text-white flex items-center justify-center mb-2 transition shadow-2xs">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900 group-hover:text-[#0070E0]">
                    Customer / User
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Book & Inquire
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectGoogleRoleAndProceed("vendor")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-200 hover:border-[#FF6B35] hover:bg-orange-50/50 text-center transition group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-50 group-hover:bg-[#FF6B35] text-[#FF6B35] group-hover:text-white flex items-center justify-center mb-2 transition shadow-2xs">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900 group-hover:text-[#FF6B35]">
                    Business Partner
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Vendor Leads
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("AUTH_FORM");
                  setPendingGoogleUser(null);
                }}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 pt-1"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">

              {/* Login / Register Segmented Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-black">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setError(null);
                  }}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setError(null);
                  }}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${activeTab === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Role Selection Label */}
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-800 tracking-wide uppercase">
                    {activeTab === "register" ? "Register As" : "Login As (Phone OTP)"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {selectedRole === "customer" ? "Customer Account" : "Business Partner"}
                  </span>
                </div>

                {/* Role Switcher Cards */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole("customer"); setError(null); }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${selectedRole === "customer"
                      ? "border-[#0070E0] bg-[#0070E0]/5 ring-1 ring-[#0070E0]/30"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedRole === "customer" ? "bg-[#0070E0] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-black text-slate-900 leading-tight">Customer</div>
                      <div className="text-[9px] text-slate-400 truncate">Book & Inquire</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedRole("vendor"); setError(null); }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${selectedRole === "vendor"
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 ring-1 ring-[#FF6B35]/30"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedRole === "vendor" ? "bg-[#FF6B35] text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[11px] font-black text-slate-900 leading-tight">Business</div>
                      <div className="text-[9px] text-slate-400 truncate">Vendor Leads</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              {/* Continue with Google */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2.5 transition shadow-2xs group cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* OR MOBILE OTP Divider */}
              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  OR MOBILE OTP
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Mobile Phone Number Form */}
              {step !== "OTP" ? (
                <form onSubmit={handleSendOtp} className="space-y-3">

                  {/* ── Registration-only: Name + Email ── */}
                  {activeTab === "register" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-800 mb-0.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={regFullName}
                          onChange={(e) => { setRegFullName(e.target.value); setError(null); }}
                          className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#0070E0] focus:ring-1.5 focus:ring-blue-100 transition shadow-2xs"
                        />
                      </div>
                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-black text-slate-800 mb-0.5">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={regEmail}
                          onChange={(e) => { setRegEmail(e.target.value); setError(null); }}
                          className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#0070E0] focus:ring-1.5 focus:ring-blue-100 transition shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-black text-slate-800 mb-0.5">
                      Mobile Number
                    </label>
                    <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-[#0070E0] focus-within:ring-1.5 focus-within:ring-blue-100 transition shadow-2xs">
                      {/* Flag and Prefix with dropdown arrow */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                        {/* Indian Flag SVG */}
                        <svg className="w-4 h-3 rounded-2xs" viewBox="0 0 640 480">
                          <path fill="#f93" d="M0 0h640v160H0z" />
                          <path fill="#fff" d="M0 160h640v160H0z" />
                          <path fill="#128807" d="M0 320h640v160H0z" />
                          <circle cx="320" cy="240" r="40" fill="#008" />
                        </svg>
                        <span>IN +91</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="98480 12345"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, ""));
                          setError(null);
                        }}
                        className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5 block">
                      We will verify your registration before sending an OTP via SMS.
                    </span>
                  </div>

                  {/* Get OTP Button */}
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      phoneNumber.length < 10 ||
                      (activeTab === "register" && (!regFullName.trim() || !regEmail.trim()))
                    }
                    className="w-full py-2.5 bg-[#0060C8] hover:bg-[#0050A8] active:scale-98 disabled:opacity-50 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Get OTP on Mobile</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* OTP Verification Step */
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <label className="block text-xs font-black text-slate-900">
                        Enter 6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setStep("AUTH_FORM")}
                        className="text-[11px] font-bold text-[#0070E0] hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black tracking-[0.3em] text-slate-900 focus:bg-white focus:outline-[#0070E0] transition"
                    />

                    {/* Dev Test OTP Hint with 1-Click Auto Fill */}
                    {devOtpHint && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-800">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold">Test OTP:</span>
                          <span className="font-mono font-black text-amber-900">{devOtpHint}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtp(devOtpHint)}
                          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-md transition cursor-pointer"
                        >
                          Auto-Fill
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span>Sent to +91 {phoneNumber}</span>
                      <button
                        type="button"
                        disabled={timer > 0 || isResending}
                        onClick={handleResendOtp}
                        className="font-bold text-[#0070E0] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                      >
                        {timer > 0 ? `Resend in ${timer}s` : isResending ? "Resending..." : "Resend OTP"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Continue</span>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Footer Switcher: New here? Register / Already have account? Login */}
              <div className="pt-2 text-center text-xs">
                {activeTab === "login" ? (
                  <p className="text-slate-600 font-medium">
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("register");
                        setError(null);
                      }}
                      className="text-[#FF6B35] font-black underline underline-offset-4 decoration-2 hover:opacity-80 transition"
                    >
                      Register
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-600 font-medium">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("login");
                        setError(null);
                      }}
                      className="text-[#0070E0] font-black underline underline-offset-4 decoration-2 hover:opacity-80 transition"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
