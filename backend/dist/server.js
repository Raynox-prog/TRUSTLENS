"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const rate_limit_1 = require("./lib/rate-limit");
const ssrf_1 = require("./lib/ssrf");
const ai_service_1 = require("./lib/ai-service");
const image_validator_1 = require("./lib/image-validator");
const reports_repo_1 = require("./lib/reports-repo");
const pdf_generator_1 = require("./lib/pdf-generator");
const types_1 = require("./lib/types");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Trust reverse proxies (Render, Cloudflare, etc.)
app.set("trust proxy", 1);
// Configure CORS
const allowedOrigins = process.env.CORS_ORIGIN || "*";
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (allowedOrigins === "*" || !origin) {
            callback(null, true);
        }
        else {
            const list = allowedOrigins.split(",").map((o) => o.trim());
            if (list.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(null, true); // Permissive default to allow Vercel previews & custom domains
            }
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));
app.use(express_1.default.json({ limit: "15mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "15mb" }));
// Configure multer for screenshot uploads in memory
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: image_validator_1.MAX_IMAGE_BYTES,
    },
});
function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "127.0.0.1";
}
// ─── Health & Capabilities ───────────────────────────────────────────────────
app.get(["/", "/health", "/api/health"], (_req, res) => {
    res.json({
        status: "ok",
        service: "SHIELDLY AI Backend API",
        version: "2.0.0",
        engine: "Zero-Trust Threat Defense Engine",
        timestamp: new Date().toISOString(),
    });
});
app.get("/api/status", (_req, res) => {
    const capabilities = (0, ai_service_1.getServerCapabilities)();
    res.json({
        status: "success",
        capabilities,
    });
});
// ─── POST /api/analyze/url ───────────────────────────────────────────────────
const UrlRequestSchema = zod_1.z.object({
    url: zod_1.z
        .string()
        .trim()
        .min(4, "Please enter a website URL to inspect.")
        .max(2048, "URL exceeds maximum length of 2048 characters."),
});
app.post("/api/analyze/url", async (req, res) => {
    const ip = getClientIp(req);
    const rate = (0, rate_limit_1.checkExpressRateLimit)(ip, "analyze-url", 30, 60_000);
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
    const validated = (0, ssrf_1.normalizeAndValidatePublicUrl)(parsed.data.url);
    if (!validated.ok) {
        res.status(400).json({
            status: "error",
            error: validated.error,
        });
        return;
    }
    const startedAt = Date.now();
    try {
        const { output, metadata } = await (0, ai_service_1.analyzeUrlWithAI)(parsed.data.url, validated.url);
        const durationMs = Math.max(1, Date.now() - startedAt);
        const saved = await (0, reports_repo_1.saveAnalysisReport)({
            analysisType: "url",
            inputSummary: validated.url.toString(),
            output,
            metadata,
            durationMs,
        });
        res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
        res.json(saved);
    }
    catch (err) {
        console.error("[analyze/url error]", err);
        res.status(500).json({
            status: "error",
            error: "Unable to complete website URL analysis right now.",
        });
    }
});
// ─── POST /api/analyze/text ──────────────────────────────────────────────────
const TextRequestSchema = zod_1.z.object({
    text: zod_1.z
        .string()
        .trim()
        .min(5, "Please enter at least 5 characters of message text to analyze.")
        .max(10_000, "Message text cannot exceed 10,000 characters."),
});
app.post("/api/analyze/text", async (req, res) => {
    const ip = getClientIp(req);
    const rate = (0, rate_limit_1.checkExpressRateLimit)(ip, "analyze-text", 30, 60_000);
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
        const { output, metadata } = await (0, ai_service_1.analyzeTextWithAI)(parsed.data.text);
        const durationMs = Math.max(1, Date.now() - startedAt);
        const preview = parsed.data.text.replace(/\s+/g, " ").trim();
        const inputSummary = preview.length > 260 ? `${preview.slice(0, 257)}...` : preview;
        const saved = await (0, reports_repo_1.saveAnalysisReport)({
            analysisType: "text",
            inputSummary,
            output,
            metadata,
            durationMs,
        });
        res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
        res.json(saved);
    }
    catch (err) {
        console.error("[analyze/text error]", err);
        res.status(500).json({
            status: "error",
            error: "Unable to complete text analysis at this time. Please try again.",
        });
    }
});
// ─── POST /api/analyze/image ─────────────────────────────────────────────────
app.post("/api/analyze/image", upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]), async (req, res) => {
    const ip = getClientIp(req);
    const rate = (0, rate_limit_1.checkExpressRateLimit)(ip, "analyze-image", 20, 60_000);
    if (!rate.allowed) {
        res.status(429).json({
            status: "error",
            error: "Rate limit exceeded. Please wait before uploading another screenshot.",
        });
        return;
    }
    const files = req.files;
    const fileEntry = files?.["file"]?.[0] || files?.["image"]?.[0];
    if (!fileEntry) {
        res.status(400).json({
            status: "error",
            error: "No image file provided. Attach a PNG, JPG, JPEG, or WEBP screenshot.",
        });
        return;
    }
    if (fileEntry.size > image_validator_1.MAX_IMAGE_BYTES) {
        res.status(413).json({
            status: "error",
            error: "Image exceeds maximum allowed size of 8 MB.",
        });
        return;
    }
    const contextNoteRaw = req.body?.contextNote;
    const contextNote = typeof contextNoteRaw === "string"
        ? contextNoteRaw.trim().slice(0, 2000)
        : "";
    const startedAt = Date.now();
    try {
        const buffer = fileEntry.buffer;
        const validated = (0, image_validator_1.validateUploadedImage)(buffer, fileEntry.mimetype, fileEntry.originalname);
        if (!validated.ok) {
            res.status(400).json({ status: "error", error: validated.error });
            return;
        }
        const { output, metadata } = await (0, ai_service_1.analyzeImageWithAI)({
            buffer,
            mimeType: validated.canonicalMime,
            details: validated.details,
            contextNote,
        });
        const durationMs = Math.max(1, Date.now() - startedAt);
        const dimStr = validated.details.width && validated.details.height
            ? `${validated.details.width}x${validated.details.height} `
            : "";
        const baseSummary = `${validated.details.detectedFormat} (${dimStr}${validated.details.sizeBytes} bytes)`;
        const inputSummary = contextNote
            ? `${baseSummary} - ${contextNote.slice(0, 160)}`
            : baseSummary;
        const saved = await (0, reports_repo_1.saveAnalysisReport)({
            analysisType: "image",
            inputSummary,
            output,
            metadata,
            durationMs,
        });
        res.setHeader("X-RateLimit-Remaining", String(rate.remaining));
        res.json(saved);
    }
    catch (err) {
        console.error("[analyze/image error]", err);
        res.status(500).json({
            status: "error",
            error: "Unable to process screenshot at this time. Please retry.",
        });
    }
});
// ─── POST /api/report (PDF Export) ───────────────────────────────────────────
const InlineReportSchema = zod_1.z.object({
    id: zod_1.z.string().min(1).max(100).default("unsaved"),
    analysisType: types_1.AnalysisTypeSchema,
    inputSummary: zod_1.z.string().min(1).max(500),
    riskLevel: types_1.RiskLevelSchema,
    riskScore: zod_1.z.number().int().min(0).max(100),
    verdict: zod_1.z.string().min(1).max(400),
    summary: zod_1.z.string().min(1).max(2000),
    detectedThreats: zod_1.z.array(types_1.DetectedThreatSchema).max(25),
    recommendations: zod_1.z.array(zod_1.z.string().min(1).max(500)).max(15),
    confidence: types_1.ConfidenceSchema,
    limitations: zod_1.z.array(zod_1.z.string().min(1).max(500)).max(15),
    durationMs: zod_1.z.number().int().min(0).default(0),
    createdAt: zod_1.z.string().optional(),
    metadata: zod_1.z
        .object({
        engineLabel: zod_1.z.string().default("SHIELDLY Analysis Engine"),
        aiProviderUsed: zod_1.z
            .enum(["gemini", "openai", "heuristic-only"])
            .default("heuristic-only"),
        aiModel: zod_1.z.string().nullable().default(null),
        aiFallbackReason: zod_1.z.string().nullable().default(null),
        externalReputationChecked: zod_1.z.boolean().default(false),
    })
        .optional(),
});
const ReportRequestSchema = zod_1.z.union([
    zod_1.z.object({ reportId: zod_1.z.string() }),
    zod_1.z.object({ report: InlineReportSchema }),
    InlineReportSchema,
]);
app.post("/api/report", async (req, res) => {
    const ip = getClientIp(req);
    const rate = (0, rate_limit_1.checkExpressRateLimit)(ip, "pdf-report", 30, 60_000);
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
        let report = null;
        const body = parsed.data;
        if ("reportId" in body) {
            report = await (0, reports_repo_1.getReportById)(body.reportId);
            if (!report) {
                res.status(404).json({ status: "error", error: "Report not found." });
                return;
            }
        }
        else if ("report" in body) {
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
                    externalReputationChecked: inline.metadata?.externalReputationChecked || false,
                },
            };
        }
        else {
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
                    externalReputationChecked: inline.metadata?.externalReputationChecked || false,
                },
            };
        }
        const pdfBytes = await (0, pdf_generator_1.generateReportPdfBuffer)(report);
        const filename = `shieldly-threat-report-${report.id.slice(0, 8)}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", String(pdfBytes.length));
        res.send(Buffer.from(pdfBytes));
    }
    catch (err) {
        console.error("[report error]", err);
        res.status(500).json({
            status: "error",
            error: "Could not generate PDF report right now.",
        });
    }
});
// ─── GET /api/reports (Dashboard List) ────────────────────────────────────────
app.get("/api/reports", async (_req, res) => {
    try {
        const data = await (0, reports_repo_1.getDashboardData)(50);
        res.json({ status: "success", ...data });
    }
    catch (err) {
        console.error("[reports list error]", err);
        res.status(500).json({
            status: "error",
            error: "Failed to load stored investigation reports.",
        });
    }
});
// ─── DELETE /api/reports (Clear All) ──────────────────────────────────────────
app.delete("/api/reports", async (_req, res) => {
    try {
        const deletedCount = await (0, reports_repo_1.deleteAllReports)();
        res.json({ status: "success", deletedCount });
    }
    catch (err) {
        console.error("[reports delete all error]", err);
        res.status(500).json({
            status: "error",
            error: "Failed to clear stored reports.",
        });
    }
});
// ─── GET /api/reports/:id ────────────────────────────────────────────────────
app.get("/api/reports/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const report = id === "latest" ? await (0, reports_repo_1.getLatestReport)() : await (0, reports_repo_1.getReportById)(id);
        if (!report) {
            res.status(404).json({ status: "error", error: "Report not found." });
            return;
        }
        res.json(report);
    }
    catch (err) {
        console.error("[report by id error]", err);
        res.status(500).json({
            status: "error",
            error: "Failed to retrieve report.",
        });
    }
});
// ─── DELETE /api/reports/:id ─────────────────────────────────────────────────
app.delete("/api/reports/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const ok = await (0, reports_repo_1.deleteReportById)(id);
        if (!ok) {
            res.status(404).json({ status: "error", error: "Report not found." });
            return;
        }
        res.json({ status: "success", deleted: true });
    }
    catch (err) {
        console.error("[report delete error]", err);
        res.status(500).json({
            status: "error",
            error: "Failed to delete report.",
        });
    }
});
// Error handling middleware
app.use((err, _req, res, _next) => {
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
