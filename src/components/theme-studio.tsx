"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeOption {
  id: string;
  name: string;
  subtitle: string;
  primaryBg: string;
  surfaceBg: string;
  accent: string;
  textColor: string;
}

export const SHIELDLY_THEMES: ThemeOption[] = [
  {
    id: "emerald-phantom",
    name: "Emerald Phantom",
    subtitle: "Default Zero-Trust Core",
    primaryBg: "#090D0C",
    surfaceBg: "#101715",
    accent: "#9257F6",
    textColor: "#F0E5D0",
  },
  {
    id: "obsidian-violet",
    name: "Obsidian Violet",
    subtitle: "Smoked Obsidian & Purple",
    primaryBg: "#0B0813",
    surfaceBg: "#150F24",
    accent: "#C084FC",
    textColor: "#F5EEFD",
  },
  {
    id: "midnight-sapphire",
    name: "Midnight Sapphire",
    subtitle: "Oceanic Deep & Cyan",
    primaryBg: "#050E18",
    surfaceBg: "#0A1C2E",
    accent: "#38BDF8",
    textColor: "#EAF2FD",
  },
  {
    id: "graphite-bronze",
    name: "Graphite Bronze",
    subtitle: "Charcoal & Amber Warmth",
    primaryBg: "#12100E",
    surfaceBg: "#201D1A",
    accent: "#F59E0B",
    textColor: "#F7F0E6",
  },
  {
    id: "arctic-titanium",
    name: "Arctic Titanium",
    subtitle: "Frosted Steel & Sky Blue",
    primaryBg: "#0B1115",
    surfaceBg: "#162228",
    accent: "#38BDF8",
    textColor: "#EBF4F7",
  },
  {
    id: "desert-dusk",
    name: "Desert Dusk",
    subtitle: "Rosewood & Crimson Accent",
    primaryBg: "#140A0F",
    surfaceBg: "#24151D",
    accent: "#FB7185",
    textColor: "#FDF2F4",
  },
  {
    id: "cosmic-mauve",
    name: "Cosmic Mauve",
    subtitle: "Astral Void & Magenta",
    primaryBg: "#0F0818",
    surfaceBg: "#1D1030",
    accent: "#E879F9",
    textColor: "#F8EEFD",
  },
];

export function ThemeStudio() {
  const [activeThemeId, setActiveThemeId] = useState("emerald-phantom");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("shieldly-theme");
    if (saved && SHIELDLY_THEMES.some((t) => t.id === saved)) {
      setActiveThemeId(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function handleSelectTheme(themeId: string) {
    setActiveThemeId(themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    localStorage.setItem("shieldly-theme", themeId);
  }

  const currentTheme =
    SHIELDLY_THEMES.find((t) => t.id === activeThemeId) || SHIELDLY_THEMES[0];

  return (
    <>
      {/* Floating Theme Studio Pill Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-2.5 rounded-full border border-[#F0E5D0]/16 bg-[#102B22]/90 px-4 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 hover:border-[#9257F6]/60 hover:scale-[1.03] active:scale-[0.98]"
          title="Open Theme Studio"
          aria-label="Toggle Theme Studio"
        >
          <span
            className="flex h-3 w-3 rounded-full border border-white/30"
            style={{ backgroundColor: currentTheme.accent }}
          />
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-[#F0E5D0]">
            Theme Studio:{" "}
            <span className="text-[#A66AFF]">{currentTheme.name}</span>
          </span>
          <Palette className="h-3.5 w-3.5 text-[#B9A9E9] transition-transform group-hover:rotate-12" />
        </button>
      </div>

      {/* Theme Studio Modal Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#F0E5D0]/20 bg-[#102B22]/95 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F0E5D0]/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#9257F6]/20 border border-[#A66AFF]/40 text-[#A66AFF]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#F0E5D0]">
                      SHIELDLY Theme Studio
                    </h3>
                    <p className="font-sans text-xs text-[#B8C6BB]">
                      7 Customizable Enterprise Color Schemes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-[#B8C6BB] hover:bg-[#1B4536] hover:text-[#F0E5D0] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Theme Options List */}
              <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {SHIELDLY_THEMES.map((theme) => {
                  const isSelected = theme.id === activeThemeId;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all duration-200",
                        isSelected
                          ? "border-[#A66AFF] bg-[#173D30] shadow-[0_0_20px_rgba(146,87,246,0.3)]"
                          : "border-[#F0E5D0]/10 bg-[#102B22]/70 hover:border-[#F0E5D0]/25 hover:bg-[#173D30]/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Color swatch circle */}
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${theme.surfaceBg} 0%, ${theme.primaryBg} 100%)`,
                          }}
                        >
                          <span
                            className="h-3 w-3 rounded-full border border-white/30"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>

                        <div>
                          <h4 className="font-heading text-sm font-bold text-[#F0E5D0]">
                            {theme.name}
                          </h4>
                          <p className="font-sans text-[11px] text-[#B8C6BB]">
                            {theme.subtitle}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9257F6] text-white shadow-md">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="mt-4 border-t border-[#F0E5D0]/10 pt-3 text-center">
                <p className="font-mono text-[10px] text-[#B8C6BB]/75">
                  High-contrast typography is preserved across all theme schemes.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
