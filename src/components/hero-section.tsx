"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Globe,
  KeyRound,
  Link2,
  Shield,
  ShieldAlert,
  UserX,
  Radar,
  Cpu,
} from "lucide-react";
import { LiquidGlassNavbar } from "./ui/liquid-glass-navbar";
import { RiskGauge } from "./risk-gauge";
import { HeroUrlScanner } from "./hero-url-scanner";
import { useTheme } from "@/components/theme/theme-context";

const THREAT_BARS = [
  {
    label: "Phishing Links",
    pct: 94,
    color: "bg-[#FF4D5E]",
    icon: ShieldAlert,
  },
  {
    label: "Brand Impersonation",
    pct: 82,
    color: "bg-[#FF8A4C]",
    icon: UserX,
  },
  {
    label: "Punycode Homographs",
    pct: 71,
    color: "bg-[#F4BD50]",
    icon: Link2,
  },
  {
    label: "Insecure Protocol / IP Direct",
    pct: 58,
    color: "bg-[#63A9FF]",
    icon: KeyRound,
  },
];

export function HeroSection() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageIndex, setScanStageIndex] = useState(0);
  const { theme } = useTheme();

  return (
    <section className="relative min-h-screen overflow-hidden obsidian-grid-bg text-[#F4F7FA]" style={{ backgroundColor: "transparent" }}>
      {/* ── Particle canvas injected here previously — now handled globally by layout.tsx ── */}

      {/* Integrated Liquid Glass Navigation Bar */}
      <div className="relative z-30">
        <LiquidGlassNavbar />
      </div>

      {/* Hero Central Stage */}
      <div className="relative z-20 mx-auto flex max-w-7xl flex-col items-center px-4 pt-6 pb-16 sm:px-6 md:pt-10 lg:px-8 lg:pb-20">
        {/* Brand Tag Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300"
          style={{
            borderColor: `${theme.primary}40`,
            backgroundColor: `${theme.primary}18`,
            color: theme.primary,
            boxShadow: `0 0 20px rgba(${theme.primaryRgb}, 0.15)`,
          }}
        >
          <Radar className="h-3.5 w-3.5" />
          <span>Obsidian Grid 2.0 // Zero-Trust Cyber Intelligence</span>
        </motion.div>

        {/* Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-6 text-center font-heading font-extrabold tracking-tight text-[#F4F7FA] leading-[1.05] text-[36px] sm:text-[56px] md:text-[68px] lg:text-[78px]"
        >
          <span className="block">One Click. Five Layers.</span>
          <span
            className="block text-transparent bg-clip-text transition-all duration-300"
            style={{
              backgroundImage: `linear-gradient(to right, #F4F7FA, ${theme.primary}, ${theme.secondary})`,
            }}
          >
            Total Protection.
          </span>
        </motion.h1>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-4 max-w-2xl text-center font-sans text-xs sm:text-sm lg:text-base text-[#A0AAB8] leading-relaxed"
        >
          Commercial-grade AI cyber defense against deceptive URLs, phishing portals, brand impersonation, and zero-day threat vectors. Instant SSRF-guarded evaluation.
        </motion.p>

        {/* Prominent URL Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mt-8 w-full"
        >
          <HeroUrlScanner
            onScanStateChange={(scanning, stage) => {
              setIsScanning(scanning);
              setScanStageIndex(stage);
            }}
          />
        </motion.div>

        {/* Secondary Action CTA Pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-5 py-2.5 text-xs font-semibold text-[#F4F7FA] hover:bg-[#141E29] hover:border-white/20 transition-all shadow-sm"
          >
            <Shield className="h-4 w-4" style={{ color: theme.primary }} />
            <span>Open Security Dashboard</span>
          </Link>

          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-white/5 bg-[#0D1219] px-5 py-2.5 text-xs font-semibold text-[#A0AAB8] hover:text-[#F4F7FA] hover:bg-white/5 transition-all"
          >
            <Cpu className="h-4 w-4" style={{ color: theme.secondary }} />
            <span>Explore 5-Stage Architecture</span>
          </Link>
        </motion.div>

        {/* Three Structured Dashboard Cards (Obsidian Grid Design) */}
        <div className="mt-14 w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Left Card: Threat Signals */}
            <div className="obsidian-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF4D5E]/10 border border-[#FF4D5E]/20 text-[#FF4D5E]">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <h3 className="font-heading text-xs font-bold text-[#F4F7FA]">
                    Threat Signatures
                  </h3>
                </div>
                <span className="font-mono text-[10px]" style={{ color: theme.primary }}>
                  Real-Time
                </span>
              </div>

              <div className="space-y-3">
                {THREAT_BARS.map((bar) => {
                  const BarIcon = bar.icon;
                  return (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#A0AAB8] flex items-center gap-1.5">
                          <BarIcon className="h-3 w-3 text-[#687586]" />
                          <span>{bar.label}</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#F4F7FA]">
                          {bar.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#080B10] overflow-hidden">
                        <div
                          style={{ width: `${bar.pct}%` }}
                          className={`h-full rounded-full ${bar.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Middle Card: Calibrated Gauge */}
            <div
              className="obsidian-card p-5 flex flex-col items-center justify-between space-y-4 shadow-lg transition-all"
              style={{
                borderColor: `${theme.primary}40`,
                boxShadow: `0 12px 32px rgba(${theme.primaryRgb}, 0.12)`,
              }}
            >
              <div className="flex w-full items-center justify-between border-b border-white/5 pb-3">
                <span className="font-heading text-xs font-bold text-[#F4F7FA]">
                  AVERON AI Core
                </span>
                <span className="font-mono text-[10px]" style={{ color: theme.primary }}>
                  Calibrated
                </span>
              </div>

              <div className="py-1">
                <RiskGauge score={84} size={135} strokeWidth={9} />
              </div>

              <div className="text-center space-y-1 w-full">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF8A4C]/10 border border-[#FF8A4C]/25 px-2.5 py-0.5 font-mono text-[10px] text-[#FF8A4C]">
                  <AlertTriangle className="h-3 w-3" />
                  HIGH RISK DETECTED
                </span>
                <p className="text-[11px] text-[#A0AAB8]">
                  Suspicious homograph and unverified certificate
                </p>
              </div>
            </div>

            {/* 3. Right Card: Domain Defense */}
            <div className="obsidian-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: `${theme.primary}18`,
                      borderColor: `${theme.primary}40`,
                      color: theme.primary,
                    }}
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                  <h3 className="font-heading text-xs font-bold text-[#F4F7FA]">
                    Domain Integrity
                  </h3>
                </div>
                <span className="font-mono text-[10px]" style={{ color: theme.secondary }}>
                  Protected
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D1219] border border-white/5">
                  <span className="text-[#A0AAB8]">SSRF Enforcement</span>
                  <span className="font-mono text-[11px]" style={{ color: theme.primary }}>rfc1918 Blocked</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D1219] border border-white/5">
                  <span className="text-[#A0AAB8]">Redirect Chain Audit</span>
                  <span className="font-mono text-[11px]" style={{ color: theme.primary }}>Max 3 Hops Safe</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D1219] border border-white/5">
                  <span className="text-[#A0AAB8]">Punycode Validation</span>
                  <span className="font-mono text-[11px]" style={{ color: theme.secondary }}>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
