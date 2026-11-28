"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatDuration = formatDuration;
exports.formatTimestamp = formatTimestamp;
exports.formatBytes = formatBytes;
exports.buildPlainTextReport = buildPlainTextReport;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
const types_1 = require("./types");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
function formatTimestamp(iso) {
    try {
        return new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(iso));
    }
    catch {
        return iso;
    }
}
function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function buildPlainTextReport(report) {
    const lines = [
        "============================================================",
        "SHIELDLY — CYBERSECURITY INVESTIGATION REPORT",
        "Think Before You Click.",
        "============================================================",
        `Report ID:      ${report.id}`,
        `Analysis Type:  ${report.analysisType.toUpperCase()}`,
        `Timestamp:      ${formatTimestamp(report.createdAt)}`,
        `Analysis Time:  ${formatDuration(report.durationMs)}`,
        `Engine:         ${report.metadata.engineLabel}`,
        `Risk Score:     ${report.riskScore} / 100 (${(0, types_1.riskLevelLabel)(report.riskLevel).toUpperCase()})`,
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
        lines.push("No specific threat signatures were triggered. Note: absence of warning signs does not automatically verify legitimacy.");
    }
    else {
        report.detectedThreats.forEach((t, idx) => {
            lines.push(`${idx + 1}. [${t.severity.toUpperCase()}] ${t.type}`, `   Evidence:    ${t.evidence}`, `   Explanation: ${t.explanation}`, "");
        });
    }
    lines.push("RECOMMENDED ACTIONS", "------------------------------------------------------------");
    report.recommendations.forEach((rec, idx) => {
        lines.push(`${idx + 1}. ${rec}`);
    });
    if (report.limitations.length > 0) {
        lines.push("", "LIMITATIONS & TRANSPARENCY NOTES", "------------------------------------------------------------");
        report.limitations.forEach((lim) => lines.push(`- ${lim}`));
    }
    return lines.join("\n");
}
