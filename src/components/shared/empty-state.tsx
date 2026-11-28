"use client";

import type { ReactNode } from "react";
import { ShieldCheck, Search, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Database,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#0D1219]/60 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#111923] text-[[var(--theme-primary)]] shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold text-[#F4F7FA]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-[#A0AAB8]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
