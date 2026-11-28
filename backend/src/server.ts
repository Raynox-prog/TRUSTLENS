import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import { z } from "zod";
import { checkExpressRateLimit } from "./lib/rate-limit";
import { normalizeAndValidatePublicUrl } from "./lib/ssrf";
import {
  analyzeUrlWithAI,
  analyzeTextWithAI,
  analyzeImageWithAI,
  getServerCapabilities,
} from "./lib/ai-service";
import {
  MAX_IMAGE_BYTES,
  validateUploadedImage,
} from "./lib/image-validator";
import {
  saveAnalysisReport,
  getReportById,
  getLatestReport,
  deleteReportById,
  deleteAllReports,
  getDashboardData,
} from "./lib/reports-repo";
import { generateReportPdfBuffer } from "./lib/pdf-generator";
import {
  AnalysisTypeSchema,
  ConfidenceSchema,
  DetectedThreatSchema,
  RiskLevelSchema,
  type AnalysisReportDTO,
} from "./lib/types";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies (Render, Cloudflare, etc.)
app.set("trust proxy", 1);

// Configure CORS
const allowedOrigins = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins === "*" || !origin) {
        callback(null, true);
      } else {
        const list = allowedOrigins.split(",").map((o) => o.trim());
        if (list.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive default to allow Vercel previews & custom domains
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Configure multer for screenshot uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
  },
});

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

// ─── Health & Capabilities ───────────────────────────────────────────────────

app.get(["/", "/health", "/api/health"], (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "SHIELDLY AI Backend API",
    version: "2.0.0",
    engine: "Zero-Trust Threat Defense Engine",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/status", (_req: Request, res: Response) => {
  const capabilities = getServerCapabilities();
  res.json({
    status: "success",
    capabilities,
  });
});

// ─── POST /api/analyze/url ───────────────────────────────────────────────────

const UrlRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(4, "Please enter a website URL to inspect.")
    .max(2048, "URL exceeds maximum length of 2048 characters."),
});

app.post("/api/analyze/url", async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const rate = checkExpressRateLimit(ip, "analyze-url", 30, 60_000);
  if (!rate.allowed) {
    res.status(429).json({
      status: "error",
      error: "Rate limit exceeded. Please wait before checking another URL.",
    });
    return;
  }

  const parsed = UrlRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Invalid URL input.",
    });
    return;
  }

  const validated = normalizeAndValidatePublicUrl(parsed.data.url);
  if (!validated.ok) {
    res.status(400).json({
      status: "error",
      error: validated.error,
    });
    return;
  }

  const startedAt = Date.now();
  try {
    const { output, metadata } = await analyzeUrlWithAI(
      parsed.data.url,
      validated.url
    );
    const durationMs = Math.max(1, Date.now() - startedAt);

    const saved = await saveAnalysisReport({
      analysisType: "url",
      inputSummary: validated.url.toString(),
      output,
      metadata,
      durationMs,
    });

    res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
    res.json(saved);
  } catch (err) {
    console.error("[analyze/url error]", err);
    res.status(500).json({
      status: "error",
      error: "Unable to complete website URL analysis right now.",
    });
  }
});

// ─── POST /api/analyze/text ──────────────────────────────────────────────────

const TextRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(5, "Please enter at least 5 characters of message text to analyze.")
    .max(10_000, "Message text cannot exceed 10,000 characters."),
});

app.post("/api/analyze/text", async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const rate = checkExpressRateLimit(ip, "analyze-text", 30, 60_000);
  if (!rate.allowed) {
    res.status(429).json({
      status: "error",
      error: "Rate limit exceeded. Please wait a moment before running another analysis.",
    });
    return;
  }

  const parsed = TextRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      status: "error",
      error: parsed.error.issues[0]?.message ?? "Invalid text input.",
    });
    return;
  }

  const startedAt = Date.now();
  try {
    const { output, metadata } = await analyzeTextWithAI(parsed.data.text);
    const durationMs = Math.max(1, Date.now() - startedAt);

    const preview = parsed.data.text.replace(/\s+/g, " ").trim();
    const inputSummary =
      preview.length > 260 ? `${preview.slice(0, 257)}...` : preview;

    const saved = await saveAnalysisReport({
      analysisType: "text",
      inputSummary,
      output,
      metadata,
      durationMs,
    });

    res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
    res.json(saved);
  } catch (err) {
    console.error("[analyze/text error]", err);
    res.status(500).json({
      status: "error",
      error: "Unable to complete text analysis at this time. Please try again.",
    });
  }
});

// ─── POST /api/analyze/image ─────────────────────────────────────────────────

