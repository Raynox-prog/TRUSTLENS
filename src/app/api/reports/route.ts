import { NextResponse } from "next/server";
import { deleteAllReports, getDashboardData } from "@/lib/reports-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDashboardData(50);
    return NextResponse.json({ status: "success", ...data });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Failed to load stored investigation reports." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const deletedCount = await deleteAllReports();
    return NextResponse.json({ status: "success", deletedCount });
  } catch {
    return NextResponse.json(
      { status: "error", error: "Failed to clear stored reports." },
      { status: 500 }
    );
  }
}
