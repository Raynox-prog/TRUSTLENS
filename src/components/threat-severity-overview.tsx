"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  ExternalLink,
  Shield,
  FileWarning,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_LEVELS = [
  {
    id: "critical",
    level: "CRITICAL",
    scoreRange: "80 – 100",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.12)",
    borderColor: "rgba(244, 63, 94, 0.4)",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    icon: Flame,
    title: "Immediate Compromise Threat",
    description:
      "Active high-probability fraud designed to exfiltrate credentials, drain bank balances, or install hostile payloads within minutes.",
    examples: [
      {
        vector: "Fake Banking & Login Clones",
        cue: "Pixel-perfect spoof of banking/payment portals capturing passwords & 2FA tokens.",
      },
      {
        vector: "Digital Arrest & Extortion",
        cue: "Coercive fake police warrants demanding immediate confidential wire transfers.",
      },
      {
        vector: "Live OTP & Card Exfiltration",
        cue: "Urgent KYC cutoff warnings soliciting one-time verification passwords.",
      },
    ],
    playbook: [
      "Sever session immediately; do not enter PINs or passwords.",
      "Call bank emergency hotline & freeze associated accounts/cards.",
      "File rapid complaint on national cyber fraud portal (e.g. 1930 / cybercrime.gov).",
    ],
    sampleTarget: "/analyze?mode=text&sample=URGENT%20ALERT%3A%20Dear%20Customer%2C%20your%20bank%20account%20KYC%20has%20expired%20and%20will%20be%20blocked%20in%2010%20minutes.",
  },
  {
    id: "high",
    level: "HIGH",
    scoreRange: "60 – 79",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: AlertOctagon,
    title: "Deceptive Impersonation & Typosquatting",
    description:
      "Subtle lookalike infrastructure and engineered urgency designed to mislead targets into authorizing unauthorized transactions.",
    examples: [
      {
        vector: "Typosquatted & Homoglyph Domains",
        cue: "Subtle character substitutions (e.g. 'paypa1.xyz', Cyrillic 'a') mimicking known brands.",
      },
      {
        vector: "UPI Collect Request Fraud",
        cue: "Deceptive collect requests masquerading as 'refund approvals' requiring PIN entry.",
      },
      {
        vector: "Executive Impersonation",
        cue: "Forged corporate executive requests demanding urgent gift card or vendor wire payments.",
      },
    ],
    playbook: [
      "Inspect full registered domain string; never rely solely on green SSL padlocks.",
      "Reject incoming payment collect requests; remember receiving funds NEVER needs a PIN.",
      "Verify request via verified out-of-band communication channel.",
    ],
    sampleTarget: "/analyze?mode=url&sample=http%3A%2F%2Fpaypa1-security-center.verify-login.xyz",
  },
  {
    id: "moderate",
    level: "MODERATE",
    scoreRange: "30 – 59",
    color: "#EAB308",
    bgColor: "rgba(234, 179, 8, 0.12)",
    borderColor: "rgba(234, 179, 8, 0.4)",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    icon: AlertTriangle,
    title: "Suspicious & Obfuscated Indicators",
    description:
      "Links or communications exhibiting anomaly markers such as shortened redirects, newly minted TLDs, or unverified sender domains.",
    examples: [
      {
        vector: "Shortened URL Redirection",
        cue: "Bitly or TinyURL links concealing unverified final landing destinations.",
      },
      {
        vector: "Unsolicited Job / Investment Offers",
        cue: "High-yield daily returns promised for simple product review tasks via Telegram.",
      },
      {
        vector: "Missing Sender Cryptography",
        cue: "Emails failing SPF, DKIM, or DMARC alignment originating from public mailboxes.",
      },
    ],
    playbook: [
      "Unwrap shortened redirects using AVERON Website Checker before visiting.",
      "Never pay upfront security deposits for freelance employment or task commissions.",
      "Treat unverified SMS shortcodes with caution.",
    ],
    sampleTarget: "/analyze?mode=url&sample=https%3A%2F%2Fbit.ly%2Furgent-kyc-verify-now",
  },
  {
    id: "low",
    level: "LOW",
    scoreRange: "0 – 29",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: ShieldCheck,
    title: "Authenticated & Baseline Safe",
    description:
      "Verified standard communications matching official domain registries, non-coercive phrasing, and standard security postures.",
    examples: [
      {
        vector: "Official Domain Registration",
        cue: "Validated multi-year WHOIS registration aligned with primary brand entity.",
      },
      {
        vector: "Zero Urgency Traps",
        cue: "Informational notice without countdown clocks, OTP requests, or payment demands.",
      },
      {
        vector: "Cryptographic Certificate Alignment",
        cue: "Valid EV/OV SSL certificate matching designated corporate registrar.",
      },
    ],
    playbook: [
      "Standard safe browsing hygiene applies.",
      "Remember that HTTPS encrypts connection transit; always verify destination integrity.",
      "Archive verifiable audit report in your AVERON dashboard.",
    ],
    sampleTarget: "/website-checker",
  },
];

