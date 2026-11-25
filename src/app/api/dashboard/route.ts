import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
