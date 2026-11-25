import { NextRequest, NextResponse } from "next/server";
import { getUserSettings, updateUserSettings } from "@/services/settings";

export async function GET() {
  try {
    const { data, error } = await getUserSettings();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await updateUserSettings(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
