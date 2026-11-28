import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeTextWithAI } from "@/lib/analyzers/ai-service";
import { saveAnalysisReport } from "@/lib/reports-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TextRequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(5, "Please enter at least 5 characters of message text to analyze.")
    .max(10_000, "Message text cannot exceed 10,000 characters."),
});

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "analyze-text", 25, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        status: "error",
        error: "Rate limit exceeded. Please wait a moment before running another analysis.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.resetMs / 1000)),
        },
      }
    );
  }

  const startedAt = Date.now();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", error: "Invalid JSON request payload." },
      { status: 400 }
    );
  }

  const parsed = TextRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message ?? "Invalid text input.";
    return NextResponse.json(
      { status: "error", error: firstError },
      { status: 400 }
    );
  }

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

    return NextResponse.json(saved, {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": String(rate.remaining),
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        error: "Unable to complete text analysis at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}
