"use client";

import { motion } from "framer-motion";
import { Shield, Activity, Lock, Radar, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhantomCoreHudProps {
  isScanning?: boolean;
  className?: string;
}

export function PhantomCoreHud({ isScanning = false, className }: PhantomCoreHudProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-hidden",
        className
      )}
    >
      {/* 1. TOP LEFT: ZERO-TRUST ENGINE */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, -6, 0],
        }}
        style={{ willChange: "transform" }}
        transition={{
          opacity: { duration: 0.9, delay: 0.6 },
          x: { duration: 0.9, delay: 0.6 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden xl:flex absolute left-8 top-[14%] items-center gap-2 rounded-full border border-emerald-500/25 bg-[#071C18]/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md shadow-[0_0_20px_rgba(33,201,151,0.18)]"
      >
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        <Lock className="h-3 w-3 text-emerald-400" />
        <span>ZERO-TRUST ENGINE</span>
        <span className="text-emerald-400/50">•</span>
        <span className="text-[#B8C6BB]/80">ARMED</span>
      </motion.div>

      {/* 2. TOP RIGHT: THREAT INTELLIGENCE */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, 8, 0],
        }}
        style={{ willChange: "transform" }}
        transition={{
          opacity: { duration: 0.9, delay: 0.75 },
          x: { duration: 0.9, delay: 0.75 },
          y: { duration: 6.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        }}
        className="hidden xl:flex absolute right-8 top-[15%] items-center gap-2 rounded-full border border-[#A855F7]/30 bg-[#071C18]/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#C4A5FF] backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]"
      >
        <Radar className="h-3 w-3 text-[#A855F7]" />
        <span>THREAT INTELLIGENCE</span>
        <span className="text-[#A855F7]/50">•</span>
        <span className="text-[#B8C6BB]/80">SYNCED</span>
      </motion.div>

      {/* 3. MID LEFT: DIGITAL DEFENSE */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: 1,
          y: [0, 6, 0],
        }}
        style={{ willChange: "transform" }}
        transition={{
          opacity: { duration: 0.8, delay: 0.9 },
          y: { duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 1.0 },
        }}
        className="hidden lg:flex absolute left-6 top-[34%] xl:left-12 items-center gap-2 rounded-full border border-emerald-500/20 bg-[#102B24]/75 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#21C997] backdrop-blur-md"
      >
        <Shield className="h-2.5 w-2.5 text-[#21C997]" />
        <span>DIGITAL DEFENSE</span>
        <span className="text-[#B8C6BB]/60">[AIR-GAP]</span>
      </motion.div>

      {/* 4. MID RIGHT: SECURITY ANALYSIS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: 1,
          y: [0, -7, 0],
        }}
        style={{ willChange: "transform" }}
        transition={{
          opacity: { duration: 0.8, delay: 1.0 },
          y: { duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
        }}
        className="hidden lg:flex absolute right-6 top-[36%] xl:right-12 items-center gap-2 rounded-full border border-[#A855F7]/25 bg-[#102B24]/75 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#C4A5FF] backdrop-blur-md"
      >
        <Terminal className="h-2.5 w-2.5 text-[#A855F7]" />
        <span>SECURITY ANALYSIS</span>
        <span className="text-[#B8C6BB]/60">[ACTIVE]</span>
      </motion.div>

      {/* 5. LOWER CORNER / ACCENT: LIVE MONITORING */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="hidden md:flex absolute right-10 bottom-[14%] items-center gap-2 rounded-full border border-emerald-500/25 bg-[#071C18]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300 backdrop-blur-md"
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
        <span className="text-[#B8C6BB]/80">{isScanning ? "INVESTIGATING" : "STANDBY"}</span>
      </motion.div>
    </div>
  );
}
