"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Languages,
  FileText,
  Copy,
  Check,
  Sparkles,
  ClipboardPaste,
  RotateCcw,
  Search,
  BookOpen,
  AlertTriangle,
  ArrowRightLeft,
  Sliders,
  CheckCircle2,
  Info,
  Wand2,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import {
  processSafeMessage,
  RISKY_CATEGORIES,
  ALL_DEFAULT_RISKY_WORDS,
  ObfuscationMethod,
  ProcessedResult,
} from "@/lib/safeWordEngine";
import { FIVERR_TEMPLATES } from "@/lib/templates";

export default function Home() {
  const highlightToggleId = useId();

  // Day/Night Theme State (Default to 'light' as requested)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("fiverr_app_theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("fiverr_app_theme", nextTheme);
    } catch {
      // ignore
    }
  };

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    "safe-tool" | "delivery-formatter" | "translator" | "word-bank"
  >("safe-tool");

  // Toast notification
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Safe Message State ---
  const [inputText, setInputText] = useState("");
  const [highlightToggle, setHighlightToggle] = useState(true);
  const [obfuscationMethod, setObfuscationMethod] = useState<ObfuscationMethod>("hyphen");
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [newCustomWord, setNewCustomWord] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [processedResult, setProcessedResult] = useState<ProcessedResult>({
    originalText: "",
    safeText: "",
    highlightedHtml: "",
    detectedWords: [],
    totalViolations: 0,
    wordCountOriginal: 0,
    charCountOriginal: 0,
    wordCountSafe: 0,
    charCountSafe: 0,
  });

  // Load custom words from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fiverr_safe_custom_words");
      if (saved) {
        setCustomWords(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save custom words
  const addCustomWord = () => {
    const trimmed = newCustomWord.trim().toLowerCase();
    if (!trimmed) return;
    if (customWords.includes(trimmed) || ALL_DEFAULT_RISKY_WORDS.includes(trimmed)) {
      showToast("এই শব্দটি ইতিমধ্যে তালিকায় রয়েছে!", "info");
      return;
    }
    const updated = [...customWords, trimmed];
    setCustomWords(updated);
    setNewCustomWord("");
    localStorage.setItem("fiverr_safe_custom_words", JSON.stringify(updated));
    showToast(`"${trimmed}" শব্দটি কাস্টম তালিকায় যুক্ত হয়েছে!`, "success");
  };

  const removeCustomWord = (word: string) => {
    const updated = customWords.filter((w) => w !== word);
    setCustomWords(updated);
    localStorage.setItem("fiverr_safe_custom_words", JSON.stringify(updated));
    showToast(`"${word}" রিমুভ করা হয়েছে`, "info");
  };

  // Live scanning
  useEffect(() => {
    if (inputText.trim()) {
      const result = processSafeMessage(inputText, {
        highlight: highlightToggle,
        obfuscationMethod,
        customWords,
      });
      setProcessedResult(result);
    } else {
      setProcessedResult({
        originalText: "",
        safeText: "",
        highlightedHtml: "",
        detectedWords: [],
        totalViolations: 0,
        wordCountOriginal: 0,
        charCountOriginal: 0,
        wordCountSafe: 0,
        charCountSafe: 0,
      });
    }
  }, [inputText, highlightToggle, obfuscationMethod, customWords]);

  // Clipboard operations
  const copyToClipboard = async (text: string, label = "মেসেজ") => {
    if (!text.trim()) {
      showToast("কপি করার মতো কিছু নেই!", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast(`✅ ${label} সফলভাবে কপি হয়েছে!`, "success");
    } catch {
      showToast("কপিতে সমস্যা হয়েছে!", "error");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showToast("ক্লিপবোর্ড ফাঁকা!", "info");
        return;
      }
      setInputText(text);
      showToast("ক্লিপবোর্ড থেকে পেস্ট করা হয়েছে!", "success");
    } catch {
      const manual = prompt("ক্লিপবোর্ড পারমিশন দিন অথবা এখানে টেক্সট পেস্ট করুন:");
      if (manual) {
        setInputText(manual);
        showToast("ইনপুট দেওয়া হয়েছে!", "success");
      }
    }
  };

  const loadSampleRiskyMessage = () => {
    const sample = `Hello client! Thanks for hiring me. You can send payment directly to my paypal or stripe account so we avoid fiverr fees. Also message me on whatsapp or call my phone number +123456789. If you like the work, please give me a 5 star review on trustpilot or google reviews!`;
    setInputText(sample);
    showToast("নমুনা ঝুঁকিপূর্ণ মেসেজ লোড হয়েছে!", "info");
  };

  // --- Delivery Formatter State ---
  const [messyNotes, setMessyNotes] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [formattedDelivery, setFormattedDelivery] = useState("");
  const [isFormatting, setIsFormatting] = useState(false);

  const handleAIFormatDelivery = async () => {
    if (!messyNotes.trim()) {
      showToast("অনুগ্রহ করে আপনার কাজের রাফ নোট বা বিবরণ লিখুন!", "error");
      return;
    }
    setIsFormatting(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "format-delivery",
          text: messyNotes,
          websiteUrl: liveUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ডেলিভারি মেসেজ তৈরিতে সমস্যা হয়েছে");
      }
      setFormattedDelivery(data.result);
      showToast("AI ডেলিভারি মেসেজ সুন্দরভাবে ফরম্যাট করে তৈরি করেছে!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "সমস্যা হয়েছে, পুনরায় চেষ্টা করুন", "error");
    } finally {
      setIsFormatting(false);
    }
  };

  const loadSampleMessyNotes = () => {
    setMessyNotes(
      "i fixed the responsiveness on mobile phones, also integrated payment gateway stripe and added contact form with email notifications. then uploaded all client products and tested the shopping cart. client website is ready."
    );
    setLiveUrl("https://my-client-store.vercel.app");
    showToast("অগোছালো কাজের নমুনা নোটস লোড হয়েছে!", "info");
  };

  const transferDeliveryToSafeTool = () => {
    if (!formattedDelivery.trim()) return;
    setInputText(formattedDelivery);
    setActiveTab("safe-tool");
    showToast("সেফ মেসেজ টুলে পাঠানো হয়েছে! ঝুঁকিপূর্ণ শব্দ চেক হচ্ছে...", "info");
  };

  const transferSafeToDeliveryFormatter = () => {
    const textToTransfer = processedResult.safeText || inputText;
    if (!textToTransfer.trim()) {
      showToast("ফরম্যাট করার মতো কোনো মেসেজ নেই! আগে মেসেজ লিখুন।", "info");
      return;
    }
    setMessyNotes(textToTransfer);
    setActiveTab("delivery-formatter");
    showToast("📋 ডেলিভারি রি-রাইটার (Delivery Formatter) ট্যাবে পাঠানো হয়েছে! ফরম্যাট করে নিন।", "success");
  };

  // --- Translator State ---
  const [translateDirection, setTranslateDirection] = useState<"en-to-bn" | "bn-to-en">("en-to-bn");
  const [translateInput, setTranslateInput] = useState("");
  const [translateOutput, setTranslateOutput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!translateInput.trim()) {
      showToast("অনুবাদ করার জন্য টেক্সট লিখুন!", "error");
      return;
    }
    setIsTranslating(true);
    try {
      const sourceLang = translateDirection === "en-to-bn" ? "en" : "bn";
      const targetLang = translateDirection === "en-to-bn" ? "bn" : "en";
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text: translateInput,
          sourceLang,
          targetLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "অনুবাদে সমস্যা হয়েছে");
      }
      setTranslateOutput(data.result);
      showToast("অনুবাদ সম্পন্ন হয়েছে!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "অনুবাদে সমস্যা হয়েছে", "error");
    } finally {
      setIsTranslating(false);
    }
  };

  const transferTranslationToSafeTool = () => {
    if (!translateOutput.trim()) return;
    setInputText(translateOutput);
    setActiveTab("safe-tool");
    showToast("অনূদিত মেসেজ সেফ টুলে পাঠানো হয়েছে!", "info");
  };

  // --- Word Bank Search ---
  const [searchWord, setSearchWord] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const isLight = theme === "light";

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLight ? "bg-[#f4f7f6] text-slate-900" : "bg-[#0b0f19] text-slate-100"
      }`}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 border text-sm font-medium ${
            toast.type === "success"
              ? isLight
                ? "bg-white border-[#1dbf73] text-emerald-800 shadow-emerald-500/10"
                : "bg-[#102a1c] border-[#1dbf73] text-[#34d399]"
              : toast.type === "error"
              ? isLight
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-[#2d1215] border-red-500 text-red-300"
              : isLight
              ? "bg-blue-50 border-blue-300 text-blue-800"
              : "bg-[#182338] border-blue-400 text-blue-200"
          }`}
        >
          {toast.type === "success" && <Check className="w-5 h-5 text-[#1dbf73]" />}
          {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-red-500" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar - Ultra Premium Design */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isLight
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.06)]"
            : "bg-[#0a0e17]/95 backdrop-blur-xl border-b border-slate-800 shadow-[0_6px_30px_-4px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Top Glowing Emerald Accent Ribbon */}
        <div className="h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-[#1dbf73] to-teal-400 opacity-90"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-22 flex items-center justify-between">
          {/* Logo & Luxury Brand Title */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#1dbf73] via-emerald-400 to-teal-500 opacity-60 blur-xs transition duration-300 group-hover:opacity-100"></div>
              <img
                src="/logo.jpg"
                alt="Fiverr SafeGuard Pro Logo"
                className={`relative w-13 h-13 rounded-2xl object-cover border-2 shadow-lg shadow-[#1dbf73]/25 transition duration-300 group-hover:scale-105 ${
                  isLight ? "border-white" : "border-slate-800"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1
                  className={`font-extrabold text-2xl tracking-tight ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  Fiverr{" "}
                  <span className="bg-gradient-to-r from-[#1dbf73] via-[#10b981] to-teal-500 bg-clip-text text-transparent">
                    SafeGuard
                  </span>
                </h1>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#1dbf73]/15 to-emerald-500/20 text-[#1dbf73] border border-[#1dbf73]/35 shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1dbf73]" />
                  PRO ELITE
                </span>
              </div>
              <div
                className={`text-xs ${
                  isLight ? "text-slate-600" : "text-slate-400"
                } hidden sm:flex items-center gap-1.5 mt-0.5 font-medium`}
              >
                <span>🛡️ ফাইভার মেসেজ সেফটি শিল্ড</span>
                <span className="opacity-40">•</span>
                <span>📋 এআই ডেলিভারি স্টুডিও</span>
                <span className="opacity-40">•</span>
                <span>🌐 ইংরেজি ⇄ বাংলা অনুবাদক</span>
              </div>
            </div>
          </div>

          {/* Right Actions: Live Status Badges & Day/Night Toggle */}
          <div className="flex items-center gap-3">
            {/* Live Filter Count Pill */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isLight
                  ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-800"
                  : "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#1dbf73]" />
              <span>৮০+ ফিল্টার একটিভ</span>
            </div>

            {/* AI Active Indicator with Pulsing Light */}
            <div
              className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-700"
                  : "bg-[#121927] border-[#22314a] text-slate-200"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1dbf73] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1dbf73]"></span>
              </span>
              <span>AI Connected</span>
            </div>

            {/* Premium Day / Night Switcher */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-800"
                  : "bg-[#152033] hover:bg-[#1c2c47] border-[#263a5c] text-amber-300"
              }`}
              title="Toggle Day/Night Mode"
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="font-semibold">Night Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Day Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Premium Floating Segmented Navigation Tabs */}
        <div
          className={`border-t px-4 sm:px-6 transition-colors ${
            isLight ? "bg-slate-50/70 border-slate-200/70" : "bg-[#090d16]/80 border-[#152033]"
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto py-2.5 gap-2">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setActiveTab("safe-tool")}
                className={`flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "safe-tool"
                    ? "bg-gradient-to-r from-[#1dbf73] to-[#129454] text-white shadow-md shadow-[#1dbf73]/25 scale-[1.01]"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                    : "text-slate-300 hover:text-white hover:bg-[#141d2e]"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>🛡️ সেফ মেসেজ (Safe Tool)</span>
                {processedResult.totalViolations > 0 && (
                  <span className="ml-1 text-[11px] px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold animate-bounce">
                    {processedResult.totalViolations}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("delivery-formatter")}
                className={`flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "delivery-formatter"
                    ? "bg-gradient-to-r from-[#1dbf73] to-[#129454] text-white shadow-md shadow-[#1dbf73]/25 scale-[1.01]"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                    : "text-slate-300 hover:text-white hover:bg-[#141d2e]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>📋 ডেলিভারি রি-রাইটার (Delivery Formatter)</span>
                <span
                  className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                    activeTab === "delivery-formatter"
                      ? "bg-black/20 text-white"
                      : "bg-emerald-500/20 text-[#1dbf73]"
                  }`}
                >
                  AI
                </span>
              </button>

              <button
                onClick={() => setActiveTab("translator")}
                className={`flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "translator"
                    ? "bg-gradient-to-r from-[#1dbf73] to-[#129454] text-white shadow-md shadow-[#1dbf73]/25 scale-[1.01]"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                    : "text-slate-300 hover:text-white hover:bg-[#141d2e]"
                }`}
              >
                <Languages className="w-4 h-4" />
                <span>🌐 ইংরেজি ⇄ বাংলা (Translator)</span>
              </button>

              <button
                onClick={() => setActiveTab("word-bank")}
                className={`flex items-center gap-2.5 px-4.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === "word-bank"
                    ? "bg-gradient-to-r from-[#1dbf73] to-[#129454] text-white shadow-md shadow-[#1dbf73]/25 scale-[1.01]"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                    : "text-slate-300 hover:text-white hover:bg-[#141d2e]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  🚫 নিষিদ্ধ শব্দ তালিকা ({ALL_DEFAULT_RISKY_WORDS.length + customWords.length})
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {/* User-Friendly Bengali Disclaimer Alert Banner */}
        <div
          className={`p-4 rounded-2xl border text-sm flex items-start gap-3.5 shadow-xs transition-colors ${
            isLight
              ? "bg-amber-50/90 border-amber-300/80 text-amber-900"
              : "bg-[#1f1912] border-amber-500/40 text-amber-200"
          }`}
        >
          <div
            className={`p-1 rounded-lg shrink-0 mt-0.5 ${
              isLight ? "bg-amber-100 text-amber-700" : "bg-amber-400/20 text-amber-300"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="leading-relaxed text-xs sm:text-sm">
            <strong
              className={`font-bold ${isLight ? "text-amber-900" : "text-amber-300"}`}
            >
              🔔 দ্রষ্টব্য:
            </strong>{" "}
            অনাকাঙ্খিত ঘটনা এড়াতে ফাইনাল মেসেজটি ম্যানুয়ালি চেক করে নেওয়ার অনুরোধ রইল। টুলটি সর্বোচ্চ
            সতর্কতার সাথে কাজ করলেও ১০০% নিখুঁত হওয়ার নিশ্চয়তা দেওয়া যায় না।
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SAFE MESSAGE TOOL (USER-FRIENDLY & HIGH-CONTRAST)   */}
        {/* ========================================================= */}
        {activeTab === "safe-tool" && (
          <div className="space-y-6">
            {/* Quick Action Toolbar */}
            <div
              className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-xs ${
                isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider mr-1 ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  সহজ অ্যাকশন:
                </span>
                <button
                  onClick={pasteFromClipboard}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                      : "bg-[#182338] hover:bg-[#202f4a] border-[#2b3c59] text-slate-200"
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-[#1dbf73]" />
                  ক্লিপবোর্ড পেস্ট
                </button>
                <button
                  onClick={loadSampleRiskyMessage}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    isLight
                      ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
                      : "bg-[#241e17] hover:bg-[#2e261d] border-amber-500/30 text-amber-300"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  নমুনা মেসেজ লোড করুন
                </button>
                <button
                  onClick={() => setInputText("")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition cursor-pointer ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                      : "bg-[#182338] hover:bg-[#202f4a] border-[#2b3c59] text-slate-300"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  মুছে ফেলুন (Clear)
                </button>
              </div>

              {/* Obfuscation & Highlight Settings */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span
                    className={`font-medium ${
                      isLight ? "text-slate-800" : "text-slate-300"
                    }`}
                  >
                    স্টাইল:
                  </span>
                  <select
                    value={obfuscationMethod}
                    onChange={(e) => setObfuscationMethod(e.target.value as ObfuscationMethod)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-[#1dbf73] cursor-pointer ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900"
                        : "bg-[#162135] border-[#283852] text-slate-200"
                    }`}
                  >
                    <option value="hyphen">হাইফেন (pay-ment)</option>
                    <option value="dot">ডট (pay.ment)</option>
                    <option value="slash">স্ল্যাশ (pay/ment)</option>
                    <option value="zerowidth">অদৃশ্য Zero-Width</option>
                  </select>
                </div>

                <label
                  htmlFor={highlightToggleId}
                  className={`flex items-center gap-2 cursor-pointer font-medium select-none ${
                    isLight ? "text-slate-800" : "text-slate-200"
                  }`}
                >
                  <input
                    id={highlightToggleId}
                    type="checkbox"
                    checked={highlightToggle}
                    onChange={(e) => setHighlightToggle(e.target.checked)}
                    className="rounded border-slate-300 text-[#1dbf73] focus:ring-[#1dbf73] w-4 h-4 cursor-pointer"
                  />
                  <span>🔦 হাইলাইট নিষিদ্ধ শব্দ</span>
                </label>
              </div>
            </div>

            {/* Input & Output Clean Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: Input Card */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col shadow-xs transition-colors ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className={`font-bold text-base flex items-center gap-2 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      <span>✍️ আপনার মেসেজটি লিখুন:</span>
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      (ফাইভারের যে মেসেজটি চেক করতে চান এখানে পেস্ট করুন)
                    </p>
                  </div>
                  <div
                    className={`text-xs font-mono px-2.5 py-1 rounded-lg border font-semibold ${
                      isLight
                        ? "bg-slate-100 border-slate-200 text-slate-700"
                        : "bg-[#162135] border-[#22324e] text-slate-300"
                    }`}
                  >
                    শব্দ: {processedResult.wordCountOriginal} | অক্ষর:{" "}
                    {processedResult.charCountOriginal}
                  </div>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="এখানে আপনার মেসেজ লিখুন... (যেমন: Hello, please pay via paypal or contact me on whatsapp for the project...)"
                  className={`w-full flex-1 min-h-[220px] p-4 rounded-xl border text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/50 focus:border-[#1dbf73] resize-y font-sans ${
                    isLight
                      ? "bg-slate-50/50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-[#0b0f19] border-[#22314a] text-slate-100 placeholder-slate-500"
                  }`}
                  style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!inputText.trim()) {
                        showToast("মেসেজ খালি! কিছু লিখুন বা পেস্ট করুন", "error");
                        return;
                      }
                      showToast(
                        processedResult.totalViolations > 0
                          ? `${processedResult.totalViolations}টি শব্দ নিরাপদ করা হয়েছে!`
                          : "মেসেজটি সম্পূর্ণ নিরাপদ!",
                        "success"
                      );
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm transition shadow-md shadow-[#1dbf73]/20 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>🔍 Make It Safe (নিরাপদ করুন)</span>
                  </button>

                  <span
                    className={`text-xs ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    টাইপ করার সাথে সাথে স্বয়ংক্রিয়ভাবে স্ক্যান হচ্ছে
                  </span>
                </div>
              </div>

              {/* Box 2: Safe Message Output Card */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col shadow-xs transition-colors ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className={`font-bold text-base flex items-center gap-2 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      <span>✅ Safe Message (নিরাপদ মেসেজ):</span>
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      (ফাইভারের রোবট যাতে ধরতে না পারে এমনভাবে প্রস্তুত)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {processedResult.totalViolations > 0 ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isLight
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-red-950/40 text-red-200 border-red-500/30"
                        }`}
                      >
                        {processedResult.totalViolations}টি শব্দ নিরাপদ করা হয়েছে
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isLight
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-emerald-950/40 text-[#1dbf73] border-[#1dbf73]/30"
                        }`}
                      >
                        ঝুঁকিমুক্ত
                      </span>
                    )}
                    <div
                      className={`text-xs font-mono px-2.5 py-1 rounded-lg border font-semibold ${
                        isLight
                          ? "bg-slate-100 border-slate-200 text-slate-700"
                          : "bg-[#162135] border-[#22324e] text-slate-300"
                      }`}
                    >
                      শব্দ: {processedResult.wordCountSafe}
                    </div>
                  </div>
                </div>

                {/* Safe Text Preview Box */}
                <div
                  className={`w-full flex-1 min-h-[220px] p-4 rounded-xl border text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap font-sans ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900"
                      : "bg-[#0b0f19] border-[#22314a] text-slate-100"
                  }`}
                  style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                >
                  {processedResult.highlightedHtml ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: highlightToggle
                          ? processedResult.highlightedHtml
                          : processedResult.safeText,
                      }}
                    />
                  ) : (
                    <span
                      className={`italic ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      বাম পাশের বক্সে মেসেজ লিখলে এখানে নিরাপদ মেসেজ চলে আসবে...
                    </span>
                  )}
                </div>

                {/* Output Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => copyToClipboard(processedResult.safeText, "নিরাপদ মেসেজ")}
                    disabled={!processedResult.safeText}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm transition shadow-md shadow-[#1dbf73]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>📋 Copy Safe Message</span>
                  </button>

                  <button
                    onClick={transferSafeToDeliveryFormatter}
                    disabled={!processedResult.safeText && !inputText}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition shadow-xs disabled:opacity-40 cursor-pointer ${
                      isLight
                        ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 hover:border-[#1dbf73]"
                        : "bg-[#0e271d] hover:bg-[#15382b] border-[#1dbf73]/40 text-emerald-300"
                    }`}
                    title="ডেলিভারি রি-রাইটার (Delivery Formatter) ট্যাবে পাঠিয়ে মেসেজের ফরম্যাট সুন্দর করুন"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1dbf73]" />
                    <span>ফরম্যাট ঠিক করে নাও</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!processedResult.safeText) return;
                      setInputText(processedResult.safeText);
                      showToast("নিরাপদ মেসেজ ইনপুট বক্সে নেওয়া হয়েছে!", "info");
                    }}
                    disabled={!processedResult.safeText}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition disabled:opacity-40 cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                        : "bg-[#182338] hover:bg-[#22314d] border-[#2a3c5a] text-slate-200"
                    }`}
                  >
                    📥 Paste to Input
                  </button>

                  <button
                    onClick={() => {
                      if (!processedResult.safeText) return;
                      setTranslateInput(processedResult.safeText);
                      setTranslateDirection("en-to-bn");
                      setActiveTab("translator");
                      showToast("অনুবাদক ট্যাবে পাঠানো হয়েছে!", "info");
                    }}
                    disabled={!processedResult.safeText}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition disabled:opacity-40 cursor-pointer ${
                      isLight
                        ? "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800"
                        : "bg-[#162135] hover:bg-[#202f4a] border-blue-500/30 text-blue-300"
                    }`}
                  >
                    <Languages className="w-3.5 h-3.5 text-blue-500" />
                    বাংলায় অনুবাদ করুন
                  </button>
                </div>
              </div>
            </div>

            {/* Detected Restricted Words Chips */}
            {processedResult.detectedWords.length > 0 && (
              <div
                className={`p-5 rounded-2xl border shadow-xs transition-colors ${
                  isLight
                    ? "bg-red-50/90 border-red-300 text-red-900"
                    : "bg-[#1f1315] border-red-500/30 text-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-2 font-bold ${
                      isLight ? "text-red-800" : "text-red-400"
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <span>
                      🚫 পাওয়া নিষিদ্ধ ও ঝুঁকিপূর্ণ শব্দসমূহ ({processedResult.detectedWords.length})
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    এই শব্দগুলো ফাইভারে ওয়ার্নিং ধরায়, তাই এগুলো হাইফেন দিয়ে নিরাপদ করা হয়েছে
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {processedResult.detectedWords.map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        isLight
                          ? "bg-white border-red-300 text-red-800 shadow-xs"
                          : "bg-red-900/30 border-red-500/30 text-red-200"
                      }`}
                    >
                      <span className="font-bold">{item.word}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                          isLight ? "bg-red-100 text-red-800" : "bg-red-900/60 text-red-300"
                        }`}
                      >
                        x{item.count}
                      </span>
                      <span className="text-[10px] opacity-75">({item.category})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SMART DELIVERY FORMATTER                           */}
        {/* ========================================================= */}
        {activeTab === "delivery-formatter" && (
          <div className="space-y-6">
            <div
              className={`p-5 rounded-2xl border shadow-xs transition-colors ${
                isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2
                    className={`text-lg font-bold flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <FileText className="w-5 h-5 text-[#1dbf73]" />
                    <span>অগোছালো কাজের নোটস থেকে প্রফেশনাল ডেলিভারি নোট তৈরি</span>
                  </h2>
                  <p
                    className={`text-xs mt-1 ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    কাজের রাফ পয়েন্ট বা উল্টাপাল্টা বর্ণনা লিখুন — AI স্বয়ংক্রিয়ভাবে গুছিয়ে আপনার কাঙ্ক্ষিত ফরম্যাটে বুলেট পয়েন্টে লিখে দেবে!
                  </p>
                </div>
                <button
                  onClick={loadSampleMessyNotes}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer self-start md:self-auto ${
                    isLight
                      ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
                      : "bg-[#1f1912] hover:bg-[#282118] border-amber-500/30 text-amber-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  নমুনা অগোছালো নোটস লোড করুন
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Messy Input */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col shadow-xs space-y-4 transition-colors ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                }`}
              >
                <div>
                  <label
                    className={`block text-sm font-bold mb-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    📝 অগোছালো কাজের নোটস বা কাজের বিবরণ (Messy Notes):
                  </label>
                  <p
                    className={`text-xs mb-2 ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    অর্ডারে যা যা কাজ সম্পন্ন করেছেন এলোমেলোভাবে হলেও লিখে ফেলুন:
                  </p>
                  <textarea
                    value={messyNotes}
                    onChange={(e) => setMessyNotes(e.target.value)}
                    placeholder="যেমন: i fixed header bug, made mobile view responsive, integrated stripe payment, changed product banner and added contact form..."
                    className={`w-full min-h-[160px] p-4 rounded-xl border text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/50 focus:border-[#1dbf73] font-sans ${
                      isLight
                        ? "bg-slate-50/50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        : "bg-[#0b0f19] border-[#22314a] text-slate-100 placeholder-slate-500"
                    }`}
                    style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-bold mb-1.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    🔗 লাইভ ওয়েবসাইট লিংক (Live Website URL - অপশনাল):
                  </label>
                  <input
                    type="text"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://client-demo-site.com (যদি থাকে)"
                    className={`w-full p-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/50 focus:border-[#1dbf73] ${
                      isLight
                        ? "bg-slate-50/50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        : "bg-[#0b0f19] border-[#22314a] text-slate-100 placeholder-slate-500"
                    }`}
                    style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                  />
                </div>

                {/* Target Formatting Template Preview */}
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800"
                      : "bg-[#141d2e] border-[#22324e] text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-[#1dbf73] mb-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>আপনার নির্দিষ্ট কাঙ্ক্ষিত ডেলিভারি ফরম্যাট:</span>
                  </div>
                  <pre
                    className={`font-mono text-[11px] p-2.5 rounded-lg border whitespace-pre-wrap ${
                      isLight
                        ? "bg-white border-slate-200 text-slate-700"
                        : "bg-[#0a0f18] border-[#1a263c] text-slate-400"
                    }`}
                  >
{`Hello there,
 
I hope you and your family are safe and sound!
 
As per your order requirements and message requests, I’ve completed the following tasks:

- I’ve [Task 1]
- I’ve [Task 2]
- I’ve [Task 3]

Please have a look at: [ website live url ]

For some reason, if you have any questions, modifications, or concerns, let me know. I’ll get back to you as soon as possible.

Best regards.`}
                  </pre>
                </div>

                <button
                  onClick={handleAIFormatDelivery}
                  disabled={isFormatting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm shadow-md shadow-[#1dbf73]/25 disabled:opacity-50 transition cursor-pointer"
                >
                  {isFormatting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>AI নোটস গুছিয়ে ফরম্যাট করছে...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>⚡ AI দিয়ে ডেলিভারি ফরম্যাটে রূপান্তর করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Structured Output */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col shadow-xs transition-colors ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className={`font-bold text-base flex items-center gap-2 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      <span>✨ প্রস্তুতকৃত ডেলিভারি মেসেজ:</span>
                    </h3>
                    <p
                      className={`text-xs mt-0.5 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                      }`}
                    >
                      (সরাসরি ফাইভারের ডেলিভারি বক্সে পেস্ট করার উপযোগী)
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      isLight
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-emerald-950/40 text-[#1dbf73] border-[#1dbf73]/30"
                    }`}
                  >
                    Ready to send
                  </span>
                </div>

                <textarea
                  value={formattedDelivery}
                  onChange={(e) => setFormattedDelivery(e.target.value)}
                  placeholder="ফরম্যাট করা ডেলিভারি মেসেজটি এখানে প্রদর্শিত হবে..."
                  className={`w-full flex-1 min-h-[300px] p-4 rounded-xl border text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/50 focus:border-[#1dbf73] font-sans ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                      : "bg-[#0b0f19] border-[#22314a] text-slate-100"
                  }`}
                  style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                />

                <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => copyToClipboard(formattedDelivery, "ডেলিভারি মেসেজ")}
                    disabled={!formattedDelivery}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm transition shadow-md shadow-[#1dbf73]/20 disabled:opacity-40 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>📋 Copy ডেলিভারি মেসেজ</span>
                  </button>

                  <button
                    onClick={transferDeliveryToSafeTool}
                    disabled={!formattedDelivery}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition disabled:opacity-40 cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                        : "bg-[#182338] hover:bg-[#22314d] border-[#2a3c5a] text-slate-100"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1dbf73]" />
                    <span>🛡️ Make Safe (ফাইভারের জন্য নিরাপদ করুন)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!formattedDelivery) return;
                      setTranslateInput(formattedDelivery);
                      setTranslateDirection("en-to-bn");
                      setActiveTab("translator");
                      showToast("অনুবাদক ট্যাবে পাঠানো হয়েছে!", "info");
                    }}
                    disabled={!formattedDelivery}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition disabled:opacity-40 cursor-pointer ${
                      isLight
                        ? "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800"
                        : "bg-[#162135] hover:bg-[#202f4a] border-blue-500/30 text-blue-300"
                    }`}
                  >
                    <Languages className="w-4 h-4 text-blue-500" />
                    বাংলায় অনুবাদ দেখুন
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Templates List */}
            <div
              className={`p-5 rounded-2xl border shadow-xs transition-colors ${
                isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
              }`}
            >
              <h3
                className={`font-bold mb-3 text-sm flex items-center gap-2 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                <span>📚 অন্যান্য গুরুত্বপূর্ণ ফাইভার টেমপ্লেটসমূহ:</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FIVERR_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setFormattedDelivery(
                        tmpl.template
                          .replace("{{websiteUrl}}", liveUrl || "[ website live url ]")
                          .replace("{{tasks}}", "\n- Task 1\n- Task 2\n- Task 3")
                      );
                      showToast(`"${tmpl.name}" লোড করা হয়েছে!`, "info");
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isLight
                        ? "bg-slate-50 hover:bg-white border-slate-200 hover:border-[#1dbf73]"
                        : "bg-[#141d2e] hover:bg-[#1a253a] border-[#22314a] hover:border-[#1dbf73]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`font-bold text-xs ${
                            isLight ? "text-slate-900" : "text-white"
                          }`}
                        >
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1dbf73]/15 text-[#1dbf73] font-bold">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p
                        className={`text-xs line-clamp-2 ${
                          isLight ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        {tmpl.description}
                      </p>
                    </div>
                    <span className="text-xs text-[#1dbf73] font-semibold mt-3 flex items-center gap-1">
                      টেমপ্লেট ব্যবহার করুন <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ENGLISH <-> BANGLA TRANSLATOR                      */}
        {/* ========================================================= */}
        {activeTab === "translator" && (
          <div className="space-y-6">
            <div
              className={`p-5 rounded-2xl border shadow-xs transition-colors ${
                isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2
                    className={`text-lg font-bold flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <Languages className="w-5 h-5 text-[#1dbf73]" />
                    <span>English ⇄ বাংলা ফ্রিল্যান্সার এআই অনুবাদক</span>
                  </h2>
                  <p
                    className={`text-xs mt-1 ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {translateDirection === "en-to-bn"
                      ? "বায়ারের পাঠানো জটিল বা লম্বা ইংরেজি মেসেজ পরিষ্কার ও সহজ বাংলায় বুঝে নিন।"
                      : "বাংলায় আপনার ভাবনা বা উত্তর লিখুন, AI ক্লায়েন্টের জন্য প্রফেশনাল ইংরেজিতে রূপান্তর করে দেবে।"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setTranslateDirection(
                      translateDirection === "en-to-bn" ? "bn-to-en" : "en-to-bn"
                    );
                    const temp = translateInput;
                    setTranslateInput(translateOutput);
                    setTranslateOutput(temp);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-xs shadow-md shadow-[#1dbf73]/20 transition cursor-pointer self-start md:self-auto"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>
                    দিক পরিবর্তন:{" "}
                    {translateDirection === "en-to-bn" ? "English ➔ বাংলা" : "বাংলা ➔ English"}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Input */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col shadow-xs transition-colors ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={`font-bold text-sm ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {translateDirection === "en-to-bn"
                      ? "🇬🇧 বায়ারের ইংরেজি মেসেজ (Buyer's Message):"
                      : "🇧🇩 আপনার বাংলা ইনপুট (Client Reply in Bengali):"}
                  </h3>
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setTranslateInput(text);
                        showToast("ক্লিপবোর্ড থেকে পেস্ট করা হয়েছে!", "success");
                      } catch {
                        // ignore
                      }
                    }}
                    className={`text-xs flex items-center gap-1 cursor-pointer font-medium ${
                      isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    পেস্ট করুন
                  </button>
                </div>

                <textarea
                  value={translateInput}
                  onChange={(e) => setTranslateInput(e.target.value)}
                  placeholder={
                    translateDirection === "en-to-bn"
                      ? "ক্লায়েন্টের ইংরেজি মেসেজ বা ব্রিফ এখানে পেস্ট করুন..."
                      : "আপনার বাংলা বা বাংলিশ কথা লিখুন (যেমন: আমি আপনার কাজ সম্পন্ন করেছি, দয়া করে চেক করে জানান কোনো সংশোধন লাগবে কিনা)..."
                  }
                  className={`w-full flex-1 min-h-[240px] p-4 rounded-xl border text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/50 focus:border-[#1dbf73] font-sans ${
                    isLight
                      ? "bg-slate-50/50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      : "bg-[#0b0f19] border-[#22314a] text-slate-100 placeholder-slate-500"
                  }`}
                  style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                />

                <div className="mt-4 flex items-center justify-between pt-2">
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm transition shadow-md shadow-[#1dbf73]/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isTranslating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>অনুবাদ করা হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>অনুবাদ করুন (Translate Now)</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setTranslateInput("");
                      setTranslateOutput("");
                    }}
                    className={`text-xs cursor-pointer ${
                      isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    মুছে ফেলুন (Clear)
                  </button>
                </div>
              </div>

              {/* Target Output */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 flex flex-col shadow-xs transition-colors ${
                  isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={`font-bold text-sm ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {translateDirection === "en-to-bn"
                      ? "🇧🇩 সহজ বাংলা অনুবাদ (Bengali Result):"
                      : "🇬🇧 বায়ারের জন্য প্রফেশনাল ইংরেজি (Client-ready English):"}
                  </h3>
                </div>

                <div
                  className={`w-full flex-1 min-h-[240px] p-4 rounded-xl border text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap font-sans ${
                    isLight
                      ? "bg-slate-50 border-slate-300 text-slate-900"
                      : "bg-[#0b0f19] border-[#22314a] text-slate-100"
                  }`}
                  style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                >
                  {translateOutput ? (
                    translateOutput
                  ) : (
                    <span
                      className={`italic ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      অনুবাদ ফলাফল এখানে প্রদর্শিত হবে...
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => copyToClipboard(translateOutput, "অনুবাদ")}
                    disabled={!translateOutput}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm transition shadow-md shadow-[#1dbf73]/20 disabled:opacity-40 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>📋 Copy অনুবাদ</span>
                  </button>

                  {translateDirection === "bn-to-en" && (
                    <button
                      onClick={transferTranslationToSafeTool}
                      disabled={!translateOutput}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition disabled:opacity-40 cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
                          : "bg-[#182338] hover:bg-[#22314d] border-[#2a3c5a] text-slate-100"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#1dbf73]" />
                      <span>🛡️ Send to Safe Shield</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RESTRICTED WORDS BANK                              */}
        {/* ========================================================= */}
        {activeTab === "word-bank" && (
          <div className="space-y-6">
            <div
              className={`p-5 sm:p-6 rounded-2xl border shadow-xs transition-colors ${
                isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2
                    className={`text-lg font-bold flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-[#1dbf73]" />
                    <span>ফাইভারের নিষিদ্ধ ও ঝুঁকিপূর্ণ শব্দের পূর্ণাঙ্গ তালিকা</span>
                  </h2>
                  <p
                    className={`text-xs mt-1 ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    ফাইভারের অ্যালগরিদম যেসব শব্দ পেলে ওয়ার্নিং অথবা একাউন্ট রেস্ট্রিক্ট করে, সেগুলোর পূর্ণাঙ্গ ডেটাবেজ।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomWord}
                    onChange={(e) => setNewCustomWord(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomWord()}
                    placeholder="নতুন কোনো শব্দ যোগ করুন..."
                    className={`p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#1dbf73] ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        : "bg-[#0b0f19] border-[#22314a] text-slate-100 placeholder-slate-500"
                    }`}
                    style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                  />
                  <button
                    onClick={addCustomWord}
                    className="px-4 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-xs transition cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    placeholder="শব্দ খুঁজুন (Search keyword)..."
                    className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#1dbf73] ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        : "bg-[#0b0f19] border-[#22314a] text-slate-100 placeholder-slate-500"
                    }`}
                    style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-2 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedCategory === "all"
                        ? "bg-[#1dbf73] text-white shadow-xs"
                        : isLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-[#162135] text-slate-300 hover:text-white"
                    }`}
                  >
                    সব ({ALL_DEFAULT_RISKY_WORDS.length + customWords.length})
                  </button>
                  {Object.entries(RISKY_CATEGORIES).map(([catKey, catVal]) => (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                        selectedCategory === catKey
                          ? "bg-[#1dbf73] text-white shadow-xs"
                          : isLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-[#162135] text-slate-300 hover:text-white"
                      }`}
                    >
                      {catVal.name} ({catVal.words.length})
                    </button>
                  ))}
                  {customWords.length > 0 && (
                    <button
                      onClick={() => setSelectedCategory("custom")}
                      className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer whitespace-nowrap ${
                        selectedCategory === "custom"
                          ? "bg-[#1dbf73] text-white"
                          : isLight
                          ? "bg-slate-100 text-slate-700"
                          : "bg-[#162135] text-slate-300"
                      }`}
                    >
                      কাস্টম শব্দসমূহ ({customWords.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Words */}
            {customWords.length > 0 &&
              (selectedCategory === "all" || selectedCategory === "custom") && (
                <div
                  className={`p-5 rounded-2xl border transition-colors ${
                    isLight
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-[#191512] border-amber-500/30"
                  }`}
                >
                  <h3
                    className={`text-sm font-bold mb-2.5 flex items-center gap-2 ${
                      isLight ? "text-amber-900" : "text-amber-300"
                    }`}
                  >
                    <span>⭐ আপনার নিজস্ব যুক্ত করা নিষিদ্ধ শব্দসমূহ:</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {customWords.map((cw) => (
                      <span
                        key={cw}
                        className={`px-3 py-1 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                          isLight
                            ? "bg-white border-amber-200 text-amber-900 shadow-xs"
                            : "bg-amber-950/40 border-amber-500/30 text-amber-200"
                        }`}
                      >
                        <span>{cw}</span>
                        <button
                          onClick={() => removeCustomWord(cw)}
                          className="text-amber-600 hover:text-red-600 font-bold ml-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(RISKY_CATEGORIES)
                .filter(([catKey]) => selectedCategory === "all" || selectedCategory === catKey)
                .map(([catKey, catVal]) => {
                  const filteredWords = catVal.words.filter((w) =>
                    w.toLowerCase().includes(searchWord.toLowerCase())
                  );
                  if (searchWord && filteredWords.length === 0) return null;

                  return (
                    <div
                      key={catKey}
                      className={`rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition-colors ${
                        isLight ? "bg-white border-slate-200" : "bg-[#111827] border-[#1e2a40]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4
                            className={`font-bold text-sm ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {catVal.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isLight
                                ? "bg-slate-100 border-slate-300 text-slate-700"
                                : catVal.badgeColor
                            }`}
                          >
                            {catVal.words.length} শব্দ
                          </span>
                        </div>
                        <p
                          className={`text-xs mb-3 leading-relaxed ${
                            isLight ? "text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {catVal.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {filteredWords.map((word, wIdx) => (
                            <span
                              key={wIdx}
                              className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-medium ${
                                isLight
                                  ? "bg-slate-100 border-slate-200 text-slate-800"
                                  : "bg-[#162135] border-[#233350] text-slate-200"
                              }`}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 text-center text-xs mt-12 transition-colors ${
          isLight
            ? "bg-white border-slate-200 text-slate-600"
            : "bg-[#090d16] border-[#1b263b] text-slate-400"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-medium">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="w-5 h-5 rounded-md object-cover border border-[#1dbf73]/40"
            />
            <span className={isLight ? "text-slate-800 font-semibold" : "text-slate-200 font-semibold"}>
              Fiverr SafeGuard Pro • Designed for Freelancers
            </span>
          </div>
          <div className={`font-medium ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Made by <span className="font-bold text-[#1dbf73]">Sazzad Shuvo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
