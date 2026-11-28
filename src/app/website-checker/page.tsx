"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Globe,
  Lock,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Zap,
  X,
  History,
  Shield,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { FiveStageScanProgress } from "@/components/five-stage-scan-progress";
import { InteractiveSecurityReport } from "@/components/interactive-security-report";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import {
  EXAMPLE_URLS,
  type AnalysisReportDTO,
} from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function WebsiteCheckerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReportDTO | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle through the 5 stages while loading
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % 5);
    }, 950);
    return () => clearInterval(interval);
  }, [loading]);

  async function inspectUrl(targetUrl?: string) {
    const value = (targetUrl ?? url).trim();
    if (!value) {
      setError("Please enter a website link or domain to inspect.");
      inputRef.current?.focus();
      return;
    }
    setUrl(value);
    setError(null);
    setLoading(true);
    setReport(null);
    setStageIndex(0);

    try {
      const res = await fetch(getApiUrl("/api/analyze/url"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Website threat inspection failed.");
        setReport(null);
      } else {
        setReport(data as AnalysisReportDTO);
      }
    } catch {
      setError("Could not reach AVERON AI website security backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setUrl("");
    setReport(null);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[[var(--theme-primary)]]/25 bg-[[var(--theme-primary)]]/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
            <Radar className="h-3.5 w-3.5" />
            <span>AVERON Zero-Trust URL Defense // SSRF Protected</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#F4F7FA] sm:text-5xl">
            URL Threat & Domain Scanner
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#A0AAB8] leading-relaxed">
            Inspect suspicious links through our calibrated five-stage zero-trust pipeline:
            Submit, Extract, Investigate, Evaluate, and Protect. Evaluates
            typosquatting, brand lookalikes, Punycode homographs, IP portals,
            safe redirect chains, and reputation indicators.
          </p>
        </div>

        {/* Search Input Workspace */}
        <div className="obsidian-card p-5 sm:p-7 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[[var(--theme-primary)]]" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) inspectUrl();
                }}
                placeholder="Enter suspicious URL or domain (e.g., http://paypa1-security.xyz/login)"
                aria-label="Website URL to inspect"
                className="w-full rounded-xl border border-white/10 bg-[#080B10] py-3.5 pl-12 pr-10 font-mono text-sm text-[#F4F7FA] placeholder-[#687586] focus:border-[[var(--theme-primary)]] focus:outline-none focus:ring-1 focus:ring-[[var(--theme-primary)]]/40 transition-colors"
              />
              {url && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687586] hover:text-[#F4F7FA]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <LiquidMetalButton
              label={loading ? "Analyzing..." : "Scan URL"}
              onClick={() => inspectUrl()}
              disabled={loading}
              className="sm:w-40 shrink-0"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 p-3 text-xs text-[#FF4D5E] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick example scenarios */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-mono text-[11px] text-[#687586]">Test Targets:</span>
            {EXAMPLE_URLS.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => {
                  setUrl(ex.url);
                  inspectUrl(ex.url);
                }}
                disabled={loading}
                className="rounded-lg border border-white/5 bg-[#111923] px-2.5 py-1 text-[11px] font-mono text-[#A0AAB8] hover:text-[[var(--theme-primary)]] hover:border-[[var(--theme-primary)]]/30 transition-colors disabled:opacity-50"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live 5-Stage Scan Progress */}
        {loading && (
          <div className="animate-in fade-in duration-300">
            <FiveStageScanProgress currentStageIndex={stageIndex} />
          </div>
        )}

        {/* Detailed Interactive Security Report */}
        {report && !loading && (
          <div className="animate-in fade-in duration-300">
            <InteractiveSecurityReport
              report={report}
              onScanAnother={handleReset}
              isEmbedded={false}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
