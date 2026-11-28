"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Download,
  Trash2,
  Globe,
  Image as ImageIcon,
  MessageSquareText,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Filter,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import {
  type AnalysisReportDTO,
  type AnalysisType,
  type RiskLevel,
} from "@/lib/types";
import { formatTimestamp, cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/api-config";

export default function HistoryPage() {
  const [reports, setReports] = useState<AnalysisReportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | RiskLevel>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AnalysisType>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl("/api/reports"), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch scan history");
      setReports(json.recentReports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scan records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(getApiUrl(`/api/reports/${encodeURIComponent(id)}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (severityFilter !== "all" && r.riskLevel !== severityFilter) return false;
      if (typeFilter !== "all" && r.analysisType !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.inputSummary.toLowerCase().includes(q) ||
          r.verdict.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, severityFilter, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[[var(--theme-primary)]]" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[[var(--theme-primary)]]">
                Audit Records
              </span>
            </div>
            <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-bold text-[#F4F7FA]">
              Scan History & Telemetry Logs
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A0AAB8]">
              Browse, filter and audit all previously evaluated URLs, domains, and security verdicts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadHistory}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111923] px-3.5 py-2 text-xs font-medium text-[#F4F7FA] hover:bg-[#141E29] transition-colors"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-[[var(--theme-primary)]]")} />
              <span>Refresh</span>
            </button>

            <Link
              href="/website-checker"
              className="inline-flex items-center gap-2 rounded-xl border border-[[var(--theme-primary)]]/40 bg-[[var(--theme-primary)]]/15 px-3.5 py-2 text-xs font-semibold text-[[var(--theme-primary)]] hover:bg-[[var(--theme-primary)]]/25 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>New URL Scan</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-[#FF4D5E]/30 bg-[#FF4D5E]/10 p-4 text-xs text-[#FF4D5E] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadHistory} className="underline hover:text-white">
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="obsidian-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#687586]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by URL, domain, or verdict..."
              className="w-full rounded-xl border border-white/10 bg-[#080B10] py-2 pl-9 pr-3 font-mono text-xs text-[#F4F7FA] placeholder-[#687586] focus:border-[[var(--theme-primary)]] focus:outline-none focus:ring-1 focus:ring-[[var(--theme-primary)]]/40"
            />
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value as any);
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-[#080B10] px-3 py-2 text-xs text-[#F4F7FA] focus:border-[[var(--theme-primary)]] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="low">Safe (Low)</option>
              <option value="moderate">Moderate</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-[#080B10] px-3 py-2 text-xs text-[#F4F7FA] focus:border-[[var(--theme-primary)]] focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="url">URLs Only</option>
              <option value="text">Text Messages</option>
              <option value="image">Screenshots</option>
            </select>
          </div>
        </div>

        {/* Results List / Grid */}
        {loading ? (
          <LoadingState label="Loading audit trail..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Scan History Found"
            description={
              search || severityFilter !== "all"
                ? "No scans match your current filter criteria."
                : "Your zero-trust scan history is currently empty. Run your first URL inspection to populate this log."
            }
            action={
              <Link
                href="/website-checker"
                className="inline-flex items-center gap-2 rounded-xl bg-[[var(--theme-primary)]] px-4 py-2 text-xs font-semibold text-[#080B10] hover:bg-[[var(--theme-primary)]]/90"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Scan a Website</span>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((report) => (
                <div
                  key={report.id}
                  className="obsidian-card p-4 space-y-3 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={report.riskLevel} size="sm" />
                      <span className="font-mono text-xs font-bold text-[#F4F7FA]">
                        {report.riskScore}/100
                      </span>
                    </div>

                    <Link
                      href={`/results?id=${encodeURIComponent(report.id)}`}
                      className="font-mono text-xs font-medium text-[#F4F7FA] hover:text-[[var(--theme-primary)]] transition-colors line-clamp-1 block"
                      title={report.inputSummary}
                    >
                      {report.inputSummary}
                    </Link>

                    <p className="text-xs text-[#A0AAB8] line-clamp-2">
                      {report.verdict}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#687586]">
                    <span>{formatTimestamp(report.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/results?id=${encodeURIComponent(report.id)}`}
                        className="text-[[var(--theme-primary)]] hover:underline flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(report.id)}
                        disabled={busyId === report.id}
                        className="text-[#687586] hover:text-[#FF4D5E] transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-[#A0AAB8]">
                <span>
                  Page {page} of {totalPages} ({filtered.length} total records)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-white/10 px-3 py-1.5 hover:bg-white/5 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
