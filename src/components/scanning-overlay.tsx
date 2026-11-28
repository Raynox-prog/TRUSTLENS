"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, ScanSearch, Sparkles, Lock } from "lucide-react";

const STEPS_BY_MODE = {
  text: [
    "Sanitizing untrusted message input...",
    "Extracting embedded URLs & urgency markers...",
    "Evaluating 17 scam & social engineering vectors...",
    "Validating structured risk report...",
  ],
  image: [
    "Verifying binary file signature & MIME headers...",
    "Running multimodal visual & context inspection...",
    "Checking for OTP, payment, and sender impersonation...",
    "Discarding raw image buffer & finalizing report...",
  ],
  url: [
    "Running SSRF & private-IP security guards...",
    "Dissecting registered domain, TLD & typosquatting...",
    "Probing safe redirect chain without script execution...",
    "Compiling calibrated website security verdict...",
  ],
};

export function ScanningOverlay({
  mode,
  uploadProgress,
}: {
  mode: "text" | "image" | "url";
  uploadProgress?: number | null;
}) {
  const steps = STEPS_BY_MODE[mode];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1100);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="relative overflow-hidden rounded-3xl border border-[#9257F6]/45 bg-[#102B22]/90 p-8 text-center shadow-[0_24px_64px_rgba(146,87,246,0.28)] backdrop-blur-xl"
    >
      {/* Animated scanline */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-[#9257F6]/20 to-transparent"
        animate={{ y: ["-100%", "340%"] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-[#9257F6]/60"
            animate={{ scale: [1, 1.32, 1], opacity: [0.8, 0.15, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#A66AFF] to-[#9257F6] text-white shadow-[0_0_32px_rgba(146,87,246,0.65)]">
            {mode === "image" ? (
              <ScanSearch className="h-7 w-7" />
            ) : mode === "url" ? (
              <Lock className="h-7 w-7" />
            ) : (
              <Shield className="h-7 w-7" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#9257F6]/20 border border-[#B9A9E9]/30 px-3 py-1 text-xs font-semibold text-[#B9A9E9]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AVERON Investigation Active</span>
          </div>
          <h3 className="text-xl font-bold text-[#F0E5D0]">
            Investigating Submitted{" "}
            {mode === "text" ? "Message" : mode === "image" ? "Screenshot" : "Website"}
          </h3>
          <p className="text-sm text-[#B8C6BB]">{steps[stepIndex]}</p>
        </div>

        {typeof uploadProgress === "number" && uploadProgress < 100 && (
          <div className="w-full max-w-xs space-y-1.5">
            <div className="flex justify-between text-xs text-[#B8C6BB]">
              <span>Uploading screenshot</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#1B4536]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9257F6] to-[#A66AFF] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Shimmer skeleton bars */}
        <div className="mt-2 grid w-full max-w-md grid-cols-3 gap-2.5">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-2 overflow-hidden rounded-full bg-[#1B4536]"
            >
              <motion.div
                className="h-full w-1/2 rounded-full bg-[#9257F6]/70"
                animate={{ x: ["-100%", "220%"] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: idx * 0.25,
                  ease: "easeInOut",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
