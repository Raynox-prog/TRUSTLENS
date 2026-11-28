"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  MessageSquareWarning,
  ScanSearch,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  EXAMPLE_TEXT_MESSAGES,
  SUPPORTED_SCAM_CATEGORIES,
  riskLevelLabel,
  type AnalysisReportDTO,
} from "@/lib/types";
import { RiskGauge } from "./risk-gauge";
import { getApiUrl } from "@/lib/api-config";

const FEATURES = [
  {
    icon: MessageSquareWarning,
    title: "Message & Social Engineering Analysis",
    description:
      "Paste suspicious SMS, WhatsApp chats, or emails. AVERON isolates urgency traps, OTP theft, UPI collect scams, and impersonation cues with exact evidence quotes.",
    href: "/analyze?mode=text",
  },
  {
    icon: ImageIcon,
    title: "Multimodal Screenshot Inspection",
    description:
      "Upload PNG, JPG, or WEBP chat screenshots. Strict magic-byte validation and multimodal vision analyze visible text, sender details, and visual deception cues.",
    href: "/analyze?mode=image",
  },
  {
    icon: Globe,
    title: "Deep URL & Typosquatting Checker",
    description:
      "Dissects domains, Punycode homographs, brand typosquatting, shortened links, IP-based portals, safe redirect hops, and optional Google Safe Browsing checks.",
    href: "/website-checker",
  },
  {
    icon: FileText,
    title: "Verifiable Reports & PDF Export",
    description:
      "Every investigation generates a calibrated 0–100 risk breakdown, practical recommendations, limitations transparency, and a downloadable PDF report.",
    href: "/dashboard",
  },
];

const WORKFLOW_STEPS = [
  { num: "01", title: "Submit", desc: "Paste text, upload a screenshot, or submit a suspicious URL." },
  { num: "02", title: "Extract", desc: "Sanitize untrusted input, parse URLs, and inspect media safely." },
  { num: "03", title: "Investigate", desc: "Detect phishing patterns, lookalike domains, and social engineering." },
  { num: "04", title: "Evaluate", desc: "Validate structured risk scoring and confidence calibration." },
  { num: "05", title: "Protect", desc: "Review clear evidence, safety actions, and export PDF reports." },
];

