"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  label = "Loading telemetry data...",
  description,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0D1219]/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="relative flex h-10 w-10 items-center justify-center text-[[var(--theme-primary)]]">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <p className="mt-3.5 text-sm font-medium text-[#F4F7FA]">{label}</p>
      {description && (
        <p className="mt-1 text-xs text-[#687586]">{description}</p>
      )}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl border border-white/5 bg-[#141E29]/70 p-5",
        className
      )}
    >
      <div className="h-4 w-1/3 rounded bg-white/10" />
      <div className="mt-4 h-8 w-1/2 rounded bg-white/10" />
      <div className="mt-3 h-3 w-3/4 rounded bg-white/5" />
    </div>
  );
}