export function ThreatSeverityOverview() {
  const [selectedId, setSelectedId] = useState("critical");
  const current = SEVERITY_LEVELS.find((l) => l.id === selectedId) ?? SEVERITY_LEVELS[0];
  const CurrentIcon = current.icon;

  return (
    <section className="relative z-10 border-t border-[#F0E5D0]/10 bg-[var(--obsidian-base,#090D0C)] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#102B22]/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
            <ShieldAlert className="h-3.5 w-3.5 text-[#A66AFF]" />
            Threat Severity Overview & Playbooks
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl lg:text-5xl">
            Calibrated Risk Classification Matrix
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#B8C6BB]">
            AVERON never issues vague binary judgments. Every threat is scored from 0 to 100 and mapped to clear mitigation playbooks so you know exactly what action to take.
          </p>
        </div>

        {/* Severity Level Selector Pills */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SEVERITY_LEVELS.map((tier) => {
            const isSelected = tier.id === selectedId;
            const Icon = tier.icon;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedId(tier.id)}
                className={cn(
                  "group relative flex flex-col items-start rounded-2xl border p-4 sm:p-5 text-left transition-all duration-300 focus:outline-none",
                  isSelected
                    ? "border-[#A66AFF] bg-[#102B22] shadow-[0_0_26px_rgba(146,87,246,0.28)] scale-[1.02]"
                    : "border-[#F0E5D0]/12 bg-[#102B22]/60 hover:border-[#F0E5D0]/25 hover:bg-[#102B22]/80"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={cn(
                      "font-mono text-xs font-extrabold px-2 py-0.5 rounded-full border",
                      tier.badgeColor
                    )}
                  >
                    {tier.level}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#F0E5D0]/80">
                    SCORE {tier.scoreRange}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Icon
                    className="h-4 w-4"
                    style={{ color: tier.color }}
                  />
                  <h4 className="text-sm font-extrabold text-[#F0E5D0]">
                    {tier.level === "CRITICAL"
                      ? "Critical Risk"
                      : tier.level === "HIGH"
                      ? "High Risk"
                      : tier.level === "MODERATE"
                      ? "Moderate Risk"
                      : "Low Risk"}
                  </h4>
                </div>

                <div className="mt-2 text-[11px] text-[#B8C6BB] line-clamp-1">
                  {tier.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Severity Detailed Breakdown */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="mt-8 rounded-[30px] border border-[#F0E5D0]/16 bg-[#102B22]/90 p-6 sm:p-8 lg:p-10 shadow-[0_24px_64px_rgba(6,20,15,0.7)] backdrop-blur-xl"
          >
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: Severity Profile & Score */}
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border text-white shadow-lg"
                    style={{
                      background: current.color,
                      borderColor: current.borderColor,
                    }}
                  >
                    <CurrentIcon className="h-6 w-6" />
                  </span>
                  <div>
                    <span
                      className={cn(
                        "font-mono text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        current.badgeColor
                      )}
                    >
                      Score Range {current.scoreRange} / 100
                    </span>
                    <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-[#F0E5D0]">
                      {current.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm sm:text-base leading-relaxed text-[#B8C6BB]">
                  {current.description}
                </p>

                {/* Real Incident Vector Examples */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#B9A9E9]">
                    Primary Attack Vectors
                  </h4>
                  <div className="space-y-2">
                    {current.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#F0E5D0]/10 bg-[#173D30]/60 p-3"
                      >
                        <p className="text-xs font-extrabold text-[#F0E5D0]">
                          {ex.vector}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#B8C6BB] leading-snug">
                          {ex.cue}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test in Analyzer CTA */}
                <div className="pt-2">
                  <Link
                    href={current.sampleTarget}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9257F6] to-[#A66AFF] px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_20px_rgba(146,87,246,0.45)] hover:scale-[1.02] transition-transform"
                  >
                    <span>Test {current.level} Severity Sample</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Automated Mitigation Playbook */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0E5D0]/10">
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#B9A9E9] flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#A66AFF]" />
                    Emergency Action Playbook for Targets
                  </h4>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                    Automated Guidance
                  </span>
                </div>

                <div className="space-y-3">
                  {current.playbook.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-[#F0E5D0]/10 bg-[#173D30]/75 p-4 transition-all hover:border-[#A66AFF]/40"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9257F6]/20 font-mono text-xs font-bold text-[#A66AFF] border border-[#9257F6]/40">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-[#F0E5D0] leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Transparent Limitation Guarantee Note */}
                <div className="rounded-2xl border border-[#F0E5D0]/10 bg-[#102B22]/80 p-4 text-xs text-[#B8C6BB] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#F0E5D0]">
                    <Lock className="h-3.5 w-3.5 text-[#A66AFF]" />
                    <span>Deterministic Calibration Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    AVERON scores never round up without verified technical evidence quotes. All reports disclose provider model versions, reachability statuses, and explicit analytical limitations for complete legal & forensic transparency.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