export function HomepageSections() {
  const [demoText, setDemoText] = useState(EXAMPLE_TEXT_MESSAGES[0].text);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoResult, setDemoResult] = useState<AnalysisReportDTO | null>(null);

  async function runLiveDemo() {
    if (!demoText.trim()) return;
    setDemoLoading(true);
    setDemoError(null);
    try {
      const res = await fetch(getApiUrl("/api/analyze/text"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: demoText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDemoError(data.error ?? "Unable to analyze message.");
      } else {
        setDemoResult(data as AnalysisReportDTO);
      }
    } catch {
      setDemoError("Network error while contacting AVERON analysis API.");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="relative bg-[#102B22]">
      {/* Subtle continuing dot texture across homepage body */}
      <div
        aria-hidden="true"
        className="shieldly-dots-primary pointer-events-none absolute inset-0 opacity-45"
      />

      {/* 1. PROBLEM STATEMENT */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.65 }}
              className="lg:col-span-6 space-y-5"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#1B4536]/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
                <AlertOctagon className="h-3.5 w-3.5 text-[#A66AFF]" />
                The Modern Deception Problem
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl lg:text-5xl leading-[1.08]">
                Scams no longer look broken. They look urgent, official, and personal.
              </h2>
              <p className="text-base leading-relaxed text-[#B8C6BB]">
                Attackers exploit high-pressure psychology—fake bank KYC cutoffs,
                UPI refund collect requests, police arrest threats, and lookalike
                HTTPS domains—so targets click before they have ten seconds to
                think.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="lg:col-span-6 grid gap-4 sm:grid-cols-2"
            >
              {[
                {
                  title: "Manufactured Panic",
                  text: "10-minute account blocks and fake legal warrants push victims to bypass rational checks.",
                },
                {
                  title: "HTTPS ≠ Legitimate",
                  text: "Phishing domains routinely use free SSL padlocks alongside subtle one-letter brand typos.",
                },
                {
                  title: "Visual Impersonation",
                  text: "Spoofed logos, chat profiles, and QR payment prompts deceive users inside screenshots.",
                },
                {
                  title: "Irreversible Rails",
                  text: "OTPs, UPI PIN approvals, gift cards, and crypto transfers leave little room for recovery.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="shieldly-glass-soft rounded-3xl p-5 transition-colors hover:border-[#9257F6]/40"
                >
                  <h3 className="text-base font-bold text-[#F0E5D0]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#B8C6BB]">
                    {card.text}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 bg-[#173D30]/55 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#102B22]/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
              <Sparkles className="h-3.5 w-3.5 text-[#A66AFF]" />
              Platform Capabilities
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl lg:text-5xl">
              Three investigation channels. One verifiable verdict.
            </h2>
            <p className="text-base text-[#B8C6BB]">
              Every mode combines strict input security, transparent threat
              evidence, and practical protective guidance.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: "some" }}
                  transition={{ duration: 0.55, delay: idx * 0.08 }}
                  className="group shieldly-glass rounded-[28px] p-7 transition-all duration-300 hover:border-[#9257F6]/50 hover:shadow-[0_20px_50px_rgba(146,87,246,0.16)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9257F6]/20 border border-[#A66AFF]/35 text-[#B9A9E9] transition-colors group-hover:bg-[#9257F6] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[#F0E5D0]">
                    {feat.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#B8C6BB]">
                    {feat.description}
                  </p>
                  <Link
                    href={feat.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#B9A9E9] transition-colors hover:text-[#F0E5D0]"
                  >
                    <span>Open Tool</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS — 5-STEP OVERVIEW */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#1B4536]/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
                <ScanSearch className="h-3.5 w-3.5 text-[#A66AFF]" />
                Investigation Pipeline
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl">
                Submit → Extract → Investigate → Evaluate → Protect
              </h2>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#B9A9E9]/40 bg-[#1B4536]/60 px-5 py-2.5 text-sm font-semibold text-[#F0E5D0] transition-colors hover:border-[#A66AFF]"
            >
              <span>Full Pipeline Walkthrough</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WORKFLOW_STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
                className="relative rounded-3xl border border-[#F0E5D0]/12 bg-[#173D30]/65 p-5"
              >
                <span className="font-mono text-xs font-bold text-[#A66AFF]">
                  STEP {step.num}
                </span>
                <h3 className="mt-2 text-lg font-extrabold text-[#F0E5D0]">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#B8C6BB]">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SUPPORTED SCAM CATEGORIES (ALL 17) */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 bg-[#173D30]/50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#102B22]/75 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
              17 Threat Categories Covered
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl">
              Built to recognize real-world fraud patterns
            </h2>
            <p className="text-sm sm:text-base text-[#B8C6BB]">
              Click any category to test a realistic example inside the AVERON
              Analyzer.
            </p>
          </div>

          <div className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORTED_SCAM_CATEGORIES.map((cat) => {
              const targetHref =
                cat.mode === "url" && cat.exampleUrl
                  ? `/analyze?mode=url&sample=${encodeURIComponent(cat.exampleUrl)}`
                  : `/analyze?mode=text&sample=${encodeURIComponent(cat.exampleText ?? "")}`;
              return (
                <Link
                  key={cat.id}
                  href={targetHref}
                  className="group flex flex-col justify-between rounded-2xl border border-[#F0E5D0]/12 bg-[#102B22]/70 p-4 transition-all duration-200 hover:border-[#9257F6]/60 hover:bg-[#1B4536]/75"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#F0E5D0] group-hover:text-white">
                        {cat.name}
                      </h3>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#B9A9E9] opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#B8C6BB]">
                      {cat.shortDesc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE DEMONSTRATION */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#1B4536]/75 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
              Live Interactive Demonstration
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-4xl">
              Run a real backend investigation right here
            </h2>
            <p className="text-sm sm:text-base text-[#B8C6BB]">
              Select a suspicious message below or edit the text, then run a real
              request to <code className="font-mono text-[#B9A9E9]">POST /api/analyze/text</code>.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            {/* Input Column */}
            <div className="lg:col-span-7 shieldly-glass rounded-[28px] p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_TEXT_MESSAGES.slice(0, 4).map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => {
                      setDemoText(ex.text);
                      setDemoError(null);
                    }}
                    className="rounded-full border border-[#F0E5D0]/15 bg-[#1B4536]/70 px-3 py-1.5 text-xs font-semibold text-[#F0E5D0]/90 transition-colors hover:border-[#A66AFF] hover:bg-[#234B3B]"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={5}
                aria-label="Suspicious message demo input"
                className="w-full rounded-2xl border border-[#F0E5D0]/16 bg-[#102B22]/90 p-4 text-sm text-[#F0E5D0] placeholder-[#B8C6BB]/50 focus:border-[#9257F6] focus:outline-none focus:ring-2 focus:ring-[#9257F6]/30"
                placeholder="Paste any suspicious SMS, WhatsApp message, or email..."
              />

              {demoError && (
                <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-200">
                  {demoError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-[#B8C6BB]">
                  {demoText.length} / 10,000 chars
                </span>
                <button
                  type="button"
                  onClick={runLiveDemo}
                  disabled={demoLoading || demoText.trim().length < 5}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9257F6] to-[#A66AFF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(146,87,246,0.45)] transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  <span>{demoLoading ? "Analyzing..." : "Run Live Check"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Output Column */}
            <div className="lg:col-span-5 shieldly-glass rounded-[28px] p-6 flex flex-col justify-between">
              {demoResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <RiskGauge
                      score={demoResult.riskScore}
                      size={104}
                      strokeWidth={9}
                      variant="dark"
                    />
                    <div className="min-w-0">
                      <span className="inline-block rounded-full bg-[#9257F6]/25 border border-[#A66AFF]/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#F0E5D0]">
                        {riskLevelLabel(demoResult.riskLevel)}
                      </span>
                      <h3 className="mt-1.5 text-sm font-bold text-[#F0E5D0]">
                        {demoResult.verdict}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#B8C6BB]">
                        {demoResult.metadata.engineLabel}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[#B8C6BB]">
                    {demoResult.summary}
                  </p>

                  {demoResult.detectedThreats.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#B9A9E9]">
                        Top Detected Indicators ({demoResult.detectedThreats.length})
                      </p>
                      {demoResult.detectedThreats.slice(0, 2).map((t, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-[#F0E5D0]/10 bg-[#173D30]/70 px-3 py-2 text-xs"
                        >
                          <p className="font-bold text-[#F0E5D0]">{t.type}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-[#B9A9E9]">
                            &ldquo;{t.evidence}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/results?id=${demoResult.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#B9A9E9]/45 bg-[#1B4536]/80 px-4 py-2.5 text-xs font-bold text-[#F0E5D0] transition-colors hover:border-[#A66AFF] hover:bg-[#234B3B]"
                  >
                    <span>Open Full Report & PDF Export</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9257F6]/20 border border-[#A66AFF]/30 text-[#B9A9E9]">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#F0E5D0]">
                    Real-Time Verdict Preview
                  </h3>
                  <p className="max-w-xs text-xs leading-relaxed text-[#B8C6BB]">
                    Click &ldquo;Run Live Check&rdquo; to trigger a real backend
                    investigation, persist the report to PostgreSQL, and inspect
                    extracted threat evidence.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRIVACY & SECURITY ARCHITECTURE */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 bg-[#173D30]/55 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="shieldly-cream-card rounded-[32px] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#173D30]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[#173D30]">
                  <Lock className="h-3.5 w-3.5 text-[#9257F6]" />
                  Privacy & Honest Security
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#102B22] sm:text-4xl">
                  Built on transparency, never security theater.
                </h2>
                <p className="text-sm leading-relaxed text-[#173D30]/85">
                  We document exactly how your text, screenshots, and URLs are
                  processed—with no exaggerated certifications or unverified claims.
                </p>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 rounded-full bg-[#102B22] px-5 py-2.5 text-sm font-semibold text-[#F0E5D0] transition-colors hover:bg-[#173D30]"
                >
                  <span>Read Full Privacy Policy</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="lg:col-span-7 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Eye,
                    title: "Ephemeral Screenshot Processing",
                    desc: "Uploaded images are validated and inspected in memory, then discarded immediately—never saved to disk or database.",
                  },
                  {
                    icon: Server,
                    title: "Server-Side Keys & SSRF Guards",
                    desc: "All API keys remain strictly server-side. URL checks block private IPs, localhost, and unsafe protocols without executing site scripts.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Honest Engine Attribution",
                    desc: "Every report states whether Gemini/OpenAI or deterministic rules ran, and never claims Safe Browsing checked a URL unless it actually did.",
                  },
                  {
                    icon: Trash2,
                    title: "Full Report Deletion Control",
                    desc: "Only structured report summaries are stored for your Dashboard, and you can delete individual or all reports anytime.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl bg-white/55 border border-[#102B22]/10 p-5"
                    >
                      <Icon className="h-5 w-5 text-[#9257F6]" />
                      <h3 className="mt-3 text-sm font-extrabold text-[#102B22]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#173D30]/80">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="relative z-10 border-t border-[#F0E5D0]/10 py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#B9A9E9]">
            Think Before You Click.
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-5xl lg:text-6xl leading-[1.04]">
            Got a message or link that feels slightly off?
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#B8C6BB]">
            Verify suspicious texts, screenshots, and websites in seconds before
            entering an OTP, approving a payment, or clicking a link.
          </p>
          <div className="flex flex-col items-center justify-center gap-3.5 pt-2 sm:flex-row">
            <Link
              href="/analyze"
              className="group inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9257F6] to-[#A66AFF] px-8 py-3 text-sm font-bold text-white shadow-[0_0_32px_rgba(146,87,246,0.5)] transition-all hover:scale-[1.02]"
            >
              <span>Start Free Analysis</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/website-checker"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#B9A9E9]/45 bg-[#1B4536]/60 px-8 py-3 text-sm font-bold text-[#F0E5D0] transition-colors hover:border-[#A66AFF] hover:bg-[#234B3B]"
            >
              Inspect a Website URL
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
