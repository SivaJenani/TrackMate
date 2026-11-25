import { NextRequest, NextResponse } from "next/server";
import { getGoals, createGoal } from "@/services/goals";

export async function GET(request: NextRequest) {
  try {
    const status = new URL(request.url).searchParams.get("status") || undefined;
    const { data, error } = await getGoals(status);
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
    const { data, error } = await createGoal(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
