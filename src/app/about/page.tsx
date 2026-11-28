import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Mission Hero */}
        <section className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[[var(--theme-primary)]]/25 bg-[[var(--theme-primary)]]/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autonomous Cyber Defense</span>
          </span>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#F4F7FA] sm:text-5xl leading-[1.08]">
            &ldquo;Eliminating deception and zero-day threat vectors through calibrated zero-trust intelligence.&rdquo;
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-[#A0AAB8]">
            AVERON AI was engineered as a high-precision threat intelligence and URL defense platform,
            providing instantaneous heuristic and multimodal verification before threats can reach your network.
          </p>
        </section>

        {/* Core Design Principles */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Explainable Evidence Over Black Boxes",
              desc: "Every risk score is backed by observed domain structures, Punycode indicators, and clear forensic evidence.",
            },
            {
              icon: ShieldCheck,
              title: "Zero-Trust Discipline",
              desc: "AVERON AI refuses to label items as 'guaranteed safe' and enforces that HTTPS padlocks do not equal legitimacy.",
            },
            {
              icon: Terminal,
              title: "Defense-in-Depth Engineering",
              desc: "All API keys live securely server-side, AI outputs are strictly Zod-validated, images are verified and discarded in memory, and URL checks enforce SSRF boundaries.",
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="obsidian-card p-6 space-y-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[[var(--theme-primary)]]/10 border border-[[var(--theme-primary)]]/25 text-[[var(--theme-primary)]]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-heading text-sm font-bold text-[#F4F7FA]">
                  {pillar.title}
                </h2>
                <p className="text-xs leading-relaxed text-[#A0AAB8]">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </PageShell>
  );
}
