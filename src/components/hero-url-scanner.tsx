"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  ArrowRight,
  Lock,
  X,
  AlertTriangle,
} from "lucide-react";
import { EXAMPLE_URLS, type AnalysisReportDTO } from "@/lib/types";
import { FiveStageScanProgress } from "@/components/five-stage-scan-progress";
import { InteractiveSecurityReport } from "@/components/interactive-security-report";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";
import { useTheme } from "@/components/theme/theme-context";

interface HeroUrlScannerProps {
  onScanStateChange?: (scanning: boolean, stage: number) => void;
}

export function HeroUrlScanner({ onScanStateChange }: HeroUrlScannerProps = {}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisReportDTO | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    onScanStateChange?.(loading, stageIndex);
  }, [loading, stageIndex, onScanStateChange]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % 5);
    }, 950);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleScan(targetUrl?: string) {
    const raw = (targetUrl ?? url).trim();
    if (!raw) {
      setError("Please enter a website link or domain to scan.");
      inputRef.current?.focus();
      return;
    }

    setUrl(raw);
    setError(null);
    setLoading(true);
    setResult(null);
    setStageIndex(0);

    try {
      const res = await fetch(getApiUrl("/api/analyze/url"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: raw }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Threat scan could not be completed.");
      } else {
        setResult(data as AnalysisReportDTO);
      }
    } catch {
      setError("Unable to connect to the AVERON threat detection backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectExample(exampleUrl: string) {
    setUrl(exampleUrl);
    setError(null);
    handleScan(exampleUrl);
  }

  function handleReset() {
    setUrl("");
    setResult(null);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl space-y-6">
      {/* Outer ambient glow adapted to active theme */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-1 rounded-[28px] blur-xl opacity-60 transition-opacity"
        style={{
          background: `linear-gradient(to right, rgba(${theme.primaryRgb}, 0.22), rgba(${theme.secondaryRgb}, 0.12), rgba(${theme.primaryRgb}, 0.08))`,
        }}
      />

      {/* Main Container Card */}
      <div className="relative rounded-2xl border border-white/10 bg-[#0D1219]/90 p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl space-y-5">
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: theme.primary }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: theme.primary }}
              />
            </span>
            <span
              className="font-mono text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: theme.primary }}
            >
              Zero-Trust URL Defense Scanner
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#A0AAB8]">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-[#111923] px-2.5 py-0.5 font-mono text-[10px] border border-white/5"
              style={{ color: theme.primary }}
            >
              <Lock className="h-3 w-3" />
              <span>SSRF Protected</span>
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors"
              style={{ color: theme.primary }}
            />
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleScan();
              }}
              placeholder="Enter suspicious URL or domain (e.g., https://paypa1-security.xyz/login)"
              aria-label="Target URL to inspect"
              className="w-full rounded-xl border border-white/10 bg-[#080B10] py-3.5 pl-12 pr-10 font-mono text-sm text-[#F4F7FA] placeholder-[#687586] focus:outline-none focus:ring-1 transition-colors"
              style={{ ["--tw-ring-color" as any]: theme.primary }}
            />
            {url && (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Clear target input"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687586] hover:text-[#F4F7FA] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Primary CTA using LiquidMetalButton */}
          <LiquidMetalButton
            label={loading ? "Analyzing..." : "Scan URL"}
            onClick={() => handleScan()}
            disabled={loading}
            className="sm:w-40 shrink-0"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 px-4 py-2.5 text-xs text-[#FF4D5E] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sample Targets */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="font-mono text-[11px] text-[#687586]">Test Scenarios:</span>
          {EXAMPLE_URLS.slice(0, 3).map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => handleSelectExample(ex.url)}
              disabled={loading}
              className="rounded-lg border border-white/5 bg-[#111923] px-2.5 py-1 text-[11px] font-mono text-[#A0AAB8] transition-colors disabled:opacity-50 hover:text-[#F4F7FA]"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* 5-Stage Live Scan Progress */}
        {loading && (
          <div className="pt-2">
            <FiveStageScanProgress currentStageIndex={stageIndex} />
          </div>
        )}

        {/* Scan Result */}
        {result && !loading && (
          <div className="pt-2">
            <InteractiveSecurityReport
              report={result}
              onScanAnother={handleReset}
              isEmbedded={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
