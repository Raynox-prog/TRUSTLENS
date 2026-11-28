"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Globe,
  Image as ImageIcon,
  Info,
  Lock,
  LockOpen,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { RiskGauge } from "@/components/risk-gauge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  riskLevelLabel,
  type AnalysisReportDTO,
  type RiskLevel,
  type ThreatSeverity,
} from "@/lib/types";
import {
  buildPlainTextReport,
  cn,
  formatBytes,
  formatDuration,
  formatTimestamp,
} from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

function ResultsContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id") || "latest";

  const [fetchState, setFetchState] = useState<{
    loadedId: string | null;
    report: AnalysisReportDTO | null;
    error: string | null;
  }>({
    loadedId: null,
    report: null,
    error: null,
  });
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(getApiUrl(`/api/reports/${encodeURIComponent(reportId)}`))
      .then(async (res) => {
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setFetchState({
            loadedId: reportId,
            report: null,
            error: data.error ?? "Report not found.",
          });
        } else {
          setFetchState({
            loadedId: reportId,
            report: data as AnalysisReportDTO,
            error: null,
          });
        }
      })
      .catch(() => {
        if (active) {
          setFetchState({
            loadedId: reportId,
            report: null,
            error: "Could not load report from AVERON backend.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [reportId]);

  const loading = fetchState.loadedId !== reportId;
  const report = fetchState.loadedId === reportId ? fetchState.report : null;
  const error = pdfError ?? (fetchState.loadedId === reportId ? fetchState.error : null);

  async function handleCopyReport() {
    if (!report) return;
    const text = buildPlainTextReport(report);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        textarea.remove();
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        }
      } catch {
        // clipboard fallback
      }
    }
  }

  async function handleDownloadPdf() {
    if (!report) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(getApiUrl("/api/report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `averon-report-${report.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("Unable to generate PDF report right now.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 space-y-6">
        <div className="h-56 animate-pulse rounded-2xl bg-[#141E29] border border-white/5" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-[#141E29] border border-white/5" />
          <div className="h-40 animate-pulse rounded-2xl bg-[#141E29] border border-white/5" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4D5E]/10 border border-[#FF4D5E]/20 text-[#FF4D5E]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#F4F7FA]">
          No Investigation Report Available
        </h1>
        <p className="text-sm text-[#A0AAB8]">
          {error ??
            "Run a website, screenshot, or text investigation to view your full detailed report."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/website-checker"
            className="inline-flex items-center gap-2 rounded-xl bg-[[var(--theme-primary)]] px-5 py-2.5 text-xs font-semibold text-[#080B10] hover:bg-[[var(--theme-primary)]]/90 transition-colors"
          >
            <span>Scan a Website</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-5 py-2.5 text-xs font-semibold text-[#F4F7FA] hover:bg-[#141E29] transition-colors"
          >
            <span>Security Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon =
    report.analysisType === "url"
      ? Globe
      : report.analysisType === "image"
      ? ImageIcon
      : MessageSquareText;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#A0AAB8] hover:text-[[var(--theme-primary)]] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Security Overview</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-4 py-2 text-xs font-medium text-[#F4F7FA] hover:border-white/20 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[[var(--theme-primary)]]" />
                <span className="text-[[var(--theme-primary)]]">Copied Report</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-[[var(--theme-primary)]] px-4 py-2 text-xs font-semibold text-[#080B10] hover:bg-[[var(--theme-primary)]]/90 transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloadingPdf ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* Primary Risk Verdict Hero Panel */}
      <div className="obsidian-card p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left: Risk Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-[#0D1219] border border-white/5 p-6 text-center">
            <RiskGauge score={report.riskScore} size={160} strokeWidth={11} />
            <div className="mt-4">
              <StatusBadge status={report.riskLevel} size="md" />
            </div>
            <p className="mt-2 font-mono text-[11px] text-[#687586]">
              Calibrated Zero-Trust Metric
            </p>
          </div>

          {/* Right: Target & Verdict */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-lg bg-[#111923] border border-white/5 px-2.5 py-1 font-mono text-[#A0AAB8]">
                <TypeIcon className="h-3.5 w-3.5 text-[[var(--theme-primary)]]" />
                <span className="uppercase">{report.analysisType}</span>
              </span>
              <span className="font-mono text-[#687586]">
                {formatTimestamp(report.createdAt)}
              </span>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0D1219] p-3.5 font-mono text-xs text-[#F4F7FA] break-all">
              {report.inputSummary}
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#F4F7FA]">
              {report.verdict}
            </h2>

            <p className="text-sm text-[#A0AAB8] leading-relaxed">
              {report.summary}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#687586]">
              <span>Confidence: <strong className="text-[#F4F7FA]">{report.confidence.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Engine: <strong className="text-[[var(--theme-primary)]]">{report.metadata.engineLabel}</strong></span>
              <span>•</span>
              <span>Latency: <strong className="text-[#F4F7FA]">{formatDuration(report.durationMs)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Threats & Evidence Section */}
      {report.detectedThreats.length > 0 && (
        <div className="obsidian-card p-6 space-y-4">
          <h3 className="font-heading text-base font-semibold text-[#F4F7FA] flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#FF4D5E]" />
            <span>Detected Threat Indicators ({report.detectedThreats.length})</span>
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {report.detectedThreats.map((threat, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-[#0D1219] p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F4F7FA]">{threat.type}</span>
                  <StatusBadge status={threat.severity} size="sm" />
                </div>
                <p className="text-[#A0AAB8]">{threat.explanation}</p>
                <div className="rounded-lg bg-[#111923] p-2 font-mono text-[11px] text-[#687586]">
                  Evidence: {threat.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="obsidian-card p-6 space-y-3">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[[var(--theme-primary)]] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Forensic Recommendations</span>
        </h3>
        <ul className="space-y-2 text-xs text-[#A0AAB8]">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-mono text-[[var(--theme-primary)]] font-bold">{i + 1}.</span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-16 text-center text-xs text-[#687586]">
            Loading forensic dossier...
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </PageShell>
  );
}
