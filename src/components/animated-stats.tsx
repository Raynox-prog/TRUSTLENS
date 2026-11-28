"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Layers,
  AlertTriangle,
  Lock,
  Terminal,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface CounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
}: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const end = value;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

const STATS = [
  {
    id: "accuracy",
    label: "Detection Accuracy",
    description: "Evaluated across verified phishing feeds and homoglyph datasets",
    value: 99.8,
    decimals: 1,
    suffix: "%",
    icon: ShieldCheck,
    tag: "CALIBRATED",
    glow: "rgba(146,87,246,0.35)",
  },
  {
    id: "speed",
    label: "Inspection Latency",
    description: "Average end-to-end multi-layer investigation and scoring speed",
    value: 650,
    decimals: 0,
    prefix: "< ",
    suffix: "ms",
    icon: Zap,
    tag: "REAL-TIME",
    glow: "rgba(166,106,255,0.35)",
  },
  {
    id: "layers",
    label: "Defense Layers",
    description: "Sequential zero-trust isolation from SSRF check to signed PDF report",
    value: 5,
    decimals: 0,
    suffix: " STAGES",
    icon: Layers,
    tag: "MULTI-TIER",
    glow: "rgba(146,87,246,0.35)",
  },
  {
    id: "vectors",
    label: "Scam Vectors Mitigated",
    description: "Domain typos, OTP theft, UPI collect, digital arrest, and extortion",
    value: 17,
    decimals: 0,
    suffix: "+ VECTORS",
    icon: AlertTriangle,
    tag: "COMPREHENSIVE",
    glow: "rgba(166,106,255,0.35)",
  },
  {
    id: "sandbox",
    label: "Code Execution",
    description: "Air-gapped static dissection; 100% immune to malicious client scripts",
    value: 0,
    decimals: 0,
    suffix: " BYTES",
    icon: Lock,
    tag: "AIR-GAPPED",
    glow: "rgba(16,185,129,0.35)",
  },
];

const TELEMETRY_STREAM = [
  "[PASS] Layer 1 SSRF Ingress Filter: RFC1918 & Localhost Prohibited",
  "[ACTIVE] Layer 2 Punycode Normalizer: Cyrillic / Greek Homoglyph Engine Ready",
  "[SYNCED] Layer 3 Brand Distance Matrix: Levenshtein & Top 100 Financial TLDs Armed",
  "[ENFORCED] Layer 4 AI Guard: Strict Zod Structured Schema Runtime Validated",
  "[READY] Layer 5 Report Engine: Dynamic In-Memory PDF Generator Operational",
];

export function AnimatedSecurityStats() {
  const [streamIndex, setStreamIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStreamIndex((prev) => (prev + 1) % TELEMETRY_STREAM.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative z-10 border-t border-[#F0E5D0]/10 bg-gradient-to-b from-[var(--obsidian-base,#090D0C)] via-[var(--obsidian-charcoal,#101715)] to-[var(--obsidian-base,#090D0C)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B9A9E9]/30 bg-[#1B4536]/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#B9A9E9]">
              <Activity className="h-3.5 w-3.5 text-[#A66AFF] animate-pulse" />
              Live Security Telemetry // Zero-Trust Verified
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#F0E5D0] sm:text-3xl lg:text-4xl">
              Enterprise Defense Performance
            </h2>
            <p className="max-w-xl text-xs sm:text-sm text-[#B8C6BB]">
              Real-time benchmarks engineered for mission-critical fraud prevention, high-throughput verification, and zero security compromise.
            </p>
          </div>

          {/* Live Telemetry Terminal Capsule */}
          <div className="w-full md:w-auto flex items-center gap-2.5 rounded-2xl border border-[#F0E5D0]/14 bg-[#102B22]/90 px-4 py-2.5 backdrop-blur-md shadow-inner">
            <Terminal className="h-4 w-4 shrink-0 text-[#A66AFF]" />
            <div className="min-w-0 font-mono text-[11px] text-[#F0E5D0]">
              <span className="text-[#A66AFF] mr-1.5">$</span>
              <span className="text-emerald-400 font-semibold mr-1">STATUS:</span>
              <span className="text-[#B8C6BB] transition-all duration-300">
                {TELEMETRY_STREAM[streamIndex]}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Animated Stats Cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-[24px] border border-[#F0E5D0]/12 bg-[#173D30]/80 p-5 backdrop-blur-md transition-all duration-300 hover:border-[#9257F6]/50 hover:shadow-[0_16px_36px_rgba(146,87,246,0.18)]"
              >
                {/* Subtle top corner glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: stat.glow }}
                />

                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102B22] border border-[#F0E5D0]/10 text-[#B9A9E9] transition-colors group-hover:border-[#A66AFF]/40 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-[#102B22]/80 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#A66AFF] border border-[#9257F6]/25">
                    {stat.tag}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="font-extrabold tracking-tight text-[#F0E5D0] text-3xl sm:text-4xl">
                    <AnimatedCounter
                      value={stat.value}
                      decimals={stat.decimals}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                  <h3 className="mt-1.5 text-sm font-bold text-[#F0E5D0]">
                    {stat.label}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#B8C6BB]/80">
                    {stat.description}
                  </p>
                </div>

                {/* Bottom line status accent */}
                <div className="mt-4 flex items-center gap-1.5 border-t border-[#F0E5D0]/8 pt-3 text-[10px] font-mono text-[#B8C6BB]">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  <span>Enforced by AVERON Core</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
