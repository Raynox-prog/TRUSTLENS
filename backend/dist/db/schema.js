import { pgTable, uuid, text, integer, jsonb, timestamp, index, } from "drizzle-orm/pg-core";
export const analysisReports = pgTable("analysis_reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    analysisType: text("analysis_type").notNull(), // 'text' | 'image' | 'url'
    inputSummary: text("input_summary").notNull(),
    riskScore: integer("risk_score").notNull(),
    riskLevel: text("risk_level").notNull(), // 'low' | 'moderate' | 'high' | 'critical'
    verdict: text("verdict").notNull(),
    summary: text("summary").notNull(),
    detectedThreats: jsonb("detected_threats")
        .$type()
        .notNull(),
    recommendations: jsonb("recommendations").$type().notNull(),
    confidence: text("confidence").notNull(), // 'low' | 'medium' | 'high'
    limitations: jsonb("limitations").$type().notNull(),
    metadata: jsonb("metadata").$type().notNull(),
    durationMs: integer("duration_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => [
    index("analysis_reports_created_at_idx").on(table.createdAt),
    index("analysis_reports_risk_level_idx").on(table.riskLevel),
    index("analysis_reports_type_idx").on(table.analysisType),
]);
