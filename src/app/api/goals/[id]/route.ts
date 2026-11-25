import { NextRequest, NextResponse } from "next/server";
import { getGoalById, updateGoal, deleteGoal } from "@/services/goals";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await getGoalById(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await updateGoal(id, body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await deleteGoal(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
