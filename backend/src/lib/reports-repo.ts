import { randomUUID } from "node:crypto";
import { desc, eq, sql } from "drizzle-orm";
import { db, pool } from "../db";
import { analysisReports, type AnalysisReportRow } from "../db/schema";
import type {
  AIOutput,
  AnalysisMetadata,
  AnalysisReportDTO,
  AnalysisType,
  ConfidenceLevel,
  RiskLevel,
} from "./types";

// In-Memory store fallback
const memoryStore = new Map<string, AnalysisReportDTO>();

let isPostgresAvailable: boolean | null = null;
let schemaReadyPromise: Promise<void> | null = null;

async function checkPostgres(): Promise<boolean> {
  if (isPostgresAvailable !== null) return isPostgresAvailable;

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    isPostgresAvailable = false;
    return false;
  }

  try {
    const client = await pool.connect();
    client.release();
    isPostgresAvailable = true;
    return true;
  } catch (err) {
    console.warn(
      "[SHIELDLY Backend] PostgreSQL not reachable. Operating in memory-store mode."
    );
    isPostgresAvailable = false;
    return false;
  }
}

async function ensureReportsTable(): Promise<void> {
  const pgOk = await checkPostgres();
  if (!pgOk) return;

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS analysis_reports (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          analysis_type text NOT NULL,
          input_summary text NOT NULL,
          risk_score integer NOT NULL,
          risk_level text NOT NULL,
          verdict text NOT NULL,
          summary text NOT NULL,
          detected_threats jsonb NOT NULL,
          recommendations jsonb NOT NULL,
          confidence text NOT NULL,
          limitations jsonb NOT NULL,
          metadata jsonb NOT NULL,
          duration_ms integer NOT NULL,
          created_at timestamp with time zone DEFAULT now() NOT NULL
        )
      `);
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS analysis_reports_created_at_idx ON analysis_reports (created_at)`
      );
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS analysis_reports_risk_level_idx ON analysis_reports (risk_level)`
      );
      await db.execute(
        sql`CREATE INDEX IF NOT EXISTS analysis_reports_type_idx ON analysis_reports (analysis_type)`
      );
    })().catch((err) => {
      console.error("[SHIELDLY Backend] Failed to initialize table schema:", err);
      isPostgresAvailable = false;
    });
  }
  await schemaReadyPromise;
}

export function rowToReportDTO(row: AnalysisReportRow): AnalysisReportDTO {
  return {
    id: row.id,
    status: "success",
    analysisType: row.analysisType as AnalysisType,
    inputSummary: row.inputSummary,
    riskLevel: row.riskLevel as RiskLevel,
    riskScore: row.riskScore,
    verdict: row.verdict,
    summary: row.summary,
    detectedThreats: row.detectedThreats,
    recommendations: row.recommendations,
    confidence: row.confidence as ConfidenceLevel,
    limitations: row.limitations,
    metadata: row.metadata,
    durationMs: row.durationMs,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function saveAnalysisReport(params: {
  analysisType: AnalysisType;
  inputSummary: string;
  output: AIOutput;
  metadata: AnalysisMetadata;
  durationMs: number;
}): Promise<AnalysisReportDTO> {
  const pgOk = await checkPostgres();

  if (pgOk) {
    try {
      await ensureReportsTable();
      const [inserted] = await db
        .insert(analysisReports)
        .values({
          analysisType: params.analysisType,
          inputSummary: params.inputSummary.slice(0, 320),
          riskScore: params.output.riskScore,
          riskLevel: params.output.riskLevel,
          verdict: params.output.verdict,
          summary: params.output.summary,
          detectedThreats: params.output.detectedThreats,
          recommendations: params.output.recommendations,
          confidence: params.output.confidence,
          limitations: params.output.limitations,
          metadata: params.metadata,
          durationMs: params.durationMs,
        })
        .returning();

      if (inserted) {
        const dto = rowToReportDTO(inserted);
        memoryStore.set(dto.id, dto);
        return dto;
      }
    } catch (err) {
      console.warn("[SHIELDLY Backend] Postgres insert failed, falling back to memory:", err);
    }
  }

  // Memory fallback
  const reportId = randomUUID();
  const dto: AnalysisReportDTO = {
    id: reportId,
    status: "success",
    analysisType: params.analysisType,
    inputSummary: params.inputSummary.slice(0, 320),
    riskLevel: params.output.riskLevel,
    riskScore: params.output.riskScore,
    verdict: params.output.verdict,
    summary: params.output.summary,
    detectedThreats: params.output.detectedThreats,
    recommendations: params.output.recommendations,
    confidence: params.output.confidence,
    limitations: params.output.limitations,
    metadata: params.metadata,
    durationMs: params.durationMs,
    createdAt: new Date().toISOString(),
  };

  memoryStore.set(reportId, dto);
  if (memoryStore.size > 1000) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey) memoryStore.delete(oldestKey);
  }

  return dto;
}

export async function getReportById(
  id: string
): Promise<AnalysisReportDTO | null> {
  // Check memory first
  if (memoryStore.has(id)) {
    return memoryStore.get(id)!;
  }

  const pgOk = await checkPostgres();
  if (pgOk) {
    try {
      await ensureReportsTable();
      const rows = await db
        .select()
        .from(analysisReports)
        .where(eq(analysisReports.id, id))
        .limit(1);

      if (rows.length > 0) {
        const dto = rowToReportDTO(rows[0]);
        memoryStore.set(dto.id, dto);
        return dto;
      }
    } catch {
      // Ignored
    }
  }

  return null;
}

export async function getLatestReport(): Promise<AnalysisReportDTO | null> {
  const pgOk = await checkPostgres();
  if (pgOk) {
    try {
      await ensureReportsTable();
      const rows = await db
        .select()
        .from(analysisReports)
        .orderBy(desc(analysisReports.createdAt))
        .limit(1);

      if (rows.length > 0) {
        return rowToReportDTO(rows[0]);
      }
    } catch {
      // Fall through to memory
    }
  }

  if (memoryStore.size > 0) {
    const reports = Array.from(memoryStore.values());
    reports.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return reports[0] ?? null;
  }

  return null;
}

export async function deleteReportById(id: string): Promise<boolean> {
  let deletedFromMem = memoryStore.delete(id);

  const pgOk = await checkPostgres();
  if (pgOk) {
    try {
      await ensureReportsTable();
      const deleted = await db
        .delete(analysisReports)
        .where(eq(analysisReports.id, id))
        .returning({ id: analysisReports.id });
      return deleted.length > 0 || deletedFromMem;
    } catch {
      return deletedFromMem;
    }
  }

  return deletedFromMem;
}

export async function deleteAllReports(): Promise<number> {
  const count = memoryStore.size;
  memoryStore.clear();

  const pgOk = await checkPostgres();
  if (pgOk) {
    try {
      await ensureReportsTable();
      const deleted = await db
        .delete(analysisReports)
        .returning({ id: analysisReports.id });
      return Math.max(deleted.length, count);
    } catch {
      return count;
    }
  }

  return count;
}

export interface DashboardData {
  totalAnalyses: number;
  highAndCriticalCount: number;
  averageRiskScore: number;
  riskDistribution: Record<RiskLevel, number>;
  typeDistribution: Record<AnalysisType, number>;
  highRiskItems: AnalysisReportDTO[];
  recentReports: AnalysisReportDTO[];
}

export async function getDashboardData(limit = 50): Promise<DashboardData> {
  let dtos: AnalysisReportDTO[] = [];

  const pgOk = await checkPostgres();
  if (pgOk) {
    try {
      await ensureReportsTable();
      const allRows = await db
        .select()
        .from(analysisReports)
        .orderBy(desc(analysisReports.createdAt))
        .limit(200);
      dtos = allRows.map(rowToReportDTO);
    } catch {
      dtos = [];
    }
  }

  if (dtos.length === 0) {
    dtos = Array.from(memoryStore.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const riskDistribution: Record<RiskLevel, number> = {
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  };

  const typeDistribution: Record<AnalysisType, number> = {
    text: 0,
    image: 0,
    url: 0,
  };

  let scoreSum = 0;
  for (const r of dtos) {
    riskDistribution[r.riskLevel] = (riskDistribution[r.riskLevel] ?? 0) + 1;
    typeDistribution[r.analysisType] =
      (typeDistribution[r.analysisType] ?? 0) + 1;
    scoreSum += r.riskScore;
  }

  const highRiskItems = dtos
    .filter((r) => r.riskLevel === "high" || r.riskLevel === "critical")
    .slice(0, 12);

  return {
    totalAnalyses: dtos.length,
    highAndCriticalCount: riskDistribution.high + riskDistribution.critical,
    averageRiskScore: dtos.length > 0 ? Math.round(scoreSum / dtos.length) : 0,
    riskDistribution,
    typeDistribution,
    highRiskItems,
    recentReports: dtos.slice(0, limit),
  };
}
