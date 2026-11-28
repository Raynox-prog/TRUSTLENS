"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  UserRound,
  Menu,
} from "lucide-react";
import { AveronLogo } from "@/components/ui/liquid-glass-navbar";
import { getApiUrl } from "@/lib/api-config";
import { useTheme } from "@/components/theme/theme-context";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const pathname = usePathname();
  const [engineStatus, setEngineStatus] = useState<string>("Active");
  const { theme } = useTheme();

  useEffect(() => {
    let active = true;
    fetch(getApiUrl("/api/status"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.capabilities?.activeAiProvider) {
          const p = data.capabilities.activeAiProvider;
          setEngineStatus(p === "gemini" ? "Gemini AI" : p === "openai" ? "OpenAI" : "Zero-Trust Rules");
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#080B10]/85 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar navigation"
            className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#111923] text-[#A0AAB8] hover:text-[#F4F7FA] hover:border-white/20 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <AveronLogo />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* System telemetry status pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/5 bg-[#111923] px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: theme.primary }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
          </span>
          <span className="font-mono text-[11px] text-[#A0AAB8]">
            Engine: <span style={{ color: theme.primary }}>{engineStatus}</span>
          </span>
        </div>

        {/* Quick scanner button */}
        <Link
          href="/website-checker"
          className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-[1.02]"
          style={{
            borderColor: `${theme.primary}50`,
            backgroundColor: `${theme.primary}18`,
            color: theme.primary,
          }}
        >
          <Search className="h-3.5 w-3.5" />
          <span>Scan URL</span>
        </Link>

        {/* Notification indicator */}
        <button
          type="button"
          aria-label="Threat notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-[#111923] text-[#A0AAB8] hover:text-[#F4F7FA] transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
        </button>

        {/* Operator Profile badge */}
        <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#111923] px-2.5 py-1.5">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#141E29] border border-white/10"
            style={{ color: theme.primary }}
          >
            <UserRound className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline font-mono text-xs font-medium text-[#F4F7FA]">
            SecOps Admin
          </span>
        </div>
      </div>
    </header>
  );
}
