import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeAndValidatePublicUrl } from "@/lib/security/ssrf";
import { analyzeUrlWithAI } from "@/lib/analyzers/ai-service";
import { saveAnalysisReport } from "@/lib/reports-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UrlRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(4, "Please enter a website URL to inspect.")
    .max(2048, "URL exceeds maximum length of 2048 characters."),
});

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "analyze-url", 25, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        status: "error",
        error: "Rate limit exceeded. Please wait before checking another URL.",
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

  const parsed = UrlRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "error",
        error: parsed.error.issues[0]?.message ?? "Invalid URL input.",
      },
      { status: 400 }
    );
  }

  const validated = normalizeAndValidatePublicUrl(parsed.data.url);
  if (!validated.ok) {
    return NextResponse.json(
      { status: "error", error: validated.error },
      { status: 400 }
    );
  }

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
        error: "Unable to complete website URL analysis right now.",
      },
      { status: 500 }
    );
  }
}
