import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import { Providers } from "@/components/providers";
import { FloatingThemePicker } from "@/components/theme/floating-theme-picker";
import { ParticleCanvas } from "@/components/theme/particle-canvas";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVERON AI — AI-Powered Cybersecurity & Threat Intelligence",
  description:
    "Next-generation cybersecurity command center and threat intelligence platform. Zero-trust URL scanning, AI heuristic telemetry, and domain investigation.",
  keywords: [
    "AVERON AI",
    "cybersecurity",
    "threat intelligence",
    "zero-trust URL scanner",
    "phishing detection",
    "domain security",
    "malware defense",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("averon-theme")||localStorage.getItem("veytrix-theme")||"emerald-fusion";document.documentElement.setAttribute("data-theme",s);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#080B10] font-sans text-[#F4F7FA] antialiased selection:bg-[var(--theme-primary)]/30 selection:text-white">
        <Providers>
          {/*
           * z-index layering:
           *   z:0  — body bg (#080B10 solid)
           *   z:1  — ParticleCanvas (fixed, draws on the body layer)
           *   z:2  — #content-root (position:relative, transparent — canvas shows through)
           *   z:50 — FloatingThemePicker (fixed, above everything)
           *
           * Page elements with explicit backgrounds (cards, navbars) correctly
           * cover the canvas within their own bounds.
           */}
          <ParticleCanvas />
          <div
            id="content-root"
            style={{ position: "relative", zIndex: 2 }}
          >
            {children}
            <FloatingThemePicker />
          </div>
        </Providers>
      </body>
    </html>
  );
}
