"use client";

import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel, ThreatSeverity } from "@/lib/types";

export type BadgeVariant =
  | "safe"
  | "low"
  | "medium"
  | "moderate"
  | "high"
  | "critical"
  | "info"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

interface StatusBadgeProps {
  status: BadgeVariant | RiskLevel | ThreatSeverity | string;
  label?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const norm = (status || "").toLowerCase();

  let styles = "bg-[#111923] text-[#A0AAB8] border-white/10";
  let Icon = Info;
  let text = label || status;

  if (norm === "safe" || norm === "secure" || norm === "completed") {
    styles = "bg-[#28D99A]/10 text-[#28D99A] border-[#28D99A]/25";
    Icon = ShieldCheck;
    text = label || "Safe";
  } else if (norm === "low") {
    styles = "bg-[#48BFA0]/10 text-[#48BFA0] border-[#48BFA0]/25";
    Icon = ShieldCheck;
    text = label || "Low Risk";
  } else if (norm === "medium" || norm === "moderate") {
    styles = "bg-[#F4BD50]/10 text-[#F4BD50] border-[#F4BD50]/25";
    Icon = AlertTriangle;
    text = label || "Medium Risk";
  } else if (norm === "high") {
    styles = "bg-[#FF8A4C]/10 text-[#FF8A4C] border-[#FF8A4C]/25";
    Icon = ShieldAlert;
    text = label || "High Risk";
  } else if (norm === "critical" || norm === "danger" || norm === "failed") {
    styles = "bg-[#FF4D5E]/10 text-[#FF4D5E] border-[#FF4D5E]/25";
    Icon = ShieldX;
    text = label || "Critical Threat";
  } else if (norm === "processing" || norm === "analyzing") {
    styles = "bg-[[var(--theme-primary)]]/10 text-[[var(--theme-primary)]] border-[[var(--theme-primary)]]/25 animate-pulse";
    Icon = CheckCircle;
    text = label || "Processing";
  } else if (norm === "info") {
    styles = "bg-[#63A9FF]/10 text-[#63A9FF] border-[#63A9FF]/25";
    Icon = Info;
    text = label || "Information";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3.5 py-1.5 text-sm gap-2",
  }[size];

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium font-mono rounded-full border transition-colors",
        sizeClasses,
        styles,
        className
      )}
    >
      {showIcon && <Icon className={cn("shrink-0", iconSizes)} />}
      <span>{text}</span>
    </span>
  );
}
