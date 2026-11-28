"use client";

import { cn } from "@/lib/utils";

interface ObsidianGridBackgroundProps {
  variant?: "hero" | "page";
  className?: string;
  showCoordinates?: boolean;
}

export function ObsidianGridBackground({
  variant = "hero",
  className,
  showCoordinates = true,
}: ObsidianGridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className
      )}
    >
      {/* 1. LAYER 1: Deep Matte Obsidian Gradient Base (#090D0C -> #101715 -> #151D1A) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--obsidian-base, #090D0C) 0%, var(--obsidian-charcoal, #101715) 52%, var(--obsidian-graphite, #151D1A) 100%)",
        }}
      />

      {/* 2. LAYER 2: Subtle Diagonal Graphite Surface Variation */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(21, 29, 26, 0.45) 0%, transparent 55%, rgba(9, 13, 12, 0.3) 100%)",
        }}
      />

      {/* 3. LAYER 3: Fine Technical Cybersecurity Grid (40px) */}
      <div className="obsidian-grid-pattern absolute inset-0 opacity-85" />

      {/* 4. LAYER 4: Major Coordinate Matrix Division (200px) */}
      <div className="obsidian-grid-major absolute inset-0 opacity-70" />

      {/* 5. LAYER 5: Soft Ambient Illumination (Slow 24s gentle opacity shift, theme-adaptive) */}
      {variant === "hero" ? (
        <>
          {/* Primary Upper-Center Ambient Lighting (Emerald / Active Theme) */}
          <div
            className="animate-obsidian-ambient absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 65% 45% at 50% 28%, var(--obsidian-ambient-primary, rgba(33, 201, 151, 0.12)) 0%, transparent 72%)",
            }}
          />

          {/* Secondary Restrained Accent Glow (Lower Flank) */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 55% 40% at 50% 78%, var(--obsidian-ambient-secondary, rgba(146, 87, 246, 0.08)) 0%, transparent 68%)",
            }}
          />
        </>
      ) : (
        /* Page Shell Ambient Illumination */
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 20%, var(--obsidian-ambient-primary, rgba(33, 201, 151, 0.10)) 0%, transparent 75%)",
          }}
        />
      )}

      {/* 6. LAYER 6: Precision Edge Vignette */}
      <div className="obsidian-vignette absolute inset-0" />

      {/* 7. LAYER 7: Precision Technical Coordinate Markings (Minimal, high authority) */}
      {showCoordinates && variant === "hero" && (
        <div className="hidden lg:block absolute inset-0 p-8">
          <div className="flex h-full w-full flex-col justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-[#B8C6BB]/25">
            <div className="flex justify-between">
              <span>SYS::OBSIDIAN_GRID // 09.13.12</span>
              <span>GEO::LAT_00.SEC // ZERO-TRUST</span>
            </div>
            <div className="flex justify-between">
              <span>MATRIX::ACTIVE // PASSIVE_MONITOR</span>
              <span>VERIFY_ALL // TRUST_NONE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
