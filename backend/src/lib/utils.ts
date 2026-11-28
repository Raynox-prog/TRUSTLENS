import { type AnalysisReportDTO, type DetectedThreat, riskLevelLabel } from "./types.js";

export function cn(...inputs: any[]): string {
  return inputs.flat().filter(Boolean).join(" ");
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildPlainTextReport(report: AnalysisReportDTO): string {
  const lines: string[] = [
    "============================================================",
    "AVERON AI — CYBERSECURITY INVESTIGATION REPORT",
    "Think Before You Click.",
    "============================================================",
    `Report ID:      ${report.id}`,
    `Analysis Type:  ${report.analysisType.toUpperCase()}`,
    `Timestamp:      ${formatTimestamp(report.createdAt)}`,
    `Analysis Time:  ${formatDuration(report.durationMs)}`,
    `Engine:         ${report.metadata.engineLabel}`,
    `Risk Score:     ${report.riskScore} / 100 (${riskLevelLabel(report.riskLevel).toUpperCase()})`,
    `Confidence:     ${report.confidence.toUpperCase()}`,
    "",
    "VERDICT",
    "------------------------------------------------------------",
    report.verdict,
    "",
    "SUMMARY",
    "------------------------------------------------------------",
    report.summary,
    "",
    "SUBMITTED ITEM PREVIEW",
    "------------------------------------------------------------",
    report.inputSummary,
    "",
    `DETECTED THREATS (${report.detectedThreats.length})`,
    "------------------------------------------------------------",
  ];

  if (report.detectedThreats.length === 0) {
    lines.push(
      "No specific threat signatures were triggered. Note: absence of warning signs does not automatically verify legitimacy."
    );
  } else {
    report.detectedThreats.forEach((t: DetectedThreat, idx: number) => {
      lines.push(
        `${idx + 1}. [${t.severity.toUpperCase()}] ${t.type}`,
        `   Evidence:    ${t.evidence}`,
        `   Explanation: ${t.explanation}`,
        ""
      );
    });
  }

  lines.push("RECOMMENDED ACTIONS", "------------------------------------------------------------");
  report.recommendations.forEach((rec: string, idx: number) => {
    lines.push(`${idx + 1}. ${rec}`);
  });

  if (report.limitations.length > 0) {
    lines.push("", "LIMITATIONS & TRANSPARENCY NOTES", "------------------------------------------------------------");
    report.limitations.forEach((lim: string) => lines.push(`- ${lim}`));
  }

  return lines.join("\n");
}
