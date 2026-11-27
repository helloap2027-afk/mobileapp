"use client";

import React, { useState } from "react";
import {
  MapPin,
  ChevronDown,
  Bell,
  User,
  CheckCircle2,
  Building2,
  Layers,
  Calendar,
  FileText,
  HelpCircle,
  Phone,
  Shield,
  Zap,
  ChevronRight,
  LogIn,
  UserPlus,
  Store,
  Briefcase,
  Edit3,
  Lock,
  LogOut,
  Info,
} from "lucide-react";
import { MobileCmsViewerModal } from "./MobileCmsViewerModal";
import { MobilePlansModal } from "./MobilePlansModal";
import { MobileHelpCenterModal } from "../MobileHelpCenterModal";

export interface MobileProfileScreenProps {
  selectedCity: string;
  selectedLocality: string;
  onOpenCitySelector?: () => void;
  // Auth state
  isAuthenticated: boolean;
  currentUser?: {
    id?: string;
    displayName?: string;
    fullName?: string;
    businessName?: string;
    phoneNumber?: string;
    role?: "CUSTOMER" | "BUSINESS_PARTNER" | "VENDOR" | string;
    status?: string;
    isVerified?: boolean;
    avatarUrl?: string;
  } | null;
  onOpenAuth: (role?: "customer" | "vendor", tab?: "login" | "register") => void;
  onSignOut: () => void;
  onEditProfile?: () => void;
  onNavigateTab?: (tab: "Home" | "Services" | "Enquiries" | "Notifications" | "Profile") => void;
}

