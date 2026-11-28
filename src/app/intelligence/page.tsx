"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ExternalLink,
  Globe,
  Database,
  CheckCircle,
  AlertTriangle,
  Info,
  Server,
  Cpu,
  Lock,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { getApiUrl } from "@/lib/api-config";
import { type AnalysisReportDTO } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

interface StatusCapabilities {
  geminiConfigured: boolean;
  openaiConfigured: boolean;
  safeBrowsingConfigured: boolean;
  activeAiProvider: "gemini" | "openai" | "heuristic-only";
  activeAiModel: string | null;
}

export default function ThreatIntelligencePage() {
  const [capabilities, setCapabilities] = useState<StatusCapabilities | null>(null);
  const [reports, setReports] = useState<AnalysisReportDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [statusRes, reportsRes] = await Promise.all([
          fetch(getApiUrl("/api/status")),
          fetch(getApiUrl("/api/reports")),
        ]);

        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          if (active && statusJson.capabilities) {
            setCapabilities(statusJson.capabilities);
          }
        }

        if (reportsRes.ok) {
          const reportsJson = await reportsRes.json();
          if (active && reportsJson.recentReports) {
            setReports(reportsJson.recentReports);
          }
        }
      } catch {
        // Handled
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Filter out actual threat reports
  const flaggedThreats = reports.filter(
    (r) => r.riskScore >= 40 || (r.detectedThreats && r.detectedThreats.length > 0)
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-white/5 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[[var(--theme-primary)]]/25 bg-[[var(--theme-primary)]]/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-[[var(--theme-primary)]]">
            <Radar className="h-3.5 w-3.5" />
            <span>AVERON Intelligence Matrix</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold text-[#F4F7FA]">
            Threat Intelligence & Feeds
          </h1>
          <p className="text-xs sm:text-sm text-[#A0AAB8] max-w-3xl leading-relaxed">
            Real-time telemetry, zero-trust heuristics, and threat feed integration registry.
            All active integrations run securely in backend isolated environments.
          </p>
        </div>

        {/* Integration Registry Cards */}
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[#687586]">
            Intelligence Engines & Provider Registry
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Local Deterministic Heuristics */}
            <div className="obsidian-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F4F7FA]">
                  <Cpu className="h-4 w-4 text-[[var(--theme-primary)]]" />
                  <span>Obsidian Heuristics Core</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#28D99A]/10 border border-[#28D99A]/20 px-2 py-0.5 font-mono text-[10px] text-[#28D99A]">
                  Active Local
                </span>
              </div>
              <p className="text-xs text-[#A0AAB8] leading-relaxed">
                RFC1918 SSRF guard, Levenshtein brand distance, Punycode detection, and redirect hop tracing.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#687586]">
                Status: Operational (Always-on)
              </div>
            </div>

            {/* 2. AI Reasoning Engine */}
            <div className="obsidian-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F4F7FA]">
                  <Server className="h-4 w-4 text-[#63A9FF]" />
                  <span>AI Zero-Trust Evaluator</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] border ${
                    capabilities?.activeAiProvider !== "heuristic-only"
                      ? "bg-[#28D99A]/10 border-[#28D99A]/20 text-[#28D99A]"
                      : "bg-[#63A9FF]/10 border-[#63A9FF]/20 text-[#63A9FF]"
                  }`}
                >
                  {capabilities?.activeAiProvider === "gemini"
                    ? "Gemini Online"
                    : capabilities?.activeAiProvider === "openai"
                    ? "OpenAI Online"
                    : "Deterministic Mode"}
                </span>
              </div>
              <p className="text-xs text-[#A0AAB8] leading-relaxed">
                Structured LLM reasoning with delimiter sandboxing and strict JSON schema validation.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#687586]">
                Model: {capabilities?.activeAiModel || "Heuristic Deterministic Rules"}
              </div>
            </div>

            {/* 3. Google Safe Browsing / Web Risk */}
            <div className="obsidian-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F4F7FA]">
                  <Globe className="h-4 w-4 text-[#F4BD50]" />
                  <span>Google Web Risk Feed</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] border ${
                    capabilities?.safeBrowsingConfigured
                      ? "bg-[#28D99A]/10 border-[#28D99A]/20 text-[#28D99A]"
                      : "bg-white/5 border-white/10 text-[#687586]"
                  }`}
                >
                  {capabilities?.safeBrowsingConfigured ? "Connected" : "Standby API"}
                </span>
              </div>
              <p className="text-xs text-[#A0AAB8] leading-relaxed">
                Cross-references active URLs against known Google threat intelligence malware registries.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#687586]">
                {capabilities?.safeBrowsingConfigured ? "Credentials Verified" : "Key Optional in .env"}
              </div>
            </div>

            {/* 4. VirusTotal Feed */}
            <div className="obsidian-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F4F7FA]">
                  <Database className="h-4 w-4 text-[#A0AAB8]" />
                  <span>VirusTotal Registry</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-[#687586]">
                  Future Integration
                </span>
              </div>
              <p className="text-xs text-[#A0AAB8] leading-relaxed">
                Multi-engine antivirus scanner aggregation and historical domain reputation index.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#687586]">
                Planned for AVERON Enterprise
              </div>
            </div>

            {/* 5. URLhaus Abuse Database */}
            <div className="obsidian-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F4F7FA]">
                  <ShieldAlert className="h-4 w-4 text-[#A0AAB8]" />
                  <span>URLhaus Malware Feed</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-[#687586]">
                  Future Integration
                </span>
              </div>
              <p className="text-xs text-[#A0AAB8] leading-relaxed">
                Crowdsourced malware distribution site feed operated by abuse.ch community.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#687586]">
                Planned for AVERON Enterprise
              </div>
            </div>

            {/* 6. Zero-Trust SSRF Gateway */}
            <div className="obsidian-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#F4F7FA]">
                  <Lock className="h-4 w-4 text-[[var(--theme-primary)]]" />
                  <span>SSRF Security Gateway</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#28D99A]/10 border border-[#28D99A]/20 px-2 py-0.5 font-mono text-[10px] text-[#28D99A]">
                  Enforced
                </span>
              </div>
              <p className="text-xs text-[#A0AAB8] leading-relaxed">
                Blocks DNS rebinding, internal cloud metadata endpoints (169.254.169.254) and localhost lookups.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-[#687586]">
                Status: Hardware Level Shield Active
              </div>
            </div>
          </div>
        </div>

        {/* Flagged Threat Feed from Real Scans */}
        <div className="obsidian-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="font-heading text-base font-semibold text-[#F4F7FA]">
                Active Threat Detections in Telemetry
              </h3>
              <p className="text-xs text-[#687586]">
                Domains and URLs evaluated as elevated or critical threats
              </p>
            </div>
            <span className="font-mono text-xs text-[[var(--theme-primary)]]">
              {flaggedThreats.length} Threats Documented
            </span>
          </div>

          {loading ? (
            <LoadingState label="Querying threat telemetry..." />
          ) : flaggedThreats.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No Flagged Threats"
              description="No elevated threat signatures or deceptive domains found in your scanned telemetry."
              action={
                <Link
                  href="/website-checker"
                  className="inline-flex items-center gap-2 rounded-xl bg-[[var(--theme-primary)]] px-4 py-2 text-xs font-semibold text-[#080B10]"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Scan Suspicious URL</span>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {flaggedThreats.map((threat) => (
                <div
                  key={threat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#0D1219] p-4 text-xs transition-colors hover:border-white/15"
                >
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={threat.riskLevel} size="sm" />
                      <span className="font-mono text-xs font-bold text-[#FF4D5E]">
                        Score: {threat.riskScore}/100
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[#F4F7FA] font-medium break-all">
                      {threat.inputSummary}
                    </p>
                    <p className="text-xs text-[#A0AAB8]">
                      {threat.verdict}
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 text-[11px] text-[#687586] shrink-0">
                    <span>{formatTimestamp(threat.createdAt)}</span>
                    <Link
                      href={`/results?id=${encodeURIComponent(threat.id)}`}
                      className="inline-flex items-center gap-1 font-mono text-xs text-[[var(--theme-primary)]] hover:underline"
                    >
                      <span>Forensic Dossier</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