app.post(
  "/api/analyze/image",
  upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  async (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const rate = checkExpressRateLimit(ip, "analyze-image", 20, 60_000);
    if (!rate.allowed) {
      res.status(429).json({
        status: "error",
        error: "Rate limit exceeded. Please wait before uploading another screenshot.",
      });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const fileEntry = files?.["file"]?.[0] || files?.["image"]?.[0];

    if (!fileEntry) {
      res.status(400).json({
        status: "error",
        error: "No image file provided. Attach a PNG, JPG, JPEG, or WEBP screenshot.",
      });
      return;
    }

    if (fileEntry.size > MAX_IMAGE_BYTES) {
      res.status(413).json({
        status: "error",
        error: "Image exceeds maximum allowed size of 8 MB.",
      });
      return;
    }

    const contextNoteRaw = req.body?.contextNote;
    const contextNote =
      typeof contextNoteRaw === "string"
        ? contextNoteRaw.trim().slice(0, 2000)
        : "";

    const startedAt = Date.now();
    try {
      const buffer = fileEntry.buffer;
      const validated = validateUploadedImage(
        buffer,
        fileEntry.mimetype,
        fileEntry.originalname
      );

      if (!validated.ok) {
        res.status(400).json({ status: "error", error: validated.error });
        return;
      }

      const { output, metadata } = await analyzeImageWithAI({
        buffer,
        mimeType: validated.canonicalMime,
        details: validated.details,
        contextNote,
      });

      const durationMs = Math.max(1, Date.now() - startedAt);
      const dimStr =
        validated.details.width && validated.details.height
          ? `${validated.details.width}x${validated.details.height} `
          : "";
      const baseSummary = `${validated.details.detectedFormat} (${dimStr}${validated.details.sizeBytes} bytes)`;
      const inputSummary = contextNote
        ? `${baseSummary} - ${contextNote.slice(0, 160)}`
        : baseSummary;

      const saved = await saveAnalysisReport({
        analysisType: "image",
        inputSummary,
        output,
        metadata,
        durationMs,
      });

      res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
      res.json(saved);
    } catch (err) {
      console.error("[analyze/image error]", err);
      res.status(500).json({
        status: "error",
        error: "Unable to process screenshot at this time. Please retry.",
      });
    }
  }
);

// ─── POST /api/report (PDF Export) ───────────────────────────────────────────

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
  z.object({ reportId: z.string() }),
  z.object({ report: InlineReportSchema }),
  InlineReportSchema,
]);

app.post("/api/report", async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const rate = checkExpressRateLimit(ip, "pdf-report", 30, 60_000);
  if (!rate.allowed) {
    res.status(429).json({
      status: "error",
      error: "Too many PDF requests. Please wait a moment.",
    });
    return;
  }

  const parsed = ReportRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      status: "error",
      error: "Provide a valid reportId or report object.",
    });
    return;
  }

  try {
    let report: AnalysisReportDTO | null = null;
    const body = parsed.data;

    if ("reportId" in body) {
      report = await getReportById(body.reportId);
      if (!report) {
        res.status(404).json({ status: "error", error: "Report not found." });
        return;
      }
    } else if ("report" in body) {
      const inline = body.report;
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
        createdAt: inline.createdAt || new Date().toISOString(),
        metadata: {
          engineLabel: inline.metadata?.engineLabel || "SHIELDLY Threat Engine",
          aiProviderUsed: inline.metadata?.aiProviderUsed || "heuristic-only",
          aiModel: inline.metadata?.aiModel || null,
          aiFallbackReason: inline.metadata?.aiFallbackReason || null,
          externalReputationChecked:
            inline.metadata?.externalReputationChecked || false,
        },
      };
    } else {
      const inline = body;
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
        createdAt: inline.createdAt || new Date().toISOString(),
        metadata: {
          engineLabel: inline.metadata?.engineLabel || "SHIELDLY Threat Engine",
          aiProviderUsed: inline.metadata?.aiProviderUsed || "heuristic-only",
          aiModel: inline.metadata?.aiModel || null,
          aiFallbackReason: inline.metadata?.aiFallbackReason || null,
          externalReputationChecked:
            inline.metadata?.externalReputationChecked || false,
        },
      };
    }

    const pdfBytes = await generateReportPdfBuffer(report);
    const filename = `shieldly-threat-report-${report.id.slice(0, 8)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Length", String(pdfBytes.length));
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("[report error]", err);
    res.status(500).json({
      status: "error",
      error: "Could not generate PDF report right now.",
    });
  }
});

// ─── GET /api/reports (Dashboard List) ────────────────────────────────────────

app.get("/api/reports", async (_req: Request, res: Response) => {
  try {
    const data = await getDashboardData(50);
    res.json({ status: "success", ...data });
  } catch (err) {
    console.error("[reports list error]", err);
    res.status(500).json({
      status: "error",
      error: "Failed to load stored investigation reports.",
    });
  }
});

// ─── DELETE /api/reports (Clear All) ──────────────────────────────────────────

app.delete("/api/reports", async (_req: Request, res: Response) => {
  try {
    const deletedCount = await deleteAllReports();
    res.json({ status: "success", deletedCount });
  } catch (err) {
    console.error("[reports delete all error]", err);
    res.status(500).json({
      status: "error",
      error: "Failed to clear stored reports.",
    });
  }
});

// ─── GET /api/reports/:id ────────────────────────────────────────────────────

app.get("/api/reports/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const report =
      id === "latest" ? await getLatestReport() : await getReportById(id);

    if (!report) {
      res.status(404).json({ status: "error", error: "Report not found." });
      return;
    }

    res.json(report);
  } catch (err) {
    console.error("[report by id error]", err);
    res.status(500).json({
      status: "error",
      error: "Failed to retrieve report.",
    });
  }
});

// ─── DELETE /api/reports/:id ─────────────────────────────────────────────────

app.delete("/api/reports/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const ok = await deleteReportById(id);
    if (!ok) {
      res.status(404).json({ status: "error", error: "Report not found." });
      return;
    }
    res.json({ status: "success", deleted: true });
  } catch (err) {
    console.error("[report delete error]", err);
    res.status(500).json({
      status: "error",
      error: "Failed to delete report.",
    });
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Unhandled Express error]", err);
  res.status(500).json({
    status: "error",
    error: "Internal server error.",
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  SHIELDLY AI Backend API`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Status Check: http://localhost:${PORT}/api/status`);
  console.log(`====================================================`);
});
