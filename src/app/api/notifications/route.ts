import { NextRequest, NextResponse } from "next/server";
import { getNotifications, createNotification } from "@/services/notifications";

export async function GET(request: NextRequest) {
  try {
    const unread = new URL(request.url).searchParams.get("unread") === "true";
    const { data, error } = await getNotifications(unread);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await createNotification(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
