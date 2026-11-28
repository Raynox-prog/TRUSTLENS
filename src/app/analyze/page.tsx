"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Eraser,
  Globe,
  Image as ImageIcon,
  Lock,
  LockOpen,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Radar,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ScanningOverlay } from "@/components/scanning-overlay";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { EXAMPLE_TEXT_MESSAGES, EXAMPLE_URLS } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

type AnalyzerMode = "text" | "image" | "url";

const MAX_CLIENT_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function AnalyzeWorkspace({
  initialModeParam,
  initialSampleParam,
}: {
  initialModeParam: string | null;
  initialSampleParam: string;
}) {
  const router = useRouter();

  const initialMode: AnalyzerMode =
    initialModeParam === "image" || initialModeParam === "url"
      ? initialModeParam
      : "text";

  const [mode, setMode] = useState<AnalyzerMode>(initialMode);

  // Text state
  const [textInput, setTextInput] = useState(
    initialMode !== "url" ? initialSampleParam : ""
  );

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [contextNote, setContextNote] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // URL state
  const [urlInput, setUrlInput] = useState(
    initialMode === "url" ? initialSampleParam : ""
  );

  // Shared execution state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // Live URL preview metadata
  const liveUrlPreview = useMemo(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return null;
    if (/^(javascript|data|file|ftp|vbscript):/i.test(trimmed)) {
      return { valid: false, error: "Unsafe protocol detected." };
    }
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      );
      return {
        valid: true,
        hostname: parsed.hostname,
        isHttps: parsed.protocol === "https:",
        protocol: parsed.protocol.replace(":", "").toUpperCase(),
      };
    } catch {
      return { valid: false, error: "Enter a complete domain (e.g. example.com)." };
    }
  }, [urlInput]);

  function handleSelectFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);

    const mimeLower = file.type.toLowerCase();
    const hasAllowedExt = /\.(png|jpe?g|webp)$/i.test(file.name);
    if (mimeLower ? !ALLOWED_IMAGE_TYPES.has(mimeLower) : !hasAllowedExt) {
      setError("Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP screenshot.");
      return;
    }
    if (file.size > MAX_CLIENT_IMAGE_BYTES) {
      setError("Image is too large. Maximum supported file size is 8 MB.");
      return;
    }

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(null);
    setImagePreviewUrl(null);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyzeText() {
    setError(null);
    if (textInput.trim().length < 5) {
      setError("Please enter at least 5 characters of suspicious text to analyze.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/analyze/text"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Text analysis failed.");
        setLoading(false);
        return;
      }
      router.push(`/results?id=${encodeURIComponent(data.id)}`);
    } catch {
      setError("Could not reach AVERON AI text analysis endpoint.");
      setLoading(false);
    }
  }

  function handleAnalyzeImage() {
    setError(null);
    if (!imageFile) {
      setError("Please upload a PNG, JPG, JPEG, or WEBP screenshot first.");
      return;
    }

    setLoading(true);
    setUploadProgress(5);

    const formData = new FormData();
    formData.append("file", imageFile);
    if (contextNote.trim()) {
      formData.append("contextNote", contextNote.trim());
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", getApiUrl("/api/analyze/image"));

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        setUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      setUploadProgress(100);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.id) {
          router.push(`/results?id=${encodeURIComponent(data.id)}`);
        } else {
          setError(data.error ?? "Screenshot analysis failed.");
          setLoading(false);
          setUploadProgress(null);
        }
      } catch {
        setError("Unexpected response from screenshot analysis server.");
        setLoading(false);
        setUploadProgress(null);
      }
    };

    xhr.onerror = () => {
      setError("Network error while uploading screenshot.");
      setLoading(false);
      setUploadProgress(null);
    };

    xhr.send(formData);
  }

  async function handleAnalyzeUrl() {
    setError(null);
    if (urlInput.trim().length < 4) {
      setError("Please enter a website URL to investigate.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/analyze/url"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Website analysis failed.");
        setLoading(false);
        return;
      }
      router.push(`/results?id=${encodeURIComponent(data.id)}`);
    } catch {
      setError("Could not reach AVERON AI website analysis endpoint.");
      setLoading(false);
    }
  }

  const tabs: Array<{
    id: AnalyzerMode;
    label: string;
    icon: typeof MessageSquareText;
    desc: string;
  }> = [
    {
      id: "text",
      label: "Text & Messages",
      icon: MessageSquareText,
      desc: "SMS, WhatsApp & Emails",
    },
    {
      id: "image",
      label: "Screenshot Vision",
      icon: ImageIcon,
      desc: "PNG, JPG, WEBP Images",
    },
    {
      id: "url",
      label: "URL & Domain",
      icon: Globe,
      desc: "Domain & Link Inspection",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[[var(--theme-primary)]]/25 bg-[[var(--theme-primary)]]/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
          <Radar className="h-3.5 w-3.5" />
          <span>AVERON Multi-Channel Threat Scanner</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#F4F7FA] sm:text-5xl">
          Multi-Modal Threat Investigation
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#A0AAB8] leading-relaxed">
          Every submission is treated strictly as untrusted input and evaluated across phishing,
          brand impersonation, malicious redirect chains, and deceptive urgency patterns.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid gap-3 sm:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setError(null);
              }}
              disabled={loading}
              className={cn(
                "flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-200",
                active
                  ? "border-[[var(--theme-primary)]]/50 bg-[#141E29] shadow-[0_0_20px_rgba(var(--theme-primary-rgb), )]"
                  : "border-white/5 bg-[#0D1219] hover:border-white/10 hover:bg-[#111923]"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  active
                    ? "bg-[[var(--theme-primary)]]/20 text-[[var(--theme-primary)]] border border-[[var(--theme-primary)]]/30"
                    : "bg-[#111923] text-[#687586]"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#F4F7FA]">{tab.label}</p>
                <p className="text-[11px] text-[#687586]">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 p-3.5 text-xs text-[#FF4D5E]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF4D5E]" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Workspace */}
      <div>
        {loading ? (
          <ScanningOverlay mode={mode} uploadProgress={uploadProgress} />
        ) : (
          <div className="obsidian-card p-6 sm:p-8">
            {/* TEXT ANALYSIS MODE */}
            {mode === "text" && (
              <div className="space-y-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-base font-bold text-[#F4F7FA]">
                      Paste Suspicious SMS, WhatsApp, or Email Text
                    </h2>
                    <p className="text-xs text-[#687586]">
                      Evaluates urgency manipulation, OTP/PIN requests, financial extortion, and lookalike links.
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[#A0AAB8]">
                    {textInput.length.toLocaleString()} / 10,000 chars
                  </span>
                </div>

                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value.slice(0, 10_000))}
                  rows={6}
                  placeholder="Paste the suspicious message content here..."
                  className="w-full rounded-xl border border-white/10 bg-[#080B10] p-4 text-xs font-mono text-[#F4F7FA] placeholder-[#687586] focus:border-[[var(--theme-primary)]] focus:outline-none focus:ring-1 focus:ring-[[var(--theme-primary)]]/40 transition-colors"
                />

                {/* Example Messages */}
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#687586]">
                    Sample Threat Scenarios
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_TEXT_MESSAGES.map((example) => (
                      <button
                        key={example.label}
                        type="button"
                        onClick={() => {
                          setTextInput(example.text);
                          setError(null);
                        }}
                        className="rounded-lg border border-white/5 bg-[#0D1219] px-3 py-1.5 text-xs font-mono text-[#A0AAB8] hover:border-[[var(--theme-primary)]]/40 hover:text-[[var(--theme-primary)]] transition-colors"
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setTextInput("");
                      setError(null);
                    }}
                    disabled={!textInput}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-4 py-2 text-xs text-[#A0AAB8] hover:text-[#F4F7FA] disabled:opacity-40"
                  >
                    <Eraser className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>

                  <LiquidMetalButton
                    label="Analyze Message"
                    onClick={handleAnalyzeText}
                    disabled={textInput.trim().length < 5}
                  />
                </div>
              </div>
            )}

            {/* SCREENSHOT ANALYSIS MODE */}
            {mode === "image" && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#F4F7FA]">
                    Upload Suspicious Screenshot
                  </h2>
                  <p className="text-xs text-[#687586]">
                    Supports PNG, JPG, JPEG, and WEBP up to 8 MB. Images are magic-byte verified,
                    analyzed in memory, and never stored permanently.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleSelectFile(e.target.files?.[0])}
                />

                {!imageFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleSelectFile(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all",
                      dragActive
                        ? "border-[[var(--theme-primary)]] bg-[[var(--theme-primary)]]/10"
                        : "border-white/10 bg-[#080B10] hover:border-[[var(--theme-primary)]]/40 hover:bg-[#111923]"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#141E29] border border-white/10 text-[[var(--theme-primary)]]">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#F4F7FA]">
                      Drag & drop your screenshot here
                    </p>
                    <p className="mt-1 text-xs text-[#687586]">
                      or click to browse files · PNG, JPG, WEBP · Max 8 MB
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/5 bg-[#080B10] p-4 space-y-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {imagePreviewUrl && (
                        <div className="relative h-36 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#111923]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreviewUrl}
                            alt="Uploaded screenshot preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="truncate text-xs font-bold font-mono text-[#F4F7FA]">
                          {imageFile.name}
                        </p>
                        <p className="font-mono text-[11px] text-[#687586]">
                          {imageFile.type} · {formatBytes(imageFile.size)}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111923] px-3 py-1 text-xs text-[#A0AAB8] hover:text-[#F4F7FA]"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            onClick={removeImage}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 px-3 py-1 text-xs text-[#FF4D5E] hover:bg-[#FF4D5E]/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Optional context note */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="screenshot-context"
                    className="font-mono text-[11px] uppercase tracking-wider text-[#687586]"
                  >
                    Optional Context or Sender Information
                  </label>
                  <textarea
                    id="screenshot-context"
                    value={contextNote}
                    onChange={(e) => setContextNote(e.target.value.slice(0, 2000))}
                    rows={2}
                    placeholder="Describe who sent this message or visible details..."
                    className="w-full rounded-xl border border-white/10 bg-[#080B10] px-3.5 py-2.5 text-xs text-[#F4F7FA] placeholder-[#687586] focus:border-[[var(--theme-primary)]] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-white/5">
                  <LiquidMetalButton
                    label="Analyze Screenshot"
                    onClick={handleAnalyzeImage}
                    disabled={!imageFile}
                  />
                </div>
              </div>
            )}

            {/* WEBSITE ANALYSIS MODE */}
            {mode === "url" && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading text-base font-bold text-[#F4F7FA]">
                    Inspect Suspicious Website URL
                  </h2>
                  <p className="text-xs text-[#687586]">
                    Checks typosquatting, Punycode, raw IP targets, redirect chains, and threat indicators.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAnalyzeUrl();
                    }}
                    placeholder="https://example-verify-login.xyz/signin"
                    aria-label="Website URL input"
                    className="flex-1 rounded-xl border border-white/10 bg-[#080B10] px-4 py-3 font-mono text-xs text-[#F4F7FA] placeholder-[#687586] focus:border-[[var(--theme-primary)]] focus:outline-none"
                  />
                  <LiquidMetalButton
                    label="Analyze URL"
                    onClick={handleAnalyzeUrl}
                    disabled={urlInput.trim().length < 4}
                  />
                </div>

                {liveUrlPreview && (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-[#080B10] p-3 text-xs">
                    {liveUrlPreview.valid ? (
                      <>
                        <span className="font-mono text-[#F4F7FA]">
                          Domain: <strong>{liveUrlPreview.hostname}</strong>
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]",
                            liveUrlPreview.isHttps
                              ? "bg-[#28D99A]/10 text-[#28D99A] border border-[#28D99A]/20"
                              : "bg-[#FF4D5E]/10 text-[#FF4D5E] border border-[#FF4D5E]/20"
                          )}
                        >
                          {liveUrlPreview.isHttps ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                          {liveUrlPreview.protocol}
                        </span>
                      </>
                    ) : (
                      <span className="text-[#FF4D5E]">{liveUrlPreview.error}</span>
                    )}
                  </div>
                )}

                {/* Sample Suspicious URLs */}
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#687586]">
                    Sample Targets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_URLS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setUrlInput(item.url);
                          setError(null);
                        }}
                        className="rounded-lg border border-white/5 bg-[#0D1219] px-3 py-1.5 text-xs font-mono text-[#A0AAB8] hover:border-[[var(--theme-primary)]]/40 hover:text-[[var(--theme-primary)]] transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-6 py-20 text-center text-xs text-[#687586]">
            Loading AVERON Multi-Modal Scanner...
          </div>
        }
      >
        <AnalyzeWorkspace initialModeParam={null} initialSampleParam="" />
      </Suspense>
    </PageShell>
  );
}
