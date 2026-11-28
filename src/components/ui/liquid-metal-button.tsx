"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-context";

export interface LiquidMetalButtonProps {
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  viewMode?: "default" | "icon";
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export function LiquidMetalButton({
  label = "Scan URL",
  onClick,
  viewMode = "default",
  icon,
  disabled = false,
  type = "button",
  className,
  variant = "primary",
  size = "md",
}: LiquidMetalButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shaderMountRef = useRef<any>(null);
  const [shaderActive, setShaderActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  // Compute shader color tint based on active theme & button variant
  const getColorTint = (): [number, number, number, number] => {
    if (variant === "danger") {
      return [1.0, 0.3, 0.37, 0.9]; // #FF4D5E
    }
    if (variant === "secondary") {
      const parts = theme.secondaryRgb.split(",").map((s) => parseFloat(s.trim()));
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255, 0.85];
    }
    return theme.shaderTint;
  };

  useEffect(() => {
    let mounted = true;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return;
    }

    async function initShader() {
      if (!containerRef.current) return;
      try {
        const { ShaderMount, liquidMetalFragmentShader, LiquidMetalShapes } =
          await import("@paper-design/shaders");

        if (!mounted || !containerRef.current) return;

        const colorTint = getColorTint();

        const mount = new ShaderMount(
          containerRef.current,
          liquidMetalFragmentShader,
          {
            u_repetition: 3.5,
            u_softness: 0.75,
            u_shiftRed: 0.15,
            u_shiftBlue: 0.25,
            u_distortion: 0.35,
            u_contour: 0.6,
            u_angle: 35.0,
            u_shape: LiquidMetalShapes.none,
            u_isImage: false,
            u_colorBack: [0.03, 0.045, 0.065, 1.0],
            u_colorTint: colorTint,
          },
          { antialias: true, alpha: true, powerPreference: "low-power" },
          0.45 // speed
        );

        shaderMountRef.current = mount;
        if (mounted) setShaderActive(true);
      } catch {
        // Fallback to CSS liquid gradient
        setShaderActive(false);
      }
    }

    initShader();

    return () => {
      mounted = false;
      try {
        shaderMountRef.current?.dispose();
      } catch {
        // Safe disposal
      }
      shaderMountRef.current = null;
    };
  }, []);

  // Dynamically update shader color when active theme changes without remounting
  useEffect(() => {
    if (shaderMountRef.current) {
      try {
        const newTint = getColorTint();
        shaderMountRef.current.setUniforms({ u_colorTint: newTint });
      } catch {
        // Ignore
      }
    }
  }, [theme, variant]);

  // Adjust shader speed dynamically on hover
  useEffect(() => {
    if (shaderMountRef.current) {
      try {
        shaderMountRef.current.setSpeed(isHovered ? 1.2 : 0.45);
      } catch {
        // Ignore
      }
    }
  }, [isHovered]);

  const sizeStyles = {
    sm: "h-9 px-3.5 text-xs gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-13 px-7 text-base gap-2.5",
  }[size];

  const isIconOnly = viewMode === "icon";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative isolate inline-flex select-none items-center justify-center overflow-hidden rounded-xl font-heading font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        isIconOnly ? "h-11 w-11 p-0 rounded-xl" : sizeStyles,
        "border border-white/15 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.7)] active:scale-[0.98]",
        className
      )}
      style={{
        boxShadow: isHovered
          ? `0 8px 30px rgba(${theme.primaryRgb}, 0.25)`
          : `0 4px 24px -4px rgba(0,0,0,0.7)`,
        borderColor: isHovered ? `${theme.primary}80` : "rgba(255, 255, 255, 0.15)",
        ["--tw-ring-color" as any]: theme.primary,
      }}
    >
      {/* WebGL Shader Container */}
      <div
        ref={containerRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 h-full w-full transition-opacity duration-500",
          shaderActive ? "opacity-90" : "opacity-0"
        )}
      />

      {/* High-fidelity CSS Liquid Metal Fallback adapted to active theme */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 transition-opacity duration-500",
          shaderActive ? "opacity-0" : "opacity-100"
        )}
        style={{
          background:
            variant === "danger"
              ? "linear-gradient(to right, #200A10, rgba(255,77,94,0.3), #141E29)"
              : `linear-gradient(to right, #0D1219, rgba(${theme.primaryRgb}, 0.28), #111923)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse at top, rgba(${theme.primaryRgb}, 0.35), transparent 70%)`,
          }}
        />
      </div>

      {/* Luminous Specular Top Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />

      {/* Interactive Liquid Glow on Hover */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-x-4 -inset-y-2 z-0 blur-md transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: `linear-gradient(to right, transparent, rgba(${theme.primaryRgb}, 0.25), transparent)`,
        }}
      />

      {/* Content Layer */}
      <span className="relative z-10 flex items-center justify-center gap-2 text-[#F4F7FA] font-medium tracking-wide">
        {icon ||
          (isIconOnly ? (
            <ShieldCheck className="h-5 w-5" style={{ color: theme.primary }} />
          ) : null)}
        {!isIconOnly && <span>{label}</span>}
        {!isIconOnly && !icon && (
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: theme.primary }}
          />
        )}
      </span>
    </button>
  );
}
