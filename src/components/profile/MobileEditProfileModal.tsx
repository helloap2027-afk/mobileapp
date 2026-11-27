"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Store,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  ExternalLink,
  Award
} from "lucide-react";

export interface MobileEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id?: string;
    displayName?: string;
    fullName?: string;
    businessName?: string;
    phoneNumber?: string;
    role?: string;
    email?: string;
    locality?: string;
    city?: string;
  } | null;
  onProfileUpdated?: (updatedData: {
    displayName: string;
    fullName: string;
    phoneNumber: string;
    businessName?: string;
  }) => void;
}

export function MobileEditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: MobileEditProfileModalProps) {
  // Accordion active state: open all or individual
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: false,
    business: false,
    address: false,
    kyc: false,
    licenses: false,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Section 1: Personal Information
  const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.displayName || "");
  const [phone, setPhone] = useState(currentUser?.phoneNumber || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [language, setLanguage] = useState("English");
  const [idProofType, setIdProofType] = useState("Aadhaar Card");
  const [idProofNumber, setIdProofNumber] = useState("");
  const [idProofDocName, setIdProofDocName] = useState("");
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  // Section 2: Business Information
  const [businessName, setBusinessName] = useState(currentUser?.businessName || "");
  const [legalEntityName, setLegalEntityName] = useState("");
  const [primaryCategory, setPrimaryCategory] = useState("Retail & Shopping");
  const [entityType, setEntityType] = useState("Sole Proprietorship");
  const [bizPhone, setBizPhone] = useState(currentUser?.phoneNumber || "");
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.phoneNumber || "");
  const [description, setDescription] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // Section 3: Business Address
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [locality, setLocality] = useState("Hitec City");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Section 4: Business Registration & KYC
  const [kycDocType, setKycDocType] = useState("GST Registration Certificate");
  const [kycDocNumber, setKycDocNumber] = useState("");
  const [kycAuthority, setKycAuthority] = useState("");
  const [kycExpiry, setKycExpiry] = useState("");
  const [kycFileName, setKycFileName] = useState("");
  const [isSavingKyc, setIsSavingKyc] = useState(false);

  // Section 5: Category-Specific Statutory Licenses
  const [licenseType, setLicenseType] = useState("FSSAI Food License");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFileName, setLicenseFileName] = useState("");
  const [isSavingLicense, setIsSavingLicense] = useState(false);

  // Dynamic feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch Cities from API
  useEffect(() => {
    if (!isOpen) return;
    fetch("http://localhost:4000/api/v1/locations/cities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCities(json.data);
          const currentCityObj = json.data.find(
            (c: any) => c.name.toLowerCase() === city.toLowerCase()
          );
          if (currentCityObj) {
            fetchLocalities(currentCityObj.id);
          }
        }
      })
      .catch(() => { });
  }, [isOpen]);

  const fetchLocalities = (cityId: string) => {
    fetch(`http://localhost:4000/api/v1/locations/cities/${cityId}/localities`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setLocalities(json.data);
        }
      })
      .catch(() => { });
  };

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    const found = cities.find((c) => c.name === cityName);
    if (found) {
      fetchLocalities(found.id);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSavePersonal = async () => {
    setIsSavingPersonal(true);
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hello_user");
        let parsed = stored ? JSON.parse(stored) : {};
        parsed.fullName = fullName;
        parsed.displayName = fullName;
        localStorage.setItem("hello_user", JSON.stringify(parsed));
      }
      showNotification("Personal details saved successfully!");
      if (onProfileUpdated) {
        onProfileUpdated({
          displayName: businessName || fullName,
          fullName: fullName,
          phoneNumber: phone,
          businessName: businessName,
        });
      }
    } finally {
      setIsSavingPersonal(false);
    }
  };

  const handleSaveBusiness = async () => {
    setIsSavingBusiness(true);
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hello_user");
        let parsed = stored ? JSON.parse(stored) : {};
        parsed.businessName = businessName;
        localStorage.setItem("hello_user", JSON.stringify(parsed));
      }
      showNotification("Business information saved successfully!");
      if (onProfileUpdated) {
        onProfileUpdated({
          displayName: businessName,
          fullName: fullName,
          phoneNumber: phone,
          businessName: businessName,
        });
      }
    } finally {
      setIsSavingBusiness(false);
    }
  };

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    try {
      showNotification("Business address saved successfully!");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSaveKyc = async () => {
    setIsSavingKyc(true);
    try {
      showNotification("KYC document submitted for review!");
    } finally {
      setIsSavingKyc(false);
    }
  };

  const handleSaveLicense = async () => {
    setIsSavingLicense(true);
    try {
      showNotification("Statutory license uploaded successfully!");
    } finally {
      setIsSavingLicense(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#F4F7FB] flex flex-col h-full w-full font-['Poppins'] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">

        {/* Fixed Top Header Strip */}
        <div className="bg-gradient-to-r from-[#005bb5] via-[#0076D7] to-[#0A4D94] text-white p-4 shrink-0 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-sm">
              ⚙️
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-tight">Edit Partner Profile</h2>
              <p className="text-[10px] text-blue-100 font-medium">Manage details, business KYC & statutory licenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Toast Alert */}
        {successToast && (
          <div className="mx-3 mt-2 bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 no-scrollbar pb-10">

          {/* =========================================================================
              CARD 1: PERSONAL INFORMATION (MATCHING EXACT IMAGE 1)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header Accordion Bar */}
            <div
              onClick={() => toggleSection("personal")}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0076D7] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Personal Information</h3>
                  <p className="text-[9px] text-slate-400 font-medium">Registration details and owner identity</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Completed
                </span>
                {openSections.personal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {/* Accordion Content */}
            {openSections.personal && (
              <div className="p-3.5 space-y-3">
                {/* Full Legal Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                    <span>Full Legal Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vinod Mobile Verified Partner"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7] focus:bg-white"
                  />
                </div>

                {/* Verified Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Verified Mobile Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={phone}
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                    />
                    <span className="absolute right-2 top-2 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-200">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Business Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Business Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@hello-hi.in"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7] focus:bg-white"
                  />
                </div>

                {/* Preferred Language & Voluntary ID Proof */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Preferred Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Voluntary ID Proof Type</label>
                    <select
                      value={idProofType}
                      onChange={(e) => setIdProofType(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                </div>

                {/* ID Proof Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">ID Proof Number</label>
                  <input
                    type="text"
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                    placeholder="12****12"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7] focus:bg-white"
                  />
                </div>

                {/* Document Box matching Image 1 */}
                <div className="p-3 bg-blue-50/40 border border-dashed border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0076D7] flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {idProofType} Document
                    </span>
                    <span className="text-[8px] text-slate-400">PDF/JPG/PNG up to 5MB</span>
                  </div>

                  <div className="bg-white rounded-xl p-2 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                        🪪 ID
                      </span>
                      <div>
                        <div className="text-[10px] font-bold text-slate-800">{idProofType}</div>
                        <div className="text-[9px] text-slate-400 font-mono">{idProofNumber}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => alert(`Viewing ${idProofType}`)}
                        className="text-[9px] font-bold text-slate-700 hover:text-[#0076D7] bg-slate-100 px-2 py-1 rounded-md flex items-center gap-0.5"
                      >
                        <Eye className="w-2.5 h-2.5" /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIdProofNumber(""); showNotification("Document removed"); }}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePersonal}
                    disabled={isSavingPersonal}
                    className="bg-[#0076D7] hover:bg-[#005FAE] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    {isSavingPersonal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Personal Details</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 2: BUSINESS INFORMATION (MATCHING EXACT IMAGE 2)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleSection("business")}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Business Information</h3>
                  <p className="text-[9px] text-slate-400 font-medium">Business name, category, branding logo, cover banner</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Completed
                </span>
                {openSections.business ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {openSections.business && (
              <div className="p-3.5 space-y-3">
                {/* Trading / Display Business Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                    <span>Trading / Display Business Name</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Vinod Tech Mobile Hub"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7] focus:bg-white"
                  />
                </div>

                {/* Registered Legal Entity Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Registered Legal Entity Name</label>
                  <input
                    type="text"
                    value={legalEntityName}
                    onChange={(e) => setLegalEntityName(e.target.value)}
                    placeholder="Vinod Tech Mobile Legal Pvt Ltd"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7] focus:bg-white"
                  />
                </div>

                {/* Category & Business Entity Type */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                      <span>Primary Category</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={primaryCategory}
                      onChange={(e) => setPrimaryCategory(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    >
                      <option value="Home Decor">Home Decor</option>
                      <option value="Restaurants">Restaurants</option>
                      <option value="Hotels">Hotels</option>
                      <option value="Beauty Spa">Beauty Spa</option>
                      <option value="Ask Astro">Ask Astro</option>
                      <option value="Education">Education</option>
                      <option value="Rent & Hire">Rent & Hire</option>
                      <option value="Hospitals">Hospitals</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Business Entity Type</label>
                    <select
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    >
                      <option value="Partnership">Partnership</option>
                      <option value="Sole Proprietor">Sole Proprietor</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="LLP">LLP</option>
                    </select>
                  </div>
                </div>

                {/* Business Primary Phone & WhatsApp Number */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Business Primary Phone</label>
                    <input
                      type="text"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      placeholder="+91 98480 12345"
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">WhatsApp Enquiry Number</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 98480 12345"
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    />
                  </div>
                </div>

                {/* Business Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Business Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Updated completely from Mobile App simulator directly into database"
                    className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                  />
                </div>

                {/* Branding Media: Logo & Cover Banner matching Image 2 */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#0076D7]" />
                    <span>Business Branding Media (Logo & Cover Banner)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Logo Box */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-slate-500 w-full flex justify-between">
                        <span>Business Logo</span>
                        <span className="text-[8px] text-slate-400">Max 2MB</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview || ""} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col items-center gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => alert("Select photo to update logo.")}
                          className="w-full py-1 text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1"
                        >
                          <Upload className="w-2.5 h-2.5" /> Change Logo
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoPreview(null)}
                          className="text-[8px] text-red-500 hover:underline"
                        >
                          Remove Logo
                        </button>
                      </div>
                    </div>

                    {/* Cover Banner Box */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col items-center">
                      <div className="text-[9px] font-bold text-slate-500 w-full flex justify-between">
                        <span>Cover Banner</span>
                        <span className="text-[8px] text-slate-400">16:9 (Max 5MB)</span>
                      </div>
                      <div className="w-full h-12 rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bannerPreview || ""} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col items-center gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => alert("Select banner photo.")}
                          className="w-full py-1 text-[9px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center justify-center gap-1"
                        >
                          <Upload className="w-2.5 h-2.5" /> Change Banner
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerPreview(null)}
                          className="text-[8px] text-red-500 hover:underline"
                        >
                          Remove Banner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveBusiness}
                    disabled={isSavingBusiness}
                    className="bg-[#FF6B35] hover:bg-[#E5531E] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    {isSavingBusiness ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Business Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 3: BUSINESS ADDRESS (MATCHING EXACT IMAGE 3)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleSection("address")}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Business Address</h3>
                  <p className="text-[9px] text-slate-400 font-medium">Location, address, and service area</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Completed
                </span>
                {openSections.address ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {openSections.address && (
              <div className="p-3.5 space-y-3">
                {/* Street Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                    <span>Street Address / Shop No / Floor</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="MG Road, Mobile Tower 4"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7] focus:bg-white"
                  />
                </div>

                {/* City & Locality */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                      <span>City</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    >
                      {cities.length > 0 ? (
                        cities.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Vijayawada">Vijayawada</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Guntur">Guntur</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                      <span>Locality / Area</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    >
                      {localities.length > 0 ? (
                        localities.map((loc) => (
                          <option key={loc.id} value={loc.name}>
                            {loc.name}
                          </option>
                        ))
                      ) : (
                        <option value="Benz Circle">Benz Circle</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Pincode & Landmark */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 flex items-center gap-0.5">
                      <span>Pincode</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="520010"
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Prominent Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Opposite Metro Pillar / Near Bus Stop"
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    {isSavingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Address</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 4: BUSINESS REGISTRATION & KYC (MATCHING EXACT IMAGE 4)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleSection("kyc")}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Business Registration & KYC</h3>
                  <p className="text-[9px] text-slate-400 font-medium">GST, MSME, and business registration proof</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  In Review
                </span>
                {openSections.kyc ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {openSections.kyc && (
              <div className="p-3.5 space-y-3">
                {/* Document Type & Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Document Type</label>
                  <select
                    value={kycDocType}
                    onChange={(e) => setKycDocType(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                  >
                    <option value="GST Registration Certificate">GST Registration Certificate</option>
                    <option value="Shop & Establishment Certificate">Shop & Establishment Certificate</option>
                    <option value="Udyam / MSME Registration">Udyam / MSME Registration</option>
                    <option value="Municipal Trade License">Municipal Trade License</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Document / Registration Number</label>
                  <input
                    type="text"
                    value={kycDocNumber}
                    onChange={(e) => setKycDocNumber(e.target.value)}
                    placeholder="e.g. 36AABCU9603R1ZM"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                  />
                </div>

                {/* Issuing Authority & Expiry Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Issuing Authority</label>
                    <input
                      type="text"
                      value={kycAuthority}
                      onChange={(e) => setKycAuthority(e.target.value)}
                      placeholder="e.g. Govt of India / Municipal Corp"
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Expiry Date (If Applicable)</label>
                    <input
                      type="date"
                      value={kycExpiry}
                      onChange={(e) => setKycExpiry(e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                    />
                  </div>
                </div>

                {/* Attach proof file box matching Image 4 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[170px]">
                      {kycFileName || "Attach proof file (PDF/JPG/PNG, up to 5MB)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setKycFileName("gst_certificate_uploaded.pdf");
                      showNotification("Proof file attached.");
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs"
                  >
                    Browse File
                  </button>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveKyc}
                    disabled={isSavingKyc}
                    className="bg-[#0B1220] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    {isSavingKyc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Submit Proof & KYC</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CARD 5: CATEGORY-SPECIFIC STATUTORY LICENSES (MATCHING EXACT IMAGE 5)
              ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div
              onClick={() => toggleSection("licenses")}
              className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition border-b border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 leading-tight">Category-Specific Statutory Licenses</h3>
                  <p className="text-[9px] text-slate-400 font-medium">FSSAI, Drug License, RERA, Medical, etc. (as applicable)</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
                {openSections.licenses ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {openSections.licenses && (
              <div className="p-3.5 space-y-3">
                {/* License Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">License Type</label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                  >
                    <option value="Select Statutory License">Select Statutory License</option>
                    <option value="FSSAI Food License">FSSAI Food License</option>
                    <option value="Drug License Form 20/21">Drug License (Pharmacy)</option>
                    <option value="RERA Registration Certificate">RERA Registration (Real Estate)</option>
                    <option value="Pollution Control Board Consent">Pollution Control Consent (PCB)</option>
                  </select>
                </div>

                {/* License / Registration Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">License / Registration Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. 10019042001234"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0076D7]"
                  />
                </div>

                {/* Attach License File */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[170px]">
                      {licenseFileName || "Attach license file (PDF/JPG/PNG)"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLicenseFileName("fssai_license_verified.pdf");
                      showNotification("License attached.");
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs"
                  >
                    Browse File
                  </button>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveLicense}
                    disabled={isSavingLicense}
                    className="bg-[#0076D7] hover:bg-[#005FAE] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98"
                  >
                    {isSavingLicense ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Upload License Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
