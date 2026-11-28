"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileSearch,
  Scale,
  ShieldCheck,
  Upload,
  Lock,
  Globe,
  Radar,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    code: "01",
    name: "Submit",
    tagline: "Untrusted Input Hardening & SSRF Boundary",
    icon: Upload,
    description:
      "All user submissions—URLs, suspicious SMS/email text, or PNG/JPG/WEBP screenshots—are immediately isolated and treated strictly as untrusted input.",
    controls: [
      "Sliding-window IP rate limiting protects every analysis endpoint.",
      "Screenshots undergo MIME type, 8 MB boundary, and binary magic-byte verification.",
      "URLs are validated against unsafe schemes, localhost, and private RFC1918 IP blocks.",
    ],
  },
  {
    id: 2,
    code: "02",
    name: "Extract",
    tagline: "Structured Signal & Lexical Parsing",
    icon: FileSearch,
    description:
      "AVERON AI decomposes incoming data into actionable forensic signals: registered domain, subdomain depth, Punycode 'xn--', query parameters, and visual metadata.",
    controls: [
      "Extracts embedded links inside text messages for dual text + domain inspection.",
      "Multimodal Vision inspects visible chat text, sender headers, and spoofed prompts.",
      "Parses registered root domain, subdomain depth, and TLD without executing untrusted scripts.",
    ],
  },
  {
    id: 3,
    code: "03",
    name: "Investigate",
    tagline: "Multi-Vector Heuristics & Brand Homoglyphs",
    icon: Cpu,
    description:
      "Cross-checks extracted signals against 17 real-world scam vectors, brand typosquatting, Levenshtein distance against verified domains, and threat intelligence feeds.",
    controls: [
      "Detects OTP theft, banking impersonation, fake law enforcement pressure, and crypto fraud.",
      "Computes homoglyph de-obfuscation against major banking, enterprise, and cloud domains.",
      "Checks Google Web Risk / Safe Browsing when configured in backend environment.",
    ],
  },
  {
    id: 4,
    code: "04",
    name: "Evaluate",
    tagline: "Zero-Trust AI Delimiter Sandbox",
    icon: Scale,
    description:
      "Synthesizes lexical heuristics and zero-trust AI telemetry inside strict prompt injection delimiters, validated with rigorous Zod schema verification.",
    controls: [
      "Untrusted inputs are encapsulated inside rigid delimiter tags to defeat prompt injection.",
      "Forces structured raw JSON output adhering to Zod schema constraints.",
      "Enforces that HTTPS padlocks do not equal legitimacy.",
    ],
  },
  {
    id: 5,
    code: "05",
    name: "Protect",
    tagline: "Calibrated Risk Scoring & Playbooks",
    icon: ShieldCheck,
    description:
      "Generates an actionable 0–100 risk score, clear classification tier, plain-language summary, and immediate forensic security recommendations.",
    controls: [
      "Standardized 0–100 risk score: Low (0-29), Moderate (30-59), High (60-79), Critical (80-100).",
      "Actionable recommendations prioritized by immediacy.",
      "Exportable forensic PDF report generated in seconds.",
    ],
  },
];

export function HowItWorksContent() {
  const [activeStep, setActiveStep] = useState(1);
  const current = STEPS.find((s) => s.id === activeStep) ?? STEPS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[[var(--theme-primary)]]/25 bg-[[var(--theme-primary)]]/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
          <Radar className="h-3.5 w-3.5" />
          <span>Zero-Trust Architecture</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#F4F7FA] sm:text-5xl">
          The Five Layers of AVERON AI Defense
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-sm text-[#A0AAB8] leading-relaxed">
          How our autonomous zero-trust pipeline turns raw, untrusted links, messages, and screenshots into explainable forensic security verdicts.
        </p>
      </div>

      {/* Step Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const active = step.id === activeStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={cn(
                "flex flex-col items-start rounded-xl border p-3.5 text-left transition-all duration-200",
                active
                  ? "border-[[var(--theme-primary)]]/50 bg-[#141E29] shadow-[0_0_20px_rgba(var(--theme-primary-rgb), )]"
                  : "border-white/5 bg-[#0D1219] hover:border-white/10 hover:bg-[#111923]"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[[var(--theme-primary)]]">
                  {step.code}
                </span>
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-[[var(--theme-primary)]]" : "text-[#687586]"
                  )}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-[#F4F7FA]">{step.name}</p>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase */}
      <div className="obsidian-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[[var(--theme-primary)]]/10 border border-[[var(--theme-primary)]]/30 text-[[var(--theme-primary)]]">
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[[var(--theme-primary)]]">
                Stage {current.code}
              </span>
              <h2 className="font-heading text-xl font-bold text-[#F4F7FA]">
                {current.name} — {current.tagline}
              </h2>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A0AAB8] leading-relaxed">
          {current.description}
        </p>

        <div className="space-y-2.5 pt-2">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
            Core Technical Controls
          </h3>
          <div className="space-y-2">
            {current.controls.map((ctrl, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-[#0D1219] p-3 text-xs"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[[var(--theme-primary)]] mt-0.5" />
                <span className="text-[#F4F7FA]">{ctrl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div className="obsidian-card p-6 text-center space-y-4">
        <h3 className="font-heading text-lg font-bold text-[#F4F7FA]">
          Ready to verify suspicious targets?
        </h3>
        <p className="text-xs text-[#A0AAB8] max-w-md mx-auto">
          Test our zero-trust pipeline live with your own suspicious links or sample threat vectors.
        </p>
        <div className="flex justify-center gap-3 pt-1">
          <Link
            href="/website-checker"
            className="inline-flex items-center gap-2 rounded-xl bg-[[var(--theme-primary)]] px-5 py-2.5 text-xs font-semibold text-[#080B10] hover:bg-[[var(--theme-primary)]]/90 transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>Launch URL Scanner</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-5 py-2.5 text-xs font-semibold text-[#F4F7FA] hover:bg-[#141E29] transition-colors"
          >
            <span>Telemetry Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <PageShell>
      <HowItWorksContent />
    </PageShell>
  );
}
