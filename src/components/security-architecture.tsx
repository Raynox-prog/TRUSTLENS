"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSearch,
  Cpu,
  Scale,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Terminal,
  ChevronRight,
  ShieldAlert,
  Database,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ARCHITECTURE_STAGES = [
  {
    step: "01",
    name: "Ingress Isolation & SSRF Guard",
    shortName: "Ingress Guard",
    tagline: "Untrusted Input Hardening & Sandbox Enforcement",
    icon: Upload,
    color: "#9257F6",
    summary:
      "All submissions—whether raw URLs, SMS strings, or multi-megabyte screenshots—are isolated behind an air-gapped security boundary before any engine processing occurs.",
    controls: [
      {
        title: "Private IP & SSRF Blocking",
        detail: "Strict verification rejects loopback (127.0.0.1), RFC1918 subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), and link-local cloud metadata endpoints.",
      },
      {
        title: "Magic-Byte Binary Inspection",
        detail: "Screenshots undergo strict PNG (89 50 4E 47), JPEG (FF D8 FF), and WEBP magic signature inspection to block polyglot malware payloads.",
      },
      {
        title: "Sliding-Window IP Rate Limiter",
        detail: "Per-client sliding-window quota prevention guards backend endpoints against automated scraping and brute-force flooding.",
      },
    ],
    technicalOutput: "Sanitized untrusted stream + validated MIME headers",
    badge: "AIR-GAPPED INGRESS",
  },
  {
    step: "02",
    name: "Artifact Extraction & De-obfuscation",
    shortName: "De-obfuscation",
    tagline: "Homoglyph Normalization & DOM-Free Parsing",
    icon: FileSearch,
    color: "#A66AFF",
    summary:
      "Deconstructs adversarial obfuscation techniques without ever executing client-side scripts, neutralizing zero-day browser exploits.",
    controls: [
      {
        title: "Punycode & Cyrillic Homoglyphs",
        detail: "Translates Punycode 'xn--' labels and de-obfuscates lookalike characters (e.g., Cyrillic 'а', Greek 'ο', Latin 'a') into unified ASCII representations.",
      },
      {
        title: "Safe Redirect Chain Probing",
        detail: "Follows HTTP 301/302 shortener hops with strict hop limits and SSRF checks at every hop, exposing hidden target destinations.",
      },
      {
        title: "Multimodal Vision Extraction",
        detail: "Extracts visible chat sender headers, UPI handles, and payment QR cues directly from screenshots while stripping metadata.",
      },
    ],
    technicalOutput: "Normalized domain tokens + de-obfuscated visual telemetry",
    badge: "ZERO SCRIPT EXECUTION",
  },
  {
    step: "03",
    name: "Heuristic & Typosquatting Matrix",
    shortName: "Heuristic Engine",
    tagline: "Deterministic Multi-Vector Fraud Recognition",
    icon: Cpu,
    color: "#9257F6",
    summary:
      "Cross-examines extracted signals against 17 real-world scam vector taxonomies, brand dictionary lookups, and algorithmic edit distances.",
    controls: [
      {
        title: "Levenshtein Brand Distance",
        detail: "Computes character insertion/deletion distance against protected banking, courier, and tech infrastructure brand dictionaries.",
      },
      {
        title: "17-Vector Scam Taxonomy",
        detail: "Evaluates patterns for OTP theft, UPI collect traps, fake police warrants, KYC cutoff intimidation, and crypto investment fraud.",
      },
      {
        title: "Structural URL Anomalies",
        detail: "Flags '@' user-info credential masking, IP-in-hostname access, raw non-standard ports, and deceptive TLD suffixes.",
      },
    ],
    technicalOutput: "Deterministic rule flags + Brand squatting proximity score",
    badge: "17 VECTORS ARMED",
  },
  {
    step: "04",
    name: "AI Reasoning & Risk Calibration",
    shortName: "AI Calibration",
    tagline: "Structured Zod Schema & Prompt-Injection Isolation",
    icon: Scale,
    color: "#A66AFF",
    summary:
      "A dual-tier LLM intelligence engine operates within hardened untrusted delimiters, outputting runtime-validated JSON reports with calibrated 0–100 scores.",
    controls: [
      {
        title: "Hardened Prompt Enclosure",
        detail: "Wraps all user content in defensive delimiter boundaries, rendering prompt injection or instruction override attacks harmless.",
      },
      {
        title: "Strict Zod Schema Enforcement",
        detail: "Guarantees mathematically typed output: riskLevel (low/moderate/high/critical), riskScore (0–100), explicit evidence quotes, and limitations.",
      },
      {
        title: "Dual Provider Failover",
        detail: "Seamless automatic routing between Gemini 2.5 Flash and OpenAI ensures high availability, with heuristic fallback if external APIs are unreachable.",
      },
    ],
    technicalOutput: "Validated structured AIOutput DTO + confidence rating",
    badge: "SOC2 COMPLIANT REASONING",
  },
  {
    step: "05",
    name: "Verifiable Verdict & Mitigation Delivery",
    shortName: "Verdict & Audit",
    tagline: "Signed PDF Incident Reports & Actionable Playbooks",
    icon: ShieldCheck,
    color: "#10B981",
    summary:
      "Transforms raw technical findings into executive safety verdicts, tactical defense steps for targets, and downloadable auditable forensic PDFs.",
    controls: [
      {
        title: "Exact Quoted Threat Evidence",
        detail: "Pinpoints exact malicious phrases, fake sender headers, or deceptive domains so analysts can verify findings instantly.",
      },
      {
        title: "Step-by-Step Action Playbooks",
        detail: "Delivers tailored emergency mitigation steps (e.g. freeze UPI VPA, report to 1930 cyber hotline, revoke browser sessions).",
      },
      {
        title: "In-Memory PDF Generation",
        detail: "Generates multi-page formatted forensic incident reports via pdf-lib, stored securely with zero raw binary retention on disk.",
      },
    ],
    technicalOutput: "Auditable incident report + downloadable forensic PDF",
    badge: "VERIFIED FORENSIC EXPORT",
  },
];

