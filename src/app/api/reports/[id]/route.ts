import { NextRequest, NextResponse } from "next/server";
import { deleteReportById, getLatestReport, getReportById } from "@/lib/reports-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const report =
      id === "latest" ? await getLatestReport() : await getReportById(id);

    if (!report) {
      return NextResponse.json(
        { status: "error", error: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { status: "error", error: "Failed to retrieve report." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const ok = await deleteReportById(id);
    if (!ok) {
      return NextResponse.json(
        { status: "error", error: "Report not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ status: "success", deleted: true });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Failed to delete report." },
      { status: 500 }
    );
  }
}
