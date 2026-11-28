"use client";

import { motion } from "framer-motion";
import {
  Upload,
  FileSearch,
  Cpu,
  Scale,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-context";

export interface ScanStage {
  id: string;
  name: string;
  label: string;
  icon: typeof Upload;
  detail: string;
}

export const FIVE_INVESTIGATION_STAGES: ScanStage[] = [
  {
    id: "submit",
    name: "01. Submit",
    label: "URL Extraction",
    icon: Upload,
    detail: "Sanitizing input, enforcing SSRF boundary & blocking private RFC1918 ranges...",
  },
  {
    id: "extract",
    name: "02. Extract",
    label: "Domain Extraction",
    icon: FileSearch,
    detail: "Parsing registered domain, subdomains, Punycode 'xn--' & safe redirect hops...",
  },
  {
    id: "investigate",
    name: "03. Investigate",
    label: "Threat Intelligence",
    icon: Cpu,
    detail: "Cross-referencing brand distance, deceptive keywords & reputation feeds...",
  },
  {
    id: "evaluate",
    name: "04. Evaluate",
    label: "Risk Evaluation",
    icon: Scale,
    detail: "Synthesizing heuristic findings and zero-trust AI telemetry...",
  },
  {
    id: "protect",
    name: "05. Protect",
    label: "Security Verdict",
    icon: ShieldCheck,
    detail: "Calibrating 0–100 risk score and generating forensic defense playbook...",
  },
];

interface FiveStageScanProgressProps {
  currentStageIndex: number;
  className?: string;
}

export function FiveStageScanProgress({
  currentStageIndex,
  className,
}: FiveStageScanProgressProps) {
  const { theme } = useTheme();
  const current =
    FIVE_INVESTIGATION_STAGES[currentStageIndex] ||
    FIVE_INVESTIGATION_STAGES[0];
  const CurrentIcon = current.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D1219]/90 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl",
        className
      )}
    >
      {/* Animated horizontal luminous scanline */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 h-[2px] opacity-80"
        style={{
          background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)`,
        }}
        animate={{ y: [0, 95, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Top Header & Active Stage */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm"
            style={{
              backgroundColor: `${theme.primary}18`,
              borderColor: `${theme.primary}45`,
              color: theme.primary,
              boxShadow: `0 0 16px rgba(${theme.primaryRgb}, 0.2)`,
            }}
          >
            <CurrentIcon className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div
              className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: theme.primary }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-ping"
                style={{ backgroundColor: theme.primary }}
              />
              <span>AVERON Zero-Trust Pipeline Active</span>
            </div>
            <h4 className="text-sm font-bold text-[#F4F7FA]">
              Stage {currentStageIndex + 1}/5: {current.label}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#111923] px-2.5 py-1 text-xs text-[#A0AAB8]">
          <RefreshCw
            className="h-3 w-3 animate-spin"
            style={{ color: theme.primary }}
          />
          <span className="font-mono text-[11px]">Processing</span>
        </div>
      </div>

      {/* Stage Detail Explanation */}
      <p className="mt-3.5 font-mono text-xs text-[#A0AAB8] min-h-[32px] leading-relaxed">
        {current.detail}
      </p>

      {/* 5-Step Progress Indicators */}
      <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
        {FIVE_INVESTIGATION_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border p-2 sm:p-2.5 transition-all duration-300 text-center",
                isDone
                  ? "bg-white/[0.03]"
                  : isCurrent
                  ? "bg-[#141E29]"
                  : "border-white/5 bg-[#111923]/40 text-[#687586]"
              )}
              style={{
                borderColor: isDone
                  ? `${theme.primary}40`
                  : isCurrent
                  ? `${theme.primary}80`
                  : undefined,
                color: isDone || isCurrent ? theme.primary : undefined,
                boxShadow: isCurrent
                  ? `0 0 16px rgba(${theme.primaryRgb}, 0.2)`
                  : undefined,
              }}
            >
              <div className="flex h-5 w-5 items-center justify-center mb-1">
                {isDone ? (
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: theme.primary }}
                  />
                ) : (
                  <StageIcon
                    className={cn(
                      "h-3.5 w-3.5",
                      isCurrent && "animate-pulse"
                    )}
                    style={{ color: isCurrent ? theme.primary : "#687586" }}
                  />
                )}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider truncate w-full">
                {stage.id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
