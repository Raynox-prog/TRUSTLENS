import { NextResponse } from "next/server";
import { getServerCapabilities } from "@/lib/analyzers/ai-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const capabilities = getServerCapabilities();
  return NextResponse.json({
    status: "success",
    capabilities,
  });
}
