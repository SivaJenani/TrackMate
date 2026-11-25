import { NextRequest, NextResponse } from "next/server";
import { logHabit, unlogHabit } from "@/services/habits";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { date } = await request.json();
    const { data, error } = await logHabit(id, date);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { date } = await request.json();
    const { error } = await unlogHabit(id, date);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