export function SecurityArchitectureVisualizer() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = ARCHITECTURE_STAGES[activeStage];
  const StageIcon = stage.icon;

  return (
    <section className="relative z-10 border-t border-[#F0E5D0]/10 bg-[var(--obsidian-charcoal,#101715)] py-20 lg:py-28">
      {/* Background radial highlight (Smooth CSS radial falloff, zero blur rasterization) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(146,87,246,0.25) 0%, rgba(23,61,48,0.15) 45%, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#1B4536]/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
            <Layers className="h-3.5 w-3.5 text-[#A66AFF]" />
            Five-Stage Zero-Trust Architecture
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl lg:text-5xl">
            How AVERON AI Neutralizes Modern Threats
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#B8C6BB]">
            Click any layer in the active pipeline below to inspect the forensic controls, sanitization algorithms, and cryptographic verifications executing at each stage.
          </p>
        </div>

        {/* Visual Pipeline Flow Bus (Desktop & Mobile) */}
        <div className="mt-14">
          {/* Pipeline Connecting Bus */}
          <div className="relative mb-6 hidden lg:block">
            <div className="absolute left-[8%] right-[8%] top-1/2 h-1 -translate-y-1/2 bg-[#1B4536]" />
            <motion.div
              className="absolute left-[8%] top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-[#9257F6] via-[#A66AFF] to-emerald-400"
              animate={{
                width: `${(activeStage / (ARCHITECTURE_STAGES.length - 1)) * 84}%`,
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>

          {/* Stage Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ARCHITECTURE_STAGES.map((item, idx) => {
              const Icon = item.icon;
              const isActive = idx === activeStage;
              const isPast = idx < activeStage;

              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={cn(
                    "group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-300 focus:outline-none",
                    isActive
                      ? "border-[#A66AFF] bg-[#173D30] shadow-[0_0_30px_rgba(146,87,246,0.32)] scale-[1.02]"
                      : isPast
                      ? "border-[#B9A9E9]/30 bg-[#102B22]/90 hover:border-[#F0E5D0]/30"
                      : "border-[#F0E5D0]/12 bg-[#102B22]/70 hover:border-[#F0E5D0]/25"
                  )}
                >
                  {/* Top status & step badge */}
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        isActive ? "text-[#A66AFF]" : "text-[#B8C6BB]"
                      )}
                    >
                      LAYER {item.step}
                    </span>
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#9257F6] to-[#A66AFF] text-white shadow-[0_0_12px_rgba(146,87,246,0.5)]"
                          : "bg-[#1B4536]/80 text-[#B8C6BB]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Title */}
                  <h4
                    className={cn(
                      "mt-3 text-xs sm:text-sm font-extrabold leading-snug transition-colors",
                      isActive ? "text-[#F0E5D0]" : "text-[#F0E5D0]/80 group-hover:text-[#F0E5D0]"
                    )}
                  >
                    {item.shortName}
                  </h4>

                  {/* Micro indicator */}
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#B8C6BB]/75">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isActive
                          ? "bg-[#A66AFF] animate-ping"
                          : isPast
                          ? "bg-emerald-400"
                          : "bg-[#B8C6BB]/40"
                      )}
                    />
                    <span>{isActive ? "ACTIVE STAGE" : isPast ? "VERIFIED" : "ARMED"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Layer Technical Deep-Dive Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-[30px] border border-[#F0E5D0]/16 bg-[#173D30]/85 p-6 sm:p-8 lg:p-10 shadow-[0_24px_64px_rgba(6,20,15,0.6)] backdrop-blur-xl"
          >
            <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left Column: Stage Overview & Specifications */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9257F6] to-[#A66AFF] text-white shadow-[0_0_24px_rgba(146,87,246,0.6)]">
                    <StageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#A66AFF] tracking-wider uppercase">
                      Layer {stage.step} of 05 // Specification
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#F0E5D0]">
                      {stage.name}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-[#B8C6BB]">
                  {stage.summary}
                </p>

                {/* Technical Output Capsule */}
                <div className="rounded-2xl border border-[#F0E5D0]/12 bg-[#102B22]/80 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#B8C6BB]">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-[#A66AFF]" />
                      OUTPUT PIPELINE SCHEMA
                    </span>
                    <span className="rounded bg-[#1B4536] px-1.5 py-0.5 text-[10px] text-emerald-400 font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#F0E5D0] font-semibold">
                    {stage.technicalOutput}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/how-it-works"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1B4536] border border-[#B9A9E9]/40 px-5 py-2.5 text-xs font-bold text-[#F0E5D0] hover:bg-[#234B3B] hover:border-[#A66AFF] transition-all"
                  >
                    <span>Inspect Complete Pipeline Code</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <span className="font-mono text-[11px] text-[#B8C6BB]/75 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    Zero Data Retention
                  </span>
                </div>
              </div>

              {/* Right Column: Exact Enterprise Controls */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0E5D0]/10">
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#B9A9E9]">
                    Forensic Security Controls Enforced
                  </h4>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                    3 of 3 Active
                  </span>
                </div>

                <div className="space-y-3">
                  {stage.controls.map((ctrl, i) => (
                    <div
                      key={i}
                      className="group rounded-2xl border border-[#F0E5D0]/10 bg-[#102B22]/70 p-4 transition-all hover:border-[#A66AFF]/40 hover:bg-[#102B22]/90"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="space-y-1">
                          <h5 className="text-sm font-extrabold text-[#F0E5D0]">
                            {ctrl.title}
                          </h5>
                          <p className="text-xs leading-relaxed text-[#B8C6BB]">
                            {ctrl.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
