import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  MAX_IMAGE_BYTES,
  validateUploadedImage,
} from "@/lib/security/image-validator";
import { analyzeImageWithAI } from "@/lib/analyzers/ai-service";
import { saveAnalysisReport } from "@/lib/reports-repo";
import { formatBytes } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rate = checkRateLimit(req, "analyze-image", 15, 60_000);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        status: "error",
        error: "Rate limit exceeded. Please wait before uploading another screenshot.",
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

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      {
        status: "error",
        error: "Invalid multipart form upload. Please upload an image file.",
      },
      { status: 400 }
    );
  }

  const fileEntry = formData.get("file") ?? formData.get("image");
  if (!fileEntry || !(fileEntry instanceof File)) {
    return NextResponse.json(
      {
        status: "error",
        error: "No image file provided. Attach a PNG, JPG, JPEG, or WEBP screenshot.",
      },
      { status: 400 }
    );
  }

  if (fileEntry.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        status: "error",
        error: "Image exceeds maximum allowed size of 8 MB.",
      },
      { status: 413 }
    );
  }

  const contextNoteRaw = formData.get("contextNote");
  const contextNote =
    typeof contextNoteRaw === "string"
      ? contextNoteRaw.trim().slice(0, 2000)
      : "";

  try {
    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validated = validateUploadedImage(
      buffer,
      fileEntry.type,
      fileEntry.name
    );

    if (!validated.ok) {
      return NextResponse.json(
        { status: "error", error: validated.error },
        { status: 400 }
      );
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
        ? `${validated.details.width}x${validated.details.height}px`
        : "validated";
    const inputSummary = `Screenshot: ${validated.details.fileName} (${validated.details.detectedFormat}, ${dimStr}, ${formatBytes(validated.details.sizeBytes)}) — raw image not retained`;

    const saved = await saveAnalysisReport({
      analysisType: "image",
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
        error: "Failed to process the uploaded screenshot safely.",
      },
      { status: 500 }
    );
  }
}