export function MobileProfileScreen({
  selectedCity,
  selectedLocality,
  onOpenCitySelector,
  isAuthenticated,
  currentUser,
  onOpenAuth,
  onSignOut,
  onEditProfile,
  onNavigateTab,
}: MobileProfileScreenProps) {
  // Navigation & viewer modal states
  const [cmsSlug, setCmsSlug] = useState<string | null>(null);
  const [cmsTitle, setCmsTitle] = useState<string>("Information");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);

  // Authenticated profile derivations
  const isVendor =
    currentUser?.role?.toUpperCase().includes("VENDOR") ||
    currentUser?.role?.toUpperCase().includes("BUSINESS") ||
    currentUser?.role?.toUpperCase().includes("PARTNER");

  const displayName =
    currentUser?.businessName ||
    currentUser?.displayName ||
    currentUser?.fullName ||
    (isVendor ? "Business Partner" : "Customer User");

  const displayPhone = currentUser?.phoneNumber || "";
  const displayUserId = currentUser?.id ? `usr_${currentUser.id.substring(0, 14)}...` : "";
  const displayStatus = currentUser?.status || "Active";
  const isVerified = currentUser?.isVerified !== undefined ? currentUser.isVerified : false;
  const displayRole = isVendor ? "Business Partner" : "Customer";

  const openCms = (slug: string, title: string) => {
    setCmsSlug(slug);
    setCmsTitle(title);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F4F7FB] pb-8 font-['Poppins']">
      {/* =========================================================================
          1. TOP BLUE BRANDED HEADER (MATCHING EXACT APPROVED IMAGE)
          ========================================================================= */}
      <div className="relative bg-gradient-to-b from-[#005bb5] via-[#0076D7] to-[#0A4D94] text-white pt-3 pb-8 px-4 overflow-hidden rounded-b-[32px] shadow-md">
        {/* Subtle orange curved background accent on top-right */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#FF6B35] to-transparent opacity-45 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
        <div className="absolute top-1/2 left-0 w-44 h-44 bg-[#00A3FF] opacity-20 rounded-full blur-2xl pointer-events-none -ml-20" />
        <div className="absolute bottom-0 right-0 w-36 h-20 bg-gradient-to-t from-[#FF6B35]/35 to-transparent rounded-tl-full pointer-events-none" />

        {/* Brand Centered Logo */}
        <div className="text-center relative z-10 pt-1 pb-3">
          <div className="inline-flex items-center justify-center gap-0.5">
            <span className="text-2xl font-black text-white tracking-tight">Hello-</span>
            <span className="text-2xl font-black text-[#FF8542] tracking-tight">Hi</span>
          </div>
          <p className="text-[10px] font-medium text-blue-100 tracking-wide mt-0.5">
            Search Local. Connect Instant.
          </p>
        </div>

        {/* Header Controls Bar */}
        <div className="flex items-center justify-between gap-2 relative z-10 mt-1">
          {/* Location Selector Pill */}
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/20 active:scale-98 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/25 text-left transition shadow-xs max-w-[55%]"
          >
            <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-xs font-bold text-white truncate">
              {selectedCity} ({selectedLocality})
            </span>
            <ChevronDown className="w-3 h-3 text-white/80 shrink-0 ml-0.5" />
          </button>

          {/* Right Header: Identity pill (Logged In) OR Notification Bell */}
          <div className="flex items-center gap-2">
            

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => onNavigateTab ? onNavigateTab("Notifications") : openCms("about-us", "Official Announcements")}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 flex items-center justify-center transition active:scale-95 shadow-xs"
              >
                <Bell className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN BODY CONTAINER WITH OVERLAPPING UPPER MARGIN
          ========================================================================= */}
      <div className="px-3.5 -mt-5 space-y-3 relative z-20">

        {/* =========================================================================
            2. TOP CARD: WELCOME (BEFORE LOGIN) vs BUSINESS PARTNER (AFTER LOGIN)
            ========================================================================= */}
        {!isAuthenticated ? (
          /* ================= GUEST MODE (BEFORE LOGIN) ================= */
          <div className="relative bg-gradient-to-r from-[#003B73] via-[#004E98] to-[#005BB5] rounded-3xl p-4 text-white shadow-xl overflow-hidden border border-blue-400/20">
            {/* Orange curved bottom-right decorative accent */}
            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-gradient-to-tl from-[#FF6B35] to-transparent rounded-full opacity-60 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              {/* Circular light avatar with blue generic user silhouette */}
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-md ring-4 ring-white/20">
                <User className="w-7 h-7 text-[#0076D7]" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-base font-black text-white tracking-tight leading-tight">
                  Welcome to Hello-Hi
                </h3>
                <p className="text-[10px] text-blue-100 font-medium leading-snug mt-1 opacity-90 line-clamp-2">
                  Login or Register to access your account, book services, manage enquiries and more.
                </p>
              </div>

              {/* Stacked Right Action Buttons: Login & Register */}
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onOpenAuth("customer", "login")}
                  className="px-3.5 py-1.5 rounded-xl border border-white/80 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1.5 transition shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onOpenAuth("customer", "register")}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF8542] hover:opacity-95 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= LOGGED IN MODE (AFTER LOGIN) ================= */
          <div className="relative bg-gradient-to-r from-[#003B73] via-[#004E98] to-[#005BB5] rounded-3xl p-4 text-white shadow-xl overflow-hidden border border-blue-400/20">
            {/* Orange curved bottom-right accent */}
            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-gradient-to-tl from-[#FF6B35] to-transparent rounded-full opacity-60 pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Photo Avatar with White Ring matching image */}
                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-tr from-[#0076D7] to-[#FF6B35] text-white flex items-center justify-center text-lg font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-black text-white tracking-tight truncate">
                    {displayName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-blue-100 font-bold mt-0.5">
                    <Phone className="w-3 h-3 text-white shrink-0" />
                    <span>{displayPhone}</span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <div className="inline-flex items-center gap-1 bg-[#FFF2EB] text-[#FF6B35] px-2 py-0.5 rounded-full text-[9px] font-black shadow-2xs">
                      <Store className="w-2.5 h-2.5 text-[#FF6B35]" />
                      <span>{displayRole}</span>
                    </div>

                    {isVerified && (
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Profile Action Button */}
              <button
                onClick={onEditProfile}
                className="px-3 py-1.5 rounded-xl border border-white/80 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 transition shadow-2xs shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. MIDDLE SECTION: GUEST ACCESS (GUEST) vs ACCOUNT DETAILS (LOGGED IN)
            ========================================================================= */}
        {!isAuthenticated ? (
          /* GUEST ACCESS - 4 CARDS (2x2 GRID - COMPACT) */
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0076D7]" />
              <h3 className="text-xs font-black text-slate-900 tracking-tight">Guest Access</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Card 1: Browse Services */}
              <button
                onClick={() => onNavigateTab && onNavigateTab("Services")}
                className="bg-[#F8FAFC] hover:bg-blue-50/50 active:scale-98 border border-slate-200/80 hover:border-blue-200 rounded-xl p-2.5 text-left transition shadow-2xs group flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-[#0076D7] flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">Browse Services</h4>
                  <p className="text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Explore & book verified services
                  </p>
                </div>
              </button>

              {/* Card 2: View Plans */}
              <button
                onClick={() => setIsPlansOpen(true)}
                className="bg-[#F8FAFC] hover:bg-blue-50/50 active:scale-98 border border-slate-200/80 hover:border-blue-200 rounded-xl p-2.5 text-left transition shadow-2xs group flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100/70 text-[#0076D7] flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">View Plans</h4>
                  <p className="text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Check subscription plans
                  </p>
                </div>
              </button>

              {/* Card 3: Get Help */}
              <button
                onClick={() => setIsHelpOpen(true)}
                className="bg-[#F8FAFC] hover:bg-orange-50/50 active:scale-98 border border-slate-200/80 hover:border-orange-200 rounded-xl p-2.5 text-left transition shadow-2xs group flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-100/80 text-[#FF6B35] flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">Get Help</h4>
                  <p className="text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    FAQs & support articles
                  </p>
                </div>
              </button>

              {/* Card 4: Stay Updated */}
              <button
                onClick={() => onNavigateTab ? onNavigateTab("Notifications") : openCms("about-us", "Offers & Announcements")}
                className="bg-[#F8FAFC] hover:bg-purple-50/50 active:scale-98 border border-slate-200/80 hover:border-purple-200 rounded-xl p-2.5 text-left transition shadow-2xs group flex flex-col justify-between"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 leading-tight">Stay Updated</h4>
                  <p className="text-[8.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    Offers, updates & announcements
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : null}

        {/* =========================================================================
            4. ACCOUNT ACTIONS (GUEST: 2 BUTTONS | LOGGED IN: 3 BUTTONS)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF6B35]" />
            <h3 className="text-xs font-black text-slate-900 tracking-tight">Account Actions</h3>
          </div>

          {!isAuthenticated ? (
            /* GUEST MODE: EXACT TWO BUTTONS (Login & Register) */
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onOpenAuth("customer", "login")}
                className="py-2.5 px-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-[#0076D7] font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-2xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>

              <button
                onClick={() => onOpenAuth("customer", "register")}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF8542] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          ) : (
            /* LOGGED IN MODE: EXACT TWO BALANCED ACTION BUTTONS (Edit Profile & Sign Out) */
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onEditProfile}
                className="py-2.5 px-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-[#0076D7] font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-2xs"
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={onSignOut}
                className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FF8542] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-sm"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            5. COMPANY & INFORMATION (EXACT 5 ROWS - IDENTICAL IN BOTH MODES)
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-[#0076D7]" />
            <h3 className="text-xs font-black text-slate-900 tracking-tight">Company & Information</h3>
          </div>

          {/* Row 1 — About Hello-Hi */}
          <button
            onClick={() => openCms("about-us", "About Hello-Hi")}
            className="w-full bg-[#F8FAFC] hover:bg-blue-50/50 active:scale-99 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between transition shadow-2xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-[#0076D7] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <span className="text-sm font-black">ℹ️</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">About Hello-Hi</h4>
                <p className="text-[10px] text-slate-500 font-medium">Mission, pillars & verified discovery engine</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
          </button>

          {/* Row 2 — Frequently Asked Questions (FAQ) */}
          <button
            onClick={() => openCms("faqs", "Frequently Asked Questions")}
            className="w-full bg-[#F8FAFC] hover:bg-orange-50/50 active:scale-99 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between transition shadow-2xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100/70 text-[#FF6B35] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <span className="text-sm font-black">❓</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Frequently Asked Questions (FAQ)</h4>
                <p className="text-[10px] text-slate-500 font-medium">Instant answers about verification & quotes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
          </button>

          {/* Row 3 — Terms & Conditions */}
          <button
            onClick={() => openCms("terms-and-conditions", "Terms & Conditions")}
            className="w-full bg-[#F8FAFC] hover:bg-amber-50/50 active:scale-99 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between transition shadow-2xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <span className="text-sm font-black">📄</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Terms & Conditions</h4>
                <p className="text-[10px] text-slate-500 font-medium">Platform rules, merchant & customer policy</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
          </button>

          {/* Row 4 — Contact Us & Support */}
          <button
            onClick={() => openCms("contact-support", "Contact Us & Support")}
            className="w-full bg-[#F8FAFC] hover:bg-emerald-50/50 active:scale-99 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between transition shadow-2xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <span className="text-sm font-black">📞</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Contact Us & Support</h4>
                <p className="text-[10px] text-slate-500 font-medium">Toll-free, WhatsApp desk & DB enquiry form</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
          </button>

          {/* Row 5 — Privacy Policy (DPDP Act 2023) */}
          <button
            onClick={() => openCms("privacy-policy", "Privacy Policy (DPDP Act 2023)")}
            className="w-full bg-[#F8FAFC] hover:bg-purple-50/50 active:scale-99 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between transition shadow-2xs group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <span className="text-sm font-black">🛡️</span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Privacy Policy (DPDP Act 2023)</h4>
                <p className="text-[10px] text-slate-500 font-medium">Data minimization & encryption protections</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
          </button>
        </div>

      </div>

      {/* =========================================================================
          DYNAMIC MODALS: CMS VIEWER, PLANS MODAL & HELP CENTER MODAL
          ========================================================================= */}
      {cmsSlug && (
        <MobileCmsViewerModal
          isOpen={Boolean(cmsSlug)}
          onClose={() => setCmsSlug(null)}
          slug={cmsSlug}
          defaultTitle={cmsTitle}
        />
      )}

      {isPlansOpen && (
        <MobilePlansModal
          isOpen={isPlansOpen}
          onClose={() => setIsPlansOpen(false)}
          isAuthenticated={isAuthenticated}
          userRole={isVendor ? "BUSINESS" : "CUSTOMER"}
          onRequireLogin={() => onOpenAuth(isVendor ? "vendor" : "customer")}
        />
      )}

      {isHelpOpen && (
        <MobileHelpCenterModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          currentUser={currentUser}
          mode={isVendor ? "vendor" : "customer"}
        />
      )}
    </div>
  );
}
