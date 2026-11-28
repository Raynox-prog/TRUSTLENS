"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanSearch,
  FileSearch,
  History,
  Radar,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-context";

interface SidebarProps {
  collapsed?: boolean;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Security Overview", icon: LayoutDashboard },
  { href: "/website-checker", label: "URL Scanner", icon: ScanSearch },
  { href: "/analyze", label: "Multi-Modal Scan", icon: FileSearch },
  { href: "/history", label: "Scan History", icon: History },
  { href: "/intelligence", label: "Threat Intelligence", icon: Radar },
  { href: "/how-it-works", label: "Architecture", icon: Cpu },
];

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between border-r border-white/5 bg-[#080B10] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-3 space-y-6">
        {/* Navigation Category */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#687586]">
              Navigation
            </p>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#141E29] text-[#F4F7FA] shadow-[0_4px_16px_rgba(0,0,0,0.4)] border"
                    : "text-[#A0AAB8] hover:bg-white/[0.03] hover:text-[#F4F7FA]"
                )}
                style={{
                  borderColor: isActive ? `${theme.primary}40` : undefined,
                }}
              >
                <Icon
                  className="h-4 w-4 shrink-0 transition-colors"
                  style={{ color: isActive ? theme.primary : "#687586" }}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Telemetry Card */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl border border-white/5 bg-[#0D1219]/80 text-xs">
          <div
            className="flex items-center gap-2 font-mono text-[11px]"
            style={{ color: theme.primary }}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Obsidian Grid 2.0</span>
          </div>
          <p className="mt-1 text-[11px] text-[#687586] leading-relaxed">
            Zero-trust heuristics & AI telemetry active.
          </p>
        </div>
      )}
    </aside>
  );
}
