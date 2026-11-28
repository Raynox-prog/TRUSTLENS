"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { ThemeProvider } from "./theme/theme-context";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let lenis: Lenis | null = null;
    let rafId = 0;
    try {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const instance = lenis;
      const raf = (time: number) => {
        instance.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } catch {
      return;
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
