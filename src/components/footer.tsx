"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AveronLogo } from "./ui/liquid-glass-navbar";
import { getApiUrl } from "@/lib/api-config";
import { useTheme } from "@/components/theme/theme-context";

interface StatusPayload {
  capabilities?: {
    activeAiProvider: "gemini" | "openai" | "heuristic-only";
    activeAiModel: string | null;
    safeBrowsingConfigured: boolean;
  };
}

export function Footer() {
  const [status, setStatus] = useState<StatusPayload["capabilities"] | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let active = true;
    fetch(getApiUrl("/api/status"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StatusPayload | null) => {
        if (active && data?.capabilities) {
          setStatus(data.capabilities);
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="relative z-20 border-t border-white/5 bg-[#080B10]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5 space-y-3">
            <AveronLogo />
            <p
              className="text-xs font-mono tracking-wider uppercase transition-colors"
              style={{ color: theme.primary }}
            >
              AI-Powered Cybersecurity & Threat Intelligence
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-[#A0AAB8]">
              Continuous zero-trust domain evaluation, phishing detection, malware defense, and real-time cybersecurity telemetry.
            </p>

            {status && (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/5 bg-[#111923] px-3 py-1 text-xs text-[#A0AAB8]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      status.activeAiProvider !== "heuristic-only"
                        ? theme.primary
                        : "#63A9FF",
                    boxShadow:
                      status.activeAiProvider !== "heuristic-only"
                        ? `0 0 8px ${theme.primary}`
                        : "none",
                  }}
                />
                <span className="font-mono text-[11px]">
                  {status.activeAiProvider === "gemini"
                    ? `Live AI: Gemini (${status.activeAiModel})`
                    : status.activeAiProvider === "openai"
                      ? `Live AI: OpenAI (${status.activeAiModel})`
                      : "Zero-Trust Deterministic Rules Active"}
                </span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#687586]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#A0AAB8]">
              <li>
                <Link href="/dashboard" className="hover:text-[var(--theme-primary)] transition-colors">
                  Security Overview
                </Link>
              </li>
              <li>
                <Link href="/website-checker" className="hover:text-[var(--theme-primary)] transition-colors">
                  URL Scanner
                </Link>
              </li>
              <li>
                <Link href="/analyze" className="hover:text-[var(--theme-primary)] transition-colors">
                  Multi-Modal Scan
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-[var(--theme-primary)] transition-colors">
                  Scan History
                </Link>
              </li>
              <li>
                <Link href="/intelligence" className="hover:text-[var(--theme-primary)] transition-colors">
                  Threat Intelligence
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#687586]">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs text-[#A0AAB8]">
              <li>
                <Link href="/how-it-works" className="hover:text-[var(--theme-primary)] transition-colors">
                  5-Stage Zero-Trust
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--theme-primary)] transition-colors">
                  Data Privacy & SSRF
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--theme-primary)] transition-colors">
                  Security Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#687586]">
              System Status
            </h4>
            <div className="rounded-xl border border-white/5 bg-[#0D1219] p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#A0AAB8]">API Gateway</span>
                <span className="font-mono text-[11px]" style={{ color: theme.primary }}>Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0AAB8]">Heuristics Core</span>
                <span className="font-mono text-[11px]" style={{ color: theme.primary }}>Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A0AAB8]">Threat DB</span>
                <span className="font-mono text-[11px]" style={{ color: theme.primary }}>Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#687586]">
          <p>© {new Date().getFullYear()} AVERON AI. Commercial Threat Intelligence & Defense.</p>
          <p className="font-mono text-[11px]">Active Theme: <span style={{ color: theme.primary }} className="font-semibold">{theme.name}</span></p>
        </div>
      </div>
    </footer>
  );
}
