"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanSearch,
  History,
  Radar,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-context";

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/website-checker", label: "Scanner", icon: ScanSearch },
  { href: "/history", label: "History", icon: History },
  { href: "/intelligence", label: "Intelligence", icon: Radar },
  { href: "/analyze", label: "Multi-Modal", icon: UserRound },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-md pointer-events-auto flex items-center justify-around rounded-2xl border border-white/10 bg-[#0D1219]/90 py-2 px-3 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 select-none",
                isActive ? "text-[#F4F7FA]" : "text-[#A0AAB8] hover:text-[#F4F7FA]"
              )}
              style={{ color: isActive ? theme.primary : undefined }}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-xl bg-white/[0.05] border"
                  style={{ borderColor: `${theme.primary}50` }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-[10px] font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
