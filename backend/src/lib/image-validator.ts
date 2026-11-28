import type { ImageInspectionDetails } from "./types";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

const ALLOWED_MIMES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

function detectSignature(buf: Buffer): "PNG" | "JPEG" | "WEBP" | null {
  if (buf.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "PNG";
  }

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "JPEG";
  }

  // WEBP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "WEBP";
  }

  return null;
}

function parseDimensions(
  buf: Buffer,
  format: "PNG" | "JPEG" | "WEBP"
): { width: number | null; height: number | null } {
  try {
    if (format === "PNG" && buf.length >= 24) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    }

    if (format === "JPEG") {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) break;
        const marker = buf[offset + 1];
        // SOF0..SOF3 markers contain dimensions
        if (
          marker === 0xc0 ||
          marker === 0xc1 ||
          marker === 0xc2 ||
          marker === 0xc3
        ) {
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          return { width, height };
        }
        const segmentLength = buf.readUInt16BE(offset + 2);
        if (segmentLength < 2) break;
        offset += 2 + segmentLength;
      }
    }

    if (format === "WEBP" && buf.length >= 30) {
      const chunk = buf.subarray(12, 16).toString("ascii");
      if (chunk === "VP8X") {
        const width = 1 + buf.readUIntLE(24, 3);
        const height = 1 + buf.readUIntLE(27, 3);
        return { width, height };
      }
      if (chunk === "VP8 ") {
        const width = buf.readUInt16LE(26) & 0x3fff;
        const height = buf.readUInt16LE(28) & 0x3fff;
        return { width, height };
      }
      if (chunk === "VP8L") {
        const bits = buf.readUInt32LE(21);
        const width = (bits & 0x3fff) + 1;
        const height = ((bits >> 14) & 0x3fff) + 1;
        return { width, height };
      }
    }
  } catch {
    return { width: null, height: null };
  }
  return { width: null, height: null };
}

function extractPngTextChunks(buf: Buffer): string | null {
  try {
    const texts: string[] = [];
    let offset = 8;
    while (offset + 12 <= buf.length && texts.length < 6) {
      const length = buf.readUInt32BE(offset);
      const type = buf.subarray(offset + 4, offset + 8).toString("ascii");
      if (offset + 12 + length > buf.length) break;
      if (type === "tEXt" && length > 0 && length < 4096) {
        const raw = buf
          .subarray(offset + 8, offset + 8 + length)
          .toString("utf8")
          .replace(/\0/g, ": ")
          .trim();
        if (raw) texts.push(raw);
      }
      offset += 12 + length;
      if (type === "IEND") break;
    }
    return texts.length > 0 ? texts.join(" | ").slice(0, 500) : null;
  } catch {
    return null;
  }
}

export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "screenshot";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "screenshot";
}

export function validateUploadedImage(
  buffer: Buffer,
  declaredMime: string,
  originalName: string
):
  | {
      ok: true;
      canonicalMime: "image/png" | "image/jpeg" | "image/webp";
      details: ImageInspectionDetails;
    }
  | {
      ok: false;
      error: string;
    } {
  if (buffer.length === 0) {
    return { ok: false, error: "Uploaded image file is empty." };
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: "File exceeds maximum allowed size of 8 MB.",
    };
  }

  const normalizedMime = declaredMime.toLowerCase().trim();
  if (normalizedMime && !ALLOWED_MIMES.has(normalizedMime)) {
    return {
      ok: false,
      error: "Unsupported MIME type. Only PNG, JPG, JPEG, and WEBP images are accepted.",
    };
  }

  const detectedFormat = detectSignature(buffer);
  if (!detectedFormat) {
    return {
      ok: false,
      error:
        "File signature verification failed. The uploaded file does not match valid PNG, JPEG, or WEBP magic bytes.",
    };
  }

  const canonicalMime =
    detectedFormat === "PNG"
      ? "image/png"
      : detectedFormat === "JPEG"
        ? "image/jpeg"
        : "image/webp";

  if (
    normalizedMime &&
    normalizedMime !== canonicalMime &&
    !(normalizedMime === "image/jpg" && canonicalMime === "image/jpeg")
  ) {
    return {
      ok: false,
      error: `Declared MIME type (${normalizedMime}) does not match actual binary file signature (${detectedFormat}).`,
    };
  }

  const { width, height } = parseDimensions(buffer, detectedFormat);
  const extractedMetadataText =
    detectedFormat === "PNG" ? extractPngTextChunks(buffer) : null;

  return {
    ok: true,
    canonicalMime,
    details: {
      fileName: sanitizeFilename(originalName),
      mimeType: canonicalMime,
      detectedFormat,
      sizeBytes: buffer.length,
      width,
      height,
      extractedMetadataText,
      retainedOnServer: false,
    },
  };
}
