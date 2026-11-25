import { NextResponse } from "next/server";
import { markAllAsRead } from "@/services/notifications";

export async function PUT() {
  try {
    const { error } = await markAllAsRead();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
