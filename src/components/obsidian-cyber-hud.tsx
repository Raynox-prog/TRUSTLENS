"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Activity,
  Lock,
  Radar,
  Terminal,
  Globe,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ObsidianCyberHudProps {
  isScanning?: boolean;
  className?: string;
}

export function ObsidianCyberHud({
  isScanning = false,
  className,
}: ObsidianCyberHudProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-hidden z-10",
        className
      )}
    >
      {/* =========================================================================
          1. ZERO-TRUST STATUS INDICATOR CAPSULES
          ========================================================================= */}

      {/* TOP LEFT: ZERO-TRUST ENGINE */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="hidden xl:flex absolute left-8 top-[14%] items-center gap-2 rounded-full border border-emerald-500/25 bg-[#090D0C]/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        <Lock className="h-3 w-3 text-emerald-400" />
        <span>ZERO-TRUST ENGINE</span>
        <span className="text-emerald-400/50">•</span>
        <span className="text-[#B8C6BB]/80">ARMED</span>
      </motion.div>

      {/* TOP RIGHT: THREAT INTELLIGENCE */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="hidden xl:flex absolute right-8 top-[15%] items-center gap-2 rounded-full border border-[#A855F7]/30 bg-[#090D0C]/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C4A5FF] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <Radar className="h-3 w-3 text-[#A855F7]" />
        <span>THREAT INTELLIGENCE</span>
        <span className="text-[#A855F7]/50">•</span>
        <span className="text-[#B8C6BB]/80">SYNCED</span>
      </motion.div>

      {/* MID LEFT: DIGITAL DEFENSE */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="hidden lg:flex absolute left-6 top-[34%] xl:left-10 items-center gap-2 rounded-full border border-emerald-500/20 bg-[#101715]/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#21C997] backdrop-blur-md"
      >
        <Shield className="h-2.5 w-2.5 text-[#21C997]" />
        <span>DIGITAL DEFENSE</span>
        <span className="text-[#B8C6BB]/60">[AIR-GAP]</span>
      </motion.div>

      {/* MID RIGHT: SECURITY ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="hidden lg:flex absolute right-6 top-[36%] xl:right-10 items-center gap-2 rounded-full border border-[#A855F7]/25 bg-[#101715]/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#C4A5FF] backdrop-blur-md"
      >
        <Terminal className="h-2.5 w-2.5 text-[#A855F7]" />
        <span>SECURITY ANALYSIS</span>
        <span className="text-[#B8C6BB]/60">[ACTIVE]</span>
      </motion.div>

      {/* LOWER CORNER: LIVE MONITORING */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="hidden md:flex absolute right-10 bottom-[10%] items-center gap-2 rounded-full border border-emerald-500/25 bg-[#090D0C]/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isScanning ? "bg-[#A855F7] animate-ping" : "bg-[#21C997]"
          )}
        />
        <Activity className="h-3 w-3 text-emerald-400" />
        <span>LIVE MONITORING</span>
        <span className="text-emerald-400/50">•</span>
        <span className="text-[#B8C6BB]/80">
          {isScanning ? "INVESTIGATING" : "STANDBY"}
        </span>
      </motion.div>

      {/* =========================================================================
          2. THREE FLOATING INTELLIGENCE PANELS (PRESERVED AS PURE CSS MATTE CARDS)
          ========================================================================= */}

      {/* PANEL 1: THREAT INTELLIGENCE (Upper Left Flank) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.45 }}
        className="pointer-events-auto hidden 2xl:flex absolute left-8 top-[24%] w-64 flex-col rounded-2xl border border-emerald-500/20 bg-[#090D0C]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-[#101715]/90"
      >
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400">
          <span className="tracking-wider">01. THREAT INTEL</span>
          <Radar className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <h3 className="mt-2 text-sm font-extrabold font-heading text-[#F0E5D0]">
          THREAT INTELLIGENCE
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[#B8C6BB]/80">
          Real-time heuristics & zero-trust anomaly matrix.
        </p>
        <Link
          href="/analyze"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          <span>INSPECT MODULE</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>

      {/* PANEL 2: URL ANALYSIS (Upper Right Flank) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="pointer-events-auto hidden 2xl:flex absolute right-8 top-[24%] w-64 flex-col rounded-2xl border border-[#A855F7]/25 bg-[#090D0C]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-300 hover:border-[#A855F7]/55 hover:bg-[#101715]/90"
      >
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#C4A5FF]">
          <span className="tracking-wider">02. URL ANALYSIS</span>
          <Globe className="h-3.5 w-3.5 text-[#A855F7]" />
        </div>
        <h3 className="mt-2 text-sm font-extrabold font-heading text-[#F0E5D0]">
          URL ANALYSIS
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[#B8C6BB]/80">
          Deep SSRF air-gap isolation & typosquatting detection.
        </p>
        <Link
          href="/website-checker"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#C4A5FF] transition-colors hover:text-[#E8D9BE]"
        >
          <span>OPEN CHECKER</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>

      {/* PANEL 3: ZERO-TRUST PROTECTION (Lower Left / Mid Flank) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.65 }}
        className="pointer-events-auto hidden 2xl:flex absolute left-8 bottom-[18%] w-64 flex-col rounded-2xl border border-[#F0E5D0]/16 bg-[#090D0C]/85 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-md transition-all duration-300 hover:border-[#F0E5D0]/35 hover:bg-[#101715]/90"
      >
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#F0E5D0]">
          <span className="tracking-wider">03. ARCHITECTURE</span>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <h3 className="mt-2 text-sm font-extrabold font-heading text-[#F0E5D0]">
          ZERO-TRUST DEFENSE
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[#B8C6BB]/80">
          Verify every connection. 5 hardened defense layers.
        </p>
        <Link
          href="/how-it-works"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          <span>VIEW 5 LAYERS</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>
    </div>
  );
}
