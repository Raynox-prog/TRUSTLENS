"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisReports = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.analysisReports = (0, pg_core_1.pgTable)("analysis_reports", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    analysisType: (0, pg_core_1.text)("analysis_type").notNull(), // 'text' | 'image' | 'url'
    inputSummary: (0, pg_core_1.text)("input_summary").notNull(),
    riskScore: (0, pg_core_1.integer)("risk_score").notNull(),
    riskLevel: (0, pg_core_1.text)("risk_level").notNull(), // 'low' | 'moderate' | 'high' | 'critical'
    verdict: (0, pg_core_1.text)("verdict").notNull(),
    summary: (0, pg_core_1.text)("summary").notNull(),
    detectedThreats: (0, pg_core_1.jsonb)("detected_threats")
        .$type()
        .notNull(),
    recommendations: (0, pg_core_1.jsonb)("recommendations").$type().notNull(),
    confidence: (0, pg_core_1.text)("confidence").notNull(), // 'low' | 'medium' | 'high'
    limitations: (0, pg_core_1.jsonb)("limitations").$type().notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata").$type().notNull(),
    durationMs: (0, pg_core_1.integer)("duration_ms").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => [
    (0, pg_core_1.index)("analysis_reports_created_at_idx").on(table.createdAt),
    (0, pg_core_1.index)("analysis_reports_risk_level_idx").on(table.riskLevel),
    (0, pg_core_1.index)("analysis_reports_type_idx").on(table.analysisType),
]);
