"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Shield,
  HelpCircle,
  FileText,
  Phone,
  Info,
} from "lucide-react";

interface MobileCmsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  defaultTitle?: string;
}

const API_BASE = "http://localhost:4000/api/v1";

export function MobileCmsViewerModal({
  isOpen,
  onClose,
  slug,
  defaultTitle = "Information",
}: MobileCmsViewerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPageIcon = (s: string) => {
    if (s.includes("about")) return <Info className="w-4 h-4 text-white" />;
    if (s.includes("faq")) return <HelpCircle className="w-4 h-4 text-white" />;
    if (s.includes("term")) return <FileText className="w-4 h-4 text-white" />;
    if (s.includes("contact")) return <Phone className="w-4 h-4 text-white" />;
    if (s.includes("privacy")) return <Shield className="w-4 h-4 text-white" />;
    return <Info className="w-4 h-4 text-white" />;
  };

  const fetchPage = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/cms/pages/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        // Fallback to admin CMS endpoint
        const fallbackRes = await fetch(`${API_BASE}/admin/cms/pages/${slug}?lang=en`);
        const fallbackJson = await fallbackRes.json();
        if (fallbackJson.success && fallbackJson.data) {
          setData(fallbackJson.data);
        } else {
          setError(json.message || "Failed to load content from central CMS.");
        }
      }
    } catch {
      setError("Network error connecting to API service. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && slug) {
      fetchPage();
    }
  }, [isOpen, slug]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-[#F4F7FB] z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Full Page Native Header */}
      <div className="bg-gradient-to-r from-[#005bb5] via-[#0076D7] to-[#0A4D94] px-4 pt-3.5 pb-4 flex items-center justify-between text-white shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition shadow-xs border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {getPageIcon(slug)}
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white line-clamp-1">
                {data?.title || defaultTitle}
              </h2>
              <p className="text-[10px] text-blue-100 font-medium">Hello-Hi Official Information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Page Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-[#0076D7]" />
            <p className="text-xs font-bold text-slate-500">Loading published content...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3 shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h4 className="text-sm font-black text-rose-800">Unable to load document</h4>
            <p className="text-xs text-rose-600 font-medium">{error}</p>
            <button
              onClick={fetchPage}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Title & Metadata Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#FF6B35] bg-orange-50 px-2.5 py-0.5 rounded-md inline-block">
                Official Published Policy
              </span>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                {data?.title}
              </h1>
              {data?.updatedAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Last updated: {new Date(data.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}

              {data?.shortDescription && (
                <div className="mt-2 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 font-medium leading-relaxed">
                  {data.shortDescription}
                </div>
              )}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
              <div
                className="text-xs text-slate-700 leading-relaxed space-y-3 prose prose-sm max-w-none 
                [&_h2]:text-sm [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-1.5 [&_h2]:pb-1 [&_h2]:border-b [&_h2]:border-slate-100
                [&_h3]:text-xs [&_h3]:font-black [&_h3]:text-slate-800 [&_h3]:mt-3 [&_h3]:mb-1
                [&_p]:text-xs [&_p]:text-slate-600 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1.5 [&_ul]:text-xs [&_ul]:text-slate-600
                [&_li]:text-xs [&_strong]:text-slate-900 [&_strong]:font-black"
                dangerouslySetInnerHTML={{ __html: data?.content || "<p>No content published yet.</p>" }}
              />

              {/* FAQs if present */}
              {Array.isArray(data?.faqItems) && data.faqItems.length > 0 && (
                <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-2.5">
                    {data.faqItems.map((faq: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
                        <p className="text-xs font-black text-slate-900">{faq.question}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
