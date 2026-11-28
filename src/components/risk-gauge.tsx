"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { scoreToRiskLevel, type RiskLevel } from "@/lib/types";

interface RiskGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  variant?: string;
}

function getArcColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "var(--theme-primary)";
    case "moderate":
      return "#F4BD50";
    case "high":
      return "#FF8A4C";
    case "critical":
      return "#FF4D5E";
  }
}

export function RiskGauge({
  score,
  size = 156,
  strokeWidth = 10,
  label,
}: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const level = scoreToRiskLevel(clamped);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    const duration = prefersReduced ? 0 : 900;
    const start = performance.now();

    const tick = (now: number) => {
      if (duration === 0) {
        setDisplayScore(clamped);
        return;
      }
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * clamped));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = Number((2 * Math.PI * radius).toFixed(2));
  const targetOffset = Number(
    (circumference - (clamped / 100) * circumference).toFixed(2)
  );
  const arcColor = getArcColor(level);

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${clamped} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={arcColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center numerical telemetry */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-heading text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ color: arcColor }}
        >
          {displayScore}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#687586]">
          {label ?? "Risk Score"}
        </span>
      </div>
    </div>
  );
}
