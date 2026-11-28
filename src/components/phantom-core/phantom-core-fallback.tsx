"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Radar, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhantomCoreFallbackProps {
  className?: string;
  isScanning?: boolean;
}

export function PhantomCoreFallback({ className, isScanning = false }: PhantomCoreFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {/* Concentrated radial gradient backdrop (Zero raster blur filter) */}
      <div
        className="absolute h-[520px] w-[520px] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.38) 0%, rgba(33,201,151,0.2) 40%, rgba(23,61,48,0.06) 60%, transparent 75%)",
        }}
      />

      {/* Outer Rotating CSS Orbital Ring 1 */}
      <motion.div
        animate={{ rotate: 360 }}
        style={{ willChange: "transform" }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
        className="absolute h-[420px] w-[420px] rounded-full border border-[#21C997]/25 border-dashed"
      />

      {/* Middle Rotating CSS Orbital Ring 2 (Tilted) */}
      <motion.div
        animate={{ rotate: -360 }}
        style={{ willChange: "transform", transform: "rotateX(60deg) rotateY(20deg)" }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute h-[340px] w-[340px] rounded-full border border-[#A855F7]/35 border-t-transparent border-b-transparent"
      />

      {/* Inner Rotating CSS Orbital Ring 3 */}
      <motion.div
        animate={{ rotate: 360 }}
        style={{ willChange: "transform", transform: "rotateX(-50deg) rotateY(-30deg)" }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute h-[260px] w-[260px] rounded-full border border-[#C4A5FF]/30"
      />

      {/* Central Holographic Shield Emblem */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          scale: isScanning ? [1, 1.05, 1] : 1,
        }}
        style={{ willChange: "transform" }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 1.2, repeat: Infinity },
        }}
        className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-[#123B30]/80 via-[#102B24]/90 to-[#071C18]/95 p-6 border border-[#21C997]/40 shadow-[0_0_50px_rgba(33,201,151,0.35)] backdrop-blur-xl"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#A855F7]/20 via-transparent to-[#21C997]/20" />
        <Shield className="h-16 w-16 text-[#F2E9D8] drop-shadow-[0_0_24px_rgba(168,85,247,0.7)]" />
      </motion.div>

      {/* Floating Holographic Panel 1: Threat Intelligence (Upper Left) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="hidden xl:flex absolute left-8 top-[20%] w-64 flex-col rounded-2xl border border-[#21C997]/30 bg-[#071C18]/85 p-4 shadow-[0_0_30px_rgba(33,201,151,0.18)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#21C997]">
          <span>INTELLIGENCE ENGINE</span>
          <Radar className="h-3.5 w-3.5 text-[#21C997]" />
        </div>
        <h4 className="mt-2 text-sm font-extrabold text-[#F2E9D8]">
          THREAT INTELLIGENCE
        </h4>
        <p className="mt-1 text-[11px] text-[#A8B8AE]">
          Real-time threat intelligence monitoring
        </p>
      </motion.div>

      {/* Floating Holographic Panel 2: URL Analysis (Upper Right) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="hidden xl:flex absolute right-8 top-[22%] w-64 flex-col rounded-2xl border border-[#A855F7]/30 bg-[#071C18]/85 p-4 shadow-[0_0_30px_rgba(168,85,247,0.2)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#A855F7]">
          <span>URL INSPECTION</span>
          <Globe className="h-3.5 w-3.5 text-[#A855F7]" />
        </div>
        <h4 className="mt-2 text-sm font-extrabold text-[#F2E9D8]">
          URL ANALYSIS
        </h4>
        <p className="mt-1 text-[11px] text-[#A8B8AE]">
          Deep URL and domain security inspection
        </p>
      </motion.div>

      {/* Floating Holographic Panel 3: Zero-Trust Protection (Lower Right) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden xl:flex absolute right-12 bottom-[16%] w-64 flex-col rounded-2xl border border-[#F2E9D8]/20 bg-[#071C18]/85 p-4 shadow-[0_0_24px_rgba(242,233,216,0.12)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#21C997]">
          <span>ZERO-TRUST ARCHITECTURE</span>
          <Lock className="h-3.5 w-3.5 text-[#21C997]" />
        </div>
        <h4 className="mt-2 text-sm font-extrabold text-[#F2E9D8]">
          ZERO-TRUST PROTECTION
        </h4>
        <p className="mt-1 text-[11px] text-[#A8B8AE]">
          Verify every connection. Trust nothing.
        </p>
      </motion.div>
    </div>
  );
}
