import { HeroSection } from "@/components/hero-section";
import { AnimatedSecurityStats } from "@/components/animated-stats";
import { SecurityArchitectureVisualizer } from "@/components/security-architecture";
import { ThreatSeverityOverview } from "@/components/threat-severity-overview";
import { HomepageSections } from "@/components/homepage-sections";
import { CyberattackSimulation } from "@/components/cyberattack-simulation";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen obsidian-grid-bg text-[#F4F7FA]" style={{ backgroundColor: "transparent" }}>
      {/* 1. UPGRADED HERO WITH 'One Click. Five Layers. Total Protection.' & GLOWING URL SCANNER */}
      <HeroSection />

      {/* 2. ANIMATED CYBERSECURITY TELEMETRY & PERFORMANCE STATISTICS */}
      <AnimatedSecurityStats />

      {/* 3. VISUAL REPRESENTATION OF THE FIVE-STAGE ZERO-TRUST ARCHITECTURE */}
      <SecurityArchitectureVisualizer />

      {/* 4. CALIBRATED THREAT SEVERITY OVERVIEW & EMERGENCY ACTION PLAYBOOKS */}
      <ThreatSeverityOverview />

      {/* 5. PRESERVED PLATFORM CAPABILITIES, 17 SCAM CATEGORIES & LIVE INTERACTIVE DEMO */}
      <HomepageSections />

      {/* 6. INTERACTIVE CYBERATTACK SIMULATION — 'SEE HOW AVERON DEFENDS YOU' */}
      <CyberattackSimulation />

      {/* 7. PLATFORM FOOTER */}
      <Footer />
    </main>
  );
}
