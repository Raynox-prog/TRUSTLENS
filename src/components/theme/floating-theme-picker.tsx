"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./theme-context";
import { THEMES } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

export function FloatingThemePicker() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-22 md:bottom-6 right-6 z-50 select-none"
    >
      {/* Floating Theme Palette Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute bottom-full right-0 mb-3 w-[300px] sm:w-[320px] rounded-2xl border border-white/12 bg-[#0D1219]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
            role="dialog"
            aria-label="Color Theme Switcher"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${theme.primary}25` }}
                >
                  <Sparkles
                    className="h-3 w-3"
                    style={{ color: theme.primary }}
                  />
                </span>
                <div>
                  <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#F4F7FA]">
                    Dual-Colour Themes
                  </h3>
                  <p className="text-[10px] text-[#A0AAB8]">
                    Active: <strong style={{ color: theme.primary }}>{theme.name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close palette"
                className="rounded-lg p-1 text-[#687586] hover:bg-white/5 hover:text-[#F4F7FA] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 6 Dual-Colour Theme Swatches (3-column, 2-row grid) */}
            <div className="mt-3.5 grid grid-cols-3 gap-3">
              {THEMES.map((t) => {
                const isSelected = theme.id === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    title={`${t.name} (${t.primary} / ${t.secondary})`}
                    className={cn(
                      "group relative flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-200 focus:outline-none",
                      isSelected
                        ? "bg-[#141E29] border border-white/20 shadow-lg"
                        : "hover:bg-white/[0.04] border border-transparent"
                    )}
                  >
                    {/* Dual-Colour Circular Swatch (Diagonal Split) */}
                    <div
                      className={cn(
                        "relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 shadow-[0_4px_14px_rgba(0,0,0,0.5)]",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-offset-[#0D1219]"
                          : "border border-white/20"
                      )}
                      style={{
                        background: t.previewGradient,
                        ["--tw-ring-color" as any]: t.primary,
                      }}
                    >
                      {/* Subtle metallic sheen reflection */}
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/25 via-transparent to-white/35" />

                      {/* Selected checkmark indicator */}
                      {isSelected && (
                        <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white shadow-sm backdrop-blur-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Theme Name */}
                    <span
                      className={cn(
                        "font-mono text-[9px] uppercase tracking-wider text-center leading-tight transition-colors line-clamp-1",
                        isSelected
                          ? "font-bold text-[#F4F7FA]"
                          : "text-[#A0AAB8] group-hover:text-[#F4F7FA]"
                      )}
                    >
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Footer hint */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-[#687586]">
              <span>Zero-Trust Palette</span>
              <span>Smooth CSS Shift</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 54px Circular Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle AVERON Color Theme Palette"
        aria-expanded={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="group relative flex h-13 w-13 items-center justify-center rounded-full border border-white/15 bg-[#0D1219] text-[#F4F7FA] shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 focus:outline-none focus-visible:ring-2"
        style={{
          boxShadow: isOpen
            ? `0 0 28px ${theme.primary}50, 0 8px 30px rgba(0,0,0,0.8)`
            : `0 6px 24px rgba(0,0,0,0.7)`,
          borderColor: isOpen ? `${theme.primary}80` : "rgba(255, 255, 255, 0.15)",
        }}
      >
        {/* Subtle dual-color rotating ambient ring */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-0.5 rounded-full opacity-40 blur-xs transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
          }}
        />

        {/* Matte dark button interior */}
        <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-[#0D1219] border border-white/10">
          <Palette
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45"
            style={{ color: theme.primary }}
          />
        </div>

        {/* Active mini pulse beacon */}
        <span
          className="absolute -top-0.5 -right-0.5 z-20 flex h-3 w-3"
        >
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: theme.primary }}
          />
          <span
            className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#080B10]"
            style={{ backgroundColor: theme.secondary }}
          />
        </span>
      </motion.button>
    </div>
  );
}
