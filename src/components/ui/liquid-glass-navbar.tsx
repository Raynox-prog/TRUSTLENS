"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  Radar,
  Menu,
  X,
  FileSearch,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-context";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/website-checker", label: "Scanner", icon: ScanSearch },
  { href: "/analyze", label: "Multi-Modal", icon: FileSearch },
  { href: "/history", label: "History", icon: History },
  { href: "/intelligence", label: "Intelligence", icon: Radar },
];

export function AveronLogo({ className }: { className?: string }) {
  const { theme } = useTheme();

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 rounded-xl pr-2",
        className
      )}
      style={{ ["--tw-ring-color" as any]: theme.primary }}
    >
      <span
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D1219] border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_0_20px_var(--theme-glow)]"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2.5L4.5 5.6V11.3C4.5 16.25 7.7 20.65 12 22C16.3 20.65 19.5 16.25 19.5 11.3V5.6L12 2.5Z"
            stroke={theme.primary}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15.5 9.5"
            stroke={theme.secondary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="flex flex-col">
        <span className="font-heading text-[15px] font-bold tracking-[0.14em] text-[#F4F7FA] transition-colors">
          AVERON<span className="ml-1" style={{ color: theme.primary }}>AI</span>
        </span>
        <span className="text-[9px] font-mono tracking-widest text-[#687586] -mt-1 uppercase">
          Cyber Defense
        </span>
      </div>
    </Link>
  );
}

export const VeytrixLogo = AveronLogo;

export function LiquidGlassNavbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const shaderContainerRef = useRef<HTMLDivElement | null>(null);
  const shaderMountRef = useRef<any>(null);
  const [shaderActive, setShaderActive] = useState(false);
  const { theme } = useTheme();

  // Optional WebGL water/caustic liquid glass effect
  useEffect(() => {
    let mounted = true;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    async function initGlassShader() {
      if (!shaderContainerRef.current) return;
      try {
        const { ShaderMount, waterFragmentShader } = await import(
          "@paper-design/shaders"
        );
        if (!mounted || !shaderContainerRef.current) return;

        const parts = theme.primaryRgb.split(",").map((s) => parseFloat(s.trim()));
        const r = parts[0] / 255;
        const g = parts[1] / 255;
        const b = parts[2] / 255;

        const mount = new ShaderMount(
          shaderContainerRef.current,
          waterFragmentShader,
          {
            u_colorBack: [0.05, 0.07, 0.1, 0.85],
            u_colorHighlight: [r, g, b, 0.25],
            u_highlights: 0.35,
            u_layering: 0.2,
            u_edges: 0.15,
            u_caustic: 0.25,
            u_waves: 0.1,
            u_size: 2.0,
          },
          { alpha: true, antialias: true, powerPreference: "low-power" },
          0.3 // gentle movement
        );
        shaderMountRef.current = mount;
        if (mounted) setShaderActive(true);
      } catch {
        setShaderActive(false);
      }
    }

    initGlassShader();

    return () => {
      mounted = false;
      try {
        shaderMountRef.current?.dispose();
      } catch {
        // safe disposal
      }
      shaderMountRef.current = null;
    };
  }, []);

  // Update water shader highlights when theme changes
  useEffect(() => {
    if (shaderMountRef.current) {
      try {
        const parts = theme.primaryRgb.split(",").map((s) => parseFloat(s.trim()));
        shaderMountRef.current.setUniforms({
          u_colorHighlight: [parts[0] / 255, parts[1] / 255, parts[2] / 255, 0.25],
        });
      } catch {
        // Safe
      }
    }
  }, [theme]);

  return (
    <header className={cn("sticky top-0 z-40 w-full transition-all duration-300", className)}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <AveronLogo />

        {/* Central Liquid Glass Navigation Pill (Desktop) */}
        <nav
          aria-label="Primary"
          className="relative hidden md:flex items-center gap-1 overflow-hidden rounded-full border border-white/10 bg-[#0D1219]/80 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
        >
          {/* WebGL Caustic / Water Layer */}
          <div
            ref={shaderContainerRef}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 z-0 transition-opacity duration-700",
              shaderActive ? "opacity-35" : "opacity-0"
            )}
          />

          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative z-10 flex items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-medium tracking-wide transition-all duration-200 focus:outline-none",
                  isActive
                    ? "text-[#F4F7FA]"
                    : "text-[#A0AAB8] hover:text-[#F4F7FA] hover:bg-white/[0.04]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full border bg-[#141E29]"
                    style={{
                      borderColor: `${theme.primary}60`,
                      boxShadow: `0 0 16px rgba(${theme.primaryRgb}, 0.2)`,
                    }}
                  />
                )}
                <Icon
                  className="relative z-10 h-3.5 w-3.5 transition-colors"
                  style={{ color: isActive ? theme.primary : "#687586" }}
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side telemetry & quick action */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-[#111923]/90 px-3 py-1.5 text-xs text-[#A0AAB8]">
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
            <span className="font-mono text-[11px] text-[#A0AAB8]">Zero-Trust Active</span>
          </div>

          <Link
            href="/website-checker"
            className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all hover:scale-[1.02]"
            style={{
              borderColor: `${theme.primary}50`,
              backgroundColor: `${theme.primary}18`,
              color: theme.primary,
              boxShadow: `0 0 15px rgba(${theme.primaryRgb}, 0.18)`,
            }}
          >
            <ScanSearch className="h-3.5 w-3.5" />
            <span>Quick Scan</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0D1219]/90 text-[#F4F7FA] shadow-sm backdrop-blur-md transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mx-3 mb-3 rounded-2xl border border-white/10 bg-[#0D1219]/95 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-1.5">
              {MAIN_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "border bg-[#141E29]"
                        : "text-[#A0AAB8] hover:bg-white/5 hover:text-[#F4F7FA]"
                    )}
                    style={{
                      borderColor: isActive ? `${theme.primary}50` : undefined,
                      color: isActive ? theme.primary : undefined,
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between px-2 text-xs text-[#687586]">
                <span className="font-mono">Engine: Active Heuristics</span>
                <span className="flex items-center gap-1.5" style={{ color: theme.primary }}>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  Protected
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
