"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PhantomCoreCanvas } from "./phantom-core-canvas";
import { PhantomCoreHud } from "./phantom-core-hud";
import { PhantomCoreFallback } from "./phantom-core-fallback";
import { cn } from "@/lib/utils";

interface PhantomCoreContainerProps {
  isScanning?: boolean;
  scanStageIndex?: number;
  className?: string;
  onClickCore?: () => void;
}

export function PhantomCoreContainer({
  isScanning = false,
  scanStageIndex = 0,
  className,
  onClickCore,
}: PhantomCoreContainerProps) {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas");
      const supported = Boolean(
        window.WebGLRenderingContext &&
          (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
      setHasWebGL(supported);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-10",
        className
      )}
    >
      {/* Soft atmospheric radial gradient beneath the core with smooth falloff (zero blur-raster overhead) */}
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.34) 0%, rgba(33,201,151,0.18) 32%, rgba(23,61,48,0.08) 55%, transparent 72%)",
        }}
      />

      {/* 3D WebGL Visualization or Fallback */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {hasWebGL === false ? (
          <PhantomCoreFallback isScanning={isScanning} />
        ) : hasWebGL === true ? (
          <PhantomCoreCanvas
            isScanning={isScanning}
            scanStageIndex={scanStageIndex}
            onClickCore={onClickCore}
          />
        ) : null}
      </motion.div>

      {/* Floating Cybersecurity Intelligence Labels HUD */}
      <PhantomCoreHud isScanning={isScanning} />
    </div>
  );
}
