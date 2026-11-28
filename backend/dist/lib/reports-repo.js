"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rowToReportDTO = rowToReportDTO;
exports.saveAnalysisReport = saveAnalysisReport;
exports.getReportById = getReportById;
exports.getLatestReport = getLatestReport;
exports.deleteReportById = deleteReportById;
exports.deleteAllReports = deleteAllReports;
exports.getDashboardData = getDashboardData;
const node_crypto_1 = require("node:crypto");
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
// In-Memory store fallback
const memoryStore = new Map();
let isPostgresAvailable = null;
let schemaReadyPromise = null;
async function checkPostgres() {
    if (isPostgresAvailable !== null)
        return isPostgresAvailable;
    const url = process.env.DATABASE_URL?.trim();
    if (!url) {
        isPostgresAvailable = false;
        return false;
    }
    try {
        const client = await db_1.pool.connect();
        client.release();
        isPostgresAvailable = true;
        return true;
    }
    catch (err) {
        console.warn("[SHIELDLY Backend] PostgreSQL not reachable. Operating in memory-store mode.");
        isPostgresAvailable = false;
        return false;
    }
}
async function ensureReportsTable() {
    const pgOk = await checkPostgres();
    if (!pgOk)
        return;
    if (!schemaReadyPromise) {
        schemaReadyPromise = (async () => {
            await db_1.db.execute((0, drizzle_orm_1.sql) `
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
            await db_1.db.execute((0, drizzle_orm_1.sql) `CREATE INDEX IF NOT EXISTS analysis_reports_created_at_idx ON analysis_reports (created_at)`);
            await db_1.db.execute((0, drizzle_orm_1.sql) `CREATE INDEX IF NOT EXISTS analysis_reports_risk_level_idx ON analysis_reports (risk_level)`);
            await db_1.db.execute((0, drizzle_orm_1.sql) `CREATE INDEX IF NOT EXISTS analysis_reports_type_idx ON analysis_reports (analysis_type)`);
        })().catch((err) => {
            console.error("[SHIELDLY Backend] Failed to initialize table schema:", err);
            isPostgresAvailable = false;
        });
    }
    await schemaReadyPromise;
}
function rowToReportDTO(row) {
    return {
        id: row.id,
        status: "success",
        analysisType: row.analysisType,
        inputSummary: row.inputSummary,
        riskLevel: row.riskLevel,
        riskScore: row.riskScore,
        verdict: row.verdict,
        summary: row.summary,
        detectedThreats: row.detectedThreats,
        recommendations: row.recommendations,
        confidence: row.confidence,
        limitations: row.limitations,
        metadata: row.metadata,
        durationMs: row.durationMs,
        createdAt: row.createdAt.toISOString(),
    };
}
async function saveAnalysisReport(params) {
    const pgOk = await checkPostgres();
    if (pgOk) {
        try {
            await ensureReportsTable();
            const [inserted] = await db_1.db
                .insert(schema_1.analysisReports)
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
        }
        catch (err) {
            console.warn("[SHIELDLY Backend] Postgres insert failed, falling back to memory:", err);
        }
    }
    // Memory fallback
    const reportId = (0, node_crypto_1.randomUUID)();
    const dto = {
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
        if (oldestKey)
            memoryStore.delete(oldestKey);
    }
    return dto;
}
async function getReportById(id) {
    // Check memory first
    if (memoryStore.has(id)) {
        return memoryStore.get(id);
    }
    const pgOk = await checkPostgres();
    if (pgOk) {
        try {
            await ensureReportsTable();
            const rows = await db_1.db
                .select()
                .from(schema_1.analysisReports)
                .where((0, drizzle_orm_1.eq)(schema_1.analysisReports.id, id))
                .limit(1);
            if (rows.length > 0) {
                const dto = rowToReportDTO(rows[0]);
                memoryStore.set(dto.id, dto);
                return dto;
            }
        }
        catch {
            // Ignored
        }
    }
    return null;
}
async function getLatestReport() {
    const pgOk = await checkPostgres();
    if (pgOk) {
        try {
            await ensureReportsTable();
            const rows = await db_1.db
                .select()
                .from(schema_1.analysisReports)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.analysisReports.createdAt))
                .limit(1);
            if (rows.length > 0) {
                return rowToReportDTO(rows[0]);
            }
        }
        catch {
            // Fall through to memory
        }
    }
    if (memoryStore.size > 0) {
        const reports = Array.from(memoryStore.values());
        reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return reports[0] ?? null;
    }
    return null;
}
async function deleteReportById(id) {
    let deletedFromMem = memoryStore.delete(id);
    const pgOk = await checkPostgres();
    if (pgOk) {
        try {
            await ensureReportsTable();
            const deleted = await db_1.db
                .delete(schema_1.analysisReports)
                .where((0, drizzle_orm_1.eq)(schema_1.analysisReports.id, id))
                .returning({ id: schema_1.analysisReports.id });
            return deleted.length > 0 || deletedFromMem;
        }
        catch {
            return deletedFromMem;
        }
    }
    return deletedFromMem;
}
async function deleteAllReports() {
    const count = memoryStore.size;
    memoryStore.clear();
    const pgOk = await checkPostgres();
    if (pgOk) {
        try {
            await ensureReportsTable();
            const deleted = await db_1.db
                .delete(schema_1.analysisReports)
                .returning({ id: schema_1.analysisReports.id });
            return Math.max(deleted.length, count);
        }
        catch {
            return count;
        }
    }
    return count;
}
async function getDashboardData(limit = 50) {
    let dtos = [];
    const pgOk = await checkPostgres();
    if (pgOk) {
        try {
            await ensureReportsTable();
            const allRows = await db_1.db
                .select()
                .from(schema_1.analysisReports)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.analysisReports.createdAt))
                .limit(200);
            dtos = allRows.map(rowToReportDTO);
        }
        catch {
            dtos = [];
        }
    }
    if (dtos.length === 0) {
        dtos = Array.from(memoryStore.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const riskDistribution = {
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0,
    };
    const typeDistribution = {
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
