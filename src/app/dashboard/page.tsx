"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Download,
  ExternalLink,
  Filter,
  Globe,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareText,
  Radar,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState, SkeletonCard } from "@/components/shared/loading-state";
import {
  type AnalysisReportDTO,
  type AnalysisType,
  type RiskLevel,
} from "@/lib/types";
import { cn, formatTimestamp } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

interface DashboardResponse {
  totalAnalyses: number;
  highAndCriticalCount: number;
  averageRiskScore: number;
  riskDistribution: Record<RiskLevel, number>;
  typeDistribution: Record<AnalysisType, number>;
  highRiskItems: AnalysisReportDTO[];
  recentReports: AnalysisReportDTO[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | AnalysisType>("all");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [sortBy, setSortBy] = useState<"date" | "risk">("date");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingClearAll, setConfirmingClearAll] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchDashboardPayload = useCallback(async () => {
    const res = await fetch(getApiUrl("/api/reports"), { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load security telemetry.");
    }
    return json as DashboardResponse;
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchDashboardPayload();
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error loading security telemetry."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardPayload]);

  useEffect(() => {
    let active = true;
    fetchDashboardPayload()
      .then((payload) => {
        if (active) {
          setData(payload);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Network error loading security telemetry."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchDashboardPayload]);

  async function handleDeleteOne(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(
        getApiUrl(`/api/reports/${encodeURIComponent(id)}`),
        { method: "DELETE" }
      );
      if (res.ok) {
        await loadDashboard();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleClearAll() {
    setConfirmingClearAll(false);
    setLoading(true);
    try {
      await fetch(getApiUrl("/api/reports"), { method: "DELETE" });
      await loadDashboard();
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(getApiUrl("/api/report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `averon-threat-report-${id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusyId(null);
    }
  }

  // Filtered & Sorted Scans
  const filteredReports = useMemo(() => {
    if (!data?.recentReports) return [];
    let list = data.recentReports.filter((r) => {
      if (typeFilter !== "all" && r.analysisType !== typeFilter) return false;
      if (riskFilter !== "all" && r.riskLevel !== riskFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesSummary = r.inputSummary.toLowerCase().includes(query);
        const matchesVerdict = r.verdict.toLowerCase().includes(query);
        const matchesId = r.id.toLowerCase().includes(query);
        if (!matchesSummary && !matchesVerdict && !matchesId) return false;
      }
      return true;
    });

    if (sortBy === "risk") {
      list = [...list].sort((a, b) => b.riskScore - a.riskScore);
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [data, search, typeFilter, riskFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, page, pageSize]);

  // Derived real stats
  const totalScans = data?.totalAnalyses ?? 0;
  const safeCount = data?.riskDistribution?.low ?? 0;
  const suspiciousCount = data?.riskDistribution?.moderate ?? 0;
  const criticalCount = (data?.riskDistribution?.critical ?? 0) + (data?.riskDistribution?.high ?? 0);
  const avgScore = data?.averageRiskScore ?? 0;

  // Flattened Threat Activity items
  const recentThreats = useMemo(() => {
    if (!data?.recentReports) return [];
    const threats: Array<{
      id: string;
      reportId: string;
      threatName: string;
      domain: string;
      severity: string;
      timestamp: string;
      verdict: string;
    }> = [];

    for (const report of data.recentReports) {
      if (report.detectedThreats && report.detectedThreats.length > 0) {
        for (const t of report.detectedThreats) {
          threats.push({
            id: `${report.id}-${t.type}`,
            reportId: report.id,
            threatName: t.type,
            domain: report.inputSummary,
            severity: t.severity,
            timestamp: report.createdAt,
            verdict: report.verdict,
          });
        }
      } else if (report.riskScore >= 50) {
        threats.push({
          id: `${report.id}-highrisk`,
          reportId: report.id,
          threatName: "Suspicious Domain / Elevated Risk",
          domain: report.inputSummary,
          severity: report.riskLevel,
          timestamp: report.createdAt,
          verdict: report.verdict,
        });
      }
    }
    return threats.slice(0, 5);
  }, [data]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Dashboard Heading & Status */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[[var(--theme-primary)]] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[[var(--theme-primary)]]" />
              </span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[[var(--theme-primary)]]">
                Telemetry Command Center
              </span>
            </div>
            <h1 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-[#F4F7FA] sm:text-3xl">
              Security Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A0AAB8]">
              Monitor threats, analyse suspicious URLs and track your zero-trust security activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-3.5 py-2 text-xs font-medium text-[#F4F7FA] transition-colors hover:border-white/20 hover:bg-[#141E29] disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-[[var(--theme-primary)]]")} />
              <span>Refresh</span>
            </button>

            <Link
              href="/website-checker"
              className="inline-flex items-center gap-2 rounded-xl border border-[[var(--theme-primary)]]/40 bg-[[var(--theme-primary)]]/15 px-4 py-2 text-xs font-semibold text-[[var(--theme-primary)]] shadow-[0_0_20px_rgba(var(--theme-primary-rgb), )] transition-all hover:bg-[[var(--theme-primary)]]/25 hover:border-[[var(--theme-primary)]]/60"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>New URL Scan</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 p-4 text-xs text-[#FF4D5E] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadDashboard}
              className="font-medium underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Statistics Cards (PRD Section 9) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total URLs Scanned */}
          <div className="obsidian-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A0AAB8]">Total Scans</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111923] border border-white/5 text-[#63A9FF]">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#F4F7FA]">
                {loading ? "..." : totalScans}
              </div>
              <p className="mt-1 text-[11px] text-[#687586]">
                Inspected via multi-stage zero trust
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#63A9FF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* 2. Safe URLs */}
          <div className="obsidian-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A0AAB8]">Safe Clean URLs</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#28D99A]/10 border border-[#28D99A]/20 text-[#28D99A]">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#28D99A]">
                {loading ? "..." : safeCount}
              </div>
              <p className="mt-1 text-[11px] text-[#687586]">
                Verified clean domain signatures
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#28D99A]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* 3. Suspicious URLs */}
          <div className="obsidian-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A0AAB8]">Suspicious URLs</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4BD50]/10 border border-[#F4BD50]/20 text-[#F4BD50]">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#F4BD50]">
                {loading ? "..." : suspiciousCount}
              </div>
              <p className="mt-1 text-[11px] text-[#687586]">
                Moderate risk or deceptive indicators
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#F4BD50]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* 4. Critical Threats */}
          <div className="obsidian-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A0AAB8]">Critical Threats</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4D5E]/10 border border-[#FF4D5E]/20 text-[#FF4D5E]">
                <ShieldX className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#FF4D5E]">
                {loading ? "..." : criticalCount}
              </div>
              <p className="mt-1 text-[11px] text-[#687586]">
                High-confidence phishing or malware
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF4D5E]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Section: Risk Distribution & Threat Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Risk Distribution Chart (PRD Section 9) */}
          <div className="obsidian-card p-6 lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#F4F7FA]">
                  Risk Distribution
                </h3>
                <p className="text-[11px] text-[#687586]">
                  Calibrated score categorisation across scans
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-[[var(--theme-primary)]]">
                Avg: {Math.round(avgScore)}/100
              </span>
            </div>

            {totalScans === 0 ? (
              <EmptyState
                icon={Shield}
                title="No Distribution Data"
                description="Run your first URL scan to populate risk distribution analysis."
              />
            ) : (
              <div className="space-y-4">
                {/* Horizontal Segmented Bar */}
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#0D1219] p-0.5 border border-white/5">
                  <div
                    style={{
                      width: `${totalScans ? (safeCount / totalScans) * 100 : 0}%`,
                    }}
                    title={`Safe: ${safeCount}`}
                    className="bg-[#28D99A] rounded-l-full transition-all duration-500"
                  />
                  <div
                    style={{
                      width: `${
                        totalScans
                          ? ((data?.riskDistribution?.moderate ?? 0) / totalScans) * 100
                          : 0
                      }%`,
                    }}
                    title={`Moderate: ${suspiciousCount}`}
                    className="bg-[#F4BD50] transition-all duration-500"
                  />
                  <div
                    style={{
                      width: `${
                        totalScans
                          ? ((data?.riskDistribution?.high ?? 0) / totalScans) * 100
                          : 0
                      }%`,
                    }}
                    title={`High: ${data?.riskDistribution?.high ?? 0}`}
                    className="bg-[#FF8A4C] transition-all duration-500"
                  />
                  <div
                    style={{
                      width: `${
                        totalScans
                          ? ((data?.riskDistribution?.critical ?? 0) / totalScans) * 100
                          : 0
                      }%`,
                    }}
                    title={`Critical: ${data?.riskDistribution?.critical ?? 0}`}
                    className="bg-[#FF4D5E] rounded-r-full transition-all duration-500"
                  />
                </div>

                {/* Categorized Metric Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#28D99A]" />
                      <span className="text-[#A0AAB8]">Safe (0–29)</span>
                    </div>
                    <span className="font-mono font-medium text-[#F4F7FA]">
                      {safeCount} ({totalScans ? Math.round((safeCount / totalScans) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#F4BD50]" />
                      <span className="text-[#A0AAB8]">Moderate (30–64)</span>
                    </div>
                    <span className="font-mono font-medium text-[#F4F7FA]">
                      {suspiciousCount} ({totalScans ? Math.round((suspiciousCount / totalScans) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF8A4C]" />
                      <span className="text-[#A0AAB8]">High Risk (65–84)</span>
                    </div>
                    <span className="font-mono font-medium text-[#F4F7FA]">
                      {data?.riskDistribution?.high ?? 0} (
                      {totalScans
                        ? Math.round(((data?.riskDistribution?.high ?? 0) / totalScans) * 100)
                        : 0}
                      %)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF4D5E]" />
                      <span className="text-[#A0AAB8]">Critical (85–100)</span>
                    </div>
                    <span className="font-mono font-medium text-[#FF4D5E]">
                      {data?.riskDistribution?.critical ?? 0} (
                      {totalScans
                        ? Math.round(
                            ((data?.riskDistribution?.critical ?? 0) / totalScans) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Threat Activity Section (PRD Section 9) */}
          <div className="obsidian-card p-6 lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#F4F7FA]">
                  Recent Threat Detections
                </h3>
                <p className="text-[11px] text-[#687586]">
                  Actionable telemetry flagged by heuristics and AI engines
                </p>
              </div>
              <Link
                href="/intelligence"
                className="text-xs font-mono text-[[var(--theme-primary)]] hover:underline flex items-center gap-1"
              >
                <span>Intelligence Feed</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentThreats.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Zero Active Threats"
                description="No elevated threats or phishing attempts detected in your recent scans."
              />
            ) : (
              <div className="space-y-2.5">
                {recentThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-white/5 bg-[#0D1219] p-3 text-xs transition-colors hover:border-white/10"
                  >
                    <div className="space-y-0.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F4F7FA]">
                          {threat.threatName}
                        </span>
                        <StatusBadge status={threat.severity} size="sm" />
                      </div>
                      <p className="font-mono text-[11px] text-[#687586] truncate">
                        {threat.domain}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-[#A0AAB8]">
                      <span>{formatTimestamp(threat.timestamp)}</span>
                      <Link
                        href={`/results?id=${encodeURIComponent(threat.reportId)}`}
                        className="inline-flex items-center gap-1 text-[[var(--theme-primary)]] hover:underline font-mono"
                      >
                        <span>Report</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans Table Section (PRD Section 9) */}
        <div className="obsidian-card p-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="font-heading text-base font-semibold text-[#F4F7FA]">
                Recent Threat Scans
              </h3>
              <p className="text-xs text-[#687586]">
                Inspected URLs and zero-trust evaluation audit trail
              </p>
            </div>

            {data && data.recentReports.length > 0 && (
              <div className="flex items-center gap-2">
                {confirmingClearAll ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#FF4D5E]">Confirm purge?</span>
                    <button
                      onClick={handleClearAll}
                      className="rounded-lg bg-[#FF4D5E] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#FF4D5E]/80"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setConfirmingClearAll(false)}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-[#A0AAB8] hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingClearAll(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111923] px-3 py-1.5 text-xs text-[#A0AAB8] hover:text-[#FF4D5E] hover:border-[#FF4D5E]/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Scans</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Filters & Search */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#687586]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search scans by URL, domain, or verdict..."
                className="w-full rounded-xl border border-white/10 bg-[#0D1219] py-2 pl-9 pr-3 font-mono text-xs text-[#F4F7FA] placeholder-[#687586] focus:border-[[var(--theme-primary)]] focus:outline-none focus:ring-1 focus:ring-[[var(--theme-primary)]]/40"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="rounded-xl border border-white/10 bg-[#0D1219] px-3 py-2 text-xs text-[#F4F7FA] focus:border-[[var(--theme-primary)]] focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="url">URL Scans</option>
                <option value="text">Text Messages</option>
                <option value="image">Screenshots</option>
              </select>

              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value as any);
                  setPage(1);
                }}
                className="rounded-xl border border-white/10 bg-[#0D1219] px-3 py-2 text-xs text-[#F4F7FA] focus:border-[[var(--theme-primary)]] focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="low">Safe (Low)</option>
                <option value="moderate">Moderate</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-white/10 bg-[#0D1219] px-3 py-2 text-xs text-[#F4F7FA] focus:border-[[var(--theme-primary)]] focus:outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="risk">Sort by Risk Score</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <LoadingState label="Loading audit telemetry..." />
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No Matching Scans"
              description={
                search || typeFilter !== "all" || riskFilter !== "all"
                  ? "Try resetting your search query or filters."
                  : "No URL investigations have been executed yet. Enter a URL above to run your first zero-trust scan."
              }
              action={
                <Link
                  href="/website-checker"
                  className="inline-flex items-center gap-2 rounded-xl bg-[[var(--theme-primary)]] px-4 py-2 text-xs font-semibold text-[#080B10] hover:bg-[[var(--theme-primary)]]/90 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>Scan Suspicious URL</span>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D1219] text-[#687586] border-b border-white/5 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">URL / Target</th>
                    <th className="py-3 px-3">Risk Score</th>
                    <th className="py-3 px-3">Threat Level</th>
                    <th className="py-3 px-3">Engine Verdict</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedReports.map((report) => {
                    const isBusy = busyId === report.id;

                    return (
                      <tr
                        key={report.id}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono">
                          <Link
                            href={`/results?id=${encodeURIComponent(report.id)}`}
                            className="font-medium text-[#F4F7FA] hover:text-[[var(--theme-primary)]] transition-colors flex items-center gap-2 max-w-sm sm:max-w-md truncate"
                          >
                            {report.analysisType === "url" ? (
                              <Globe className="h-3.5 w-3.5 shrink-0 text-[#63A9FF]" />
                            ) : report.analysisType === "image" ? (
                              <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[[var(--theme-primary)]]" />
                            ) : (
                              <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-[#F4BD50]" />
                            )}
                            <span className="truncate">{report.inputSummary}</span>
                          </Link>
                        </td>

                        <td className="py-3.5 px-3 font-mono">
                          <span
                            className={cn(
                              "font-bold",
                              report.riskScore >= 75
                                ? "text-[#FF4D5E]"
                                : report.riskScore >= 45
                                ? "text-[#F4BD50]"
                                : "text-[#28D99A]"
                            )}
                          >
                            {report.riskScore}/100
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <StatusBadge status={report.riskLevel} size="sm" />
                        </td>

                        <td className="py-3.5 px-3 text-[#A0AAB8] max-w-xs truncate">
                          {report.verdict}
                        </td>

                        <td className="py-3.5 px-3 text-[#687586] font-mono text-[11px] whitespace-nowrap">
                          {formatTimestamp(report.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/results?id=${encodeURIComponent(report.id)}`}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-white/5 bg-[#111923] px-2.5 text-[11px] font-medium text-[#F4F7FA] hover:border-[[var(--theme-primary)]]/40 hover:text-[[var(--theme-primary)]] transition-colors"
                              title="View Full Report"
                            >
                              <span>Report</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(report.id)}
                              disabled={isBusy}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-[#111923] text-[#A0AAB8] hover:text-[[var(--theme-primary)]] hover:border-white/10 transition-colors disabled:opacity-50"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteOne(report.id)}
                              disabled={isBusy}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-[#111923] text-[#A0AAB8] hover:text-[#FF4D5E] hover:border-[#FF4D5E]/30 transition-colors disabled:opacity-50"
                              title="Delete Scan Record"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-[#A0AAB8]">
              <span>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, filteredReports.length)} of{" "}
                {filteredReports.length} scans
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 bg-[#0D1219] px-3 py-1.5 text-xs text-[#F4F7FA] hover:bg-white/5 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-mono text-xs">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/10 bg-[#0D1219] px-3 py-1.5 text-xs text-[#F4F7FA] hover:bg-white/5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
