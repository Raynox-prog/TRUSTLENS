"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  LockOpen,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  FileText,
  AlertOctagon,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Fingerprint,
} from "lucide-react";
import { RiskGauge } from "@/components/risk-gauge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  riskLevelLabel,
  type AnalysisReportDTO,
  type UrlInspectionDetails,
} from "@/lib/types";
import { cn, formatDuration, formatTimestamp } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

interface InteractiveSecurityReportProps {
  report: AnalysisReportDTO;
  onScanAnother?: () => void;
  className?: string;
  isEmbedded?: boolean;
}

export function InteractiveSecurityReport({
  report,
  onScanAnother,
  className,
  isEmbedded = false,
}: InteractiveSecurityReportProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Expandable sections state
  const [expandedSection, setExpandedSection] = useState<string | null>("evidence");

  function toggleSection(id: string) {
    setExpandedSection((prev) => (prev === id ? null : id));
  }

  const inspection: UrlInspectionDetails | undefined =
    report.metadata?.urlInspection;

  async function handleCopy() {
    const text = `AVERON AI SECURITY VERDICT:
Target: ${report.inputSummary}
Verdict: ${report.verdict}
Risk Score: ${report.riskScore}/100 (${riskLevelLabel(report.riskLevel)})
Confidence: ${report.confidence.toUpperCase()}
Engine: ${report.metadata.engineLabel}
Summary: ${report.summary}
Recommendations:
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
Report ID: ${report.id}
Timestamp: ${report.createdAt}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard fallback
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      const res = await fetch(getApiUrl("/api/report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      if (!res.ok) {
        throw new Error("PDF generation failed.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `averon-threat-report-${report.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setPdfError("Could not generate PDF report. Reviewing web telemetry.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-[#0D1219]/90 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl space-y-6",
        className
      )}
    >
      {/* Top Header & Forensic ID */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[[var(--theme-primary)]]/10 border border-[[var(--theme-primary)]]/20 text-[[var(--theme-primary)]]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-bold text-[#F4F7FA]">
                AVERON AI Forensic Verdict
              </span>
              <StatusBadge status={report.riskLevel} size="sm" />
            </div>
            <p className="font-mono text-[11px] text-[#687586]">
              Audit ID: {report.id} // {formatTimestamp(report.createdAt)}
            </p>
          </div>
        </div>

        {/* Action buttons: Copy & PDF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111923] px-3 py-1.5 text-xs text-[#A0AAB8] hover:text-[#F4F7FA] hover:border-white/20 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[[var(--theme-primary)]]" />
                <span className="text-[[var(--theme-primary)]]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111923] px-3 py-1.5 text-xs text-[#A0AAB8] hover:text-[[var(--theme-primary)]] hover:border-white/20 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloadingPdf ? "Exporting..." : "PDF"}</span>
          </button>

          {onScanAnother && (
            <button
              type="button"
              onClick={onScanAnother}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[[var(--theme-primary)]]/40 bg-[[var(--theme-primary)]]/15 px-3 py-1.5 text-xs font-semibold text-[[var(--theme-primary)]] hover:bg-[[var(--theme-primary)]]/25 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Scan Another</span>
            </button>
          )}
        </div>
      </div>

      {pdfError && (
        <div className="rounded-xl border border-[#FF4D5E]/20 bg-[#FF4D5E]/10 p-3 text-xs text-[#FF4D5E]">
          {pdfError}
        </div>
      )}

      {/* Primary Score & Verdict Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-xl border border-white/5 bg-[#141E29] p-5">
        <div className="md:col-span-4 flex justify-center py-2">
          <RiskGauge score={report.riskScore} size={150} />
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#687586]">
              Target Inspected:
            </span>
            <span className="font-mono text-xs font-semibold text-[#F4F7FA] truncate max-w-sm">
              {report.inputSummary}
            </span>
          </div>

          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#F4F7FA] leading-snug">
            {report.verdict}
          </h3>

          <p className="text-xs sm:text-sm text-[#A0AAB8] leading-relaxed">
            {report.summary}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#687586]">
            <span>Confidence: <strong className="text-[#F4F7FA]">{report.confidence.toUpperCase()}</strong></span>
            <span>•</span>
            <span>Duration: <strong className="text-[#F4F7FA]">{formatDuration(report.durationMs)}</strong></span>
            <span>•</span>
            <span>Engine: <strong className="text-[[var(--theme-primary)]]">{report.metadata.engineLabel}</strong></span>
          </div>
        </div>
      </div>

      {/* Evidence and Technical Highlights */}
      {inspection && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => toggleSection("evidence")}
            className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#111923] p-3.5 text-left text-xs font-semibold text-[#F4F7FA] hover:bg-[#141E29] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[[var(--theme-primary)]]" />
              <span>Inspection Evidence & Domain Security Indicators</span>
            </div>
            {expandedSection === "evidence" ? (
              <ChevronUp className="h-4 w-4 text-[#A0AAB8]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#A0AAB8]" />
            )}
          </button>

          <AnimatePresence>
            {expandedSection === "evidence" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="rounded-xl border border-white/5 bg-[#141E29] p-3">
                    <span className="text-[10px] font-mono text-[#687586] uppercase">Protocol</span>
                    <div className="mt-1 flex items-center gap-1.5 font-mono font-semibold">
                      {inspection.isHttps ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-[#28D99A]" />
                          <span className="text-[#28D99A]">HTTPS</span>
                        </>
                      ) : (
                        <>
                          <LockOpen className="h-3.5 w-3.5 text-[#FF4D5E]" />
                          <span className="text-[#FF4D5E]">INSECURE HTTP</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#141E29] p-3">
                    <span className="text-[10px] font-mono text-[#687586] uppercase">Registered Domain</span>
                    <p className="mt-1 font-mono font-semibold text-[#F4F7FA] truncate">
                      {inspection.registeredDomain || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#141E29] p-3">
                    <span className="text-[10px] font-mono text-[#687586] uppercase">Punycode / Homograph</span>
                    <p className="mt-1 font-mono font-semibold">
                      {inspection.isPunycode ? (
                        <span className="text-[#FF4D5E]">Detected (xn--)</span>
                      ) : (
                        <span className="text-[#28D99A]">Standard ASCII</span>
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#141E29] p-3">
                    <span className="text-[10px] font-mono text-[#687586] uppercase">IP Hostname Direct</span>
                    <p className="mt-1 font-mono font-semibold">
                      {inspection.isIpAddress ? (
                        <span className="text-[#FF4D5E]">Raw IP Target</span>
                      ) : (
                        <span className="text-[#28D99A]">Named Hostname</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Typosquatting Matches if any */}
                {inspection.typosquattingMatches && inspection.typosquattingMatches.length > 0 && (
                  <div className="rounded-xl border border-[#FF8A4C]/30 bg-[#FF8A4C]/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#FF8A4C]">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Deceptive Brand Impersonation Alert</span>
                    </div>
                    {inspection.typosquattingMatches.map((match, i) => (
                      <p key={i} className="text-xs text-[#F4F7FA]/90">
                        Target simulates <strong>{match.brand}</strong> (official domain: {match.officialDomain}). {match.reason}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Forensic Recommendations */}
      <div className="rounded-xl border border-white/5 bg-[#141E29] p-5 space-y-3">
        <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[[var(--theme-primary)]] flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          <span>Actionable Security Recommendations</span>
        </h4>
        <ul className="space-y-2 text-xs text-[#A0AAB8]">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-mono text-[[var(--theme-primary)]] font-bold shrink-0">{i + 1}.</span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Footer if embedded */}
      {!isEmbedded && (
        <div className="pt-2 flex items-center justify-between text-xs text-[#687586]">
          <span>Obsidian Grid Engine // Zero-Trust Heuristics</span>
          <Link
            href="/dashboard"
            className="text-[[var(--theme-primary)]] hover:underline flex items-center gap-1"
          >
            <span>View All Telemetry in Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
