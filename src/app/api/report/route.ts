import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getReportById } from "@/lib/reports-repo";
import { generateReportPdfBuffer } from "@/lib/pdf-generator";
import {
  AnalysisTypeSchema,
  ConfidenceSchema,
  DetectedThreatSchema,
  RiskLevelSchema,
  type AnalysisReportDTO,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const InlineReportSchema = z.object({
  id: z.string().min(1).max(100).default("unsaved"),
  analysisType: AnalysisTypeSchema,
  inputSummary: z.string().min(1).max(500),
  riskLevel: RiskLevelSchema,
  riskScore: z.number().int().min(0).max(100),
  verdict: z.string().min(1).max(400),
  summary: z.string().min(1).max(2000),
  detectedThreats: z.array(DetectedThreatSchema).max(25),
  recommendations: z.array(z.string().min(1).max(500)).max(15),
  confidence: ConfidenceSchema,
  limitations: z.array(z.string().min(1).max(500)).max(15),
  durationMs: z.number().int().min(0).default(0),
  createdAt: z.string().optional(),
  metadata: z
    .object({
      engineLabel: z.string().default("SHIELDLY Analysis Engine"),
      aiProviderUsed: z
        .enum(["gemini", "openai", "heuristic-only"])
        .default("heuristic-only"),
      aiModel: z.string().nullable().default(null),
      aiFallbackReason: z.string().nullable().default(null),
      externalReputationChecked: z.boolean().default(false),
    })
    .optional(),
});

const ReportRequestSchema = z.union([
  z.object({ reportId: z.string().uuid() }),
  z.object({ report: InlineReportSchema }),
]);

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "pdf-report", 30, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      { status: "error", error: "Too many PDF requests. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = ReportRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", error: "Provide a valid reportId or report object." },
      { status: 400 }
    );
  }

  try {
    let report: AnalysisReportDTO | null = null;
    if ("reportId" in parsed.data) {
      report = await getReportById(parsed.data.reportId);
      if (!report) {
        return NextResponse.json(
          { status: "error", error: "Report not found." },
          { status: 404 }
        );
      }
    } else {
      const inline = parsed.data.report;
      report = {
        id: inline.id,
        status: "success",
        analysisType: inline.analysisType,
        inputSummary: inline.inputSummary,
        riskLevel: inline.riskLevel,
        riskScore: inline.riskScore,
        verdict: inline.verdict,
        summary: inline.summary,
        detectedThreats: inline.detectedThreats,
        recommendations: inline.recommendations,
        confidence: inline.confidence,
        limitations: inline.limitations,
        durationMs: inline.durationMs,
        createdAt: inline.createdAt ?? new Date().toISOString(),
        metadata: inline.metadata ?? {
          engineLabel: "SHIELDLY Analysis Engine",
          aiProviderUsed: "heuristic-only",
          aiModel: null,
          aiFallbackReason: null,
          externalReputationChecked: false,
        },
      };
    }

    const pdfBytes = await generateReportPdfBuffer(report);
    const shortId = report.id.slice(0, 8).replace(/[^a-zA-Z0-9-]/g, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="shieldly-report-${shortId || "analysis"}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Failed to generate PDF report." },
      { status: 500 }
    );
  }
}
