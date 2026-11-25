import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/services/tasks";
import type { TaskFilters } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status: (searchParams.get("status") || undefined) as TaskFilters["status"],
      priority: (searchParams.get("priority") || undefined) as TaskFilters["priority"],
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") || "created_at") as TaskFilters["sortBy"],
      sortOrder: (searchParams.get("sortOrder") || "desc") as TaskFilters["sortOrder"],
    };
    const { data, error } = await getTasks(filters);
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
    const { data, error } = await createTask(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
