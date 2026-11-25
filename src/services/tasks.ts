import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthFrozen, getDemoStore, filterDemoTasks } from "@/lib/demo-store";
import type { TaskFilters, TaskStatus, TaskPriority } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getTasks(filters?: TaskFilters) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    return { data: filterDemoTasks(store.tasks, filters), error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase.from("tasks").select("*").eq("user_id", user.id);

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder === "asc";
  query = query.order(sortBy, { ascending: sortOrder });

  return query;
}

export async function getTaskById(taskId: string) {
  if (isAuthFrozen()) {
    const task = getDemoStore().tasks.find((t) => t.id === taskId) || null;
    return { data: task, error: task ? null : { message: "Task not found" } };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("tasks").select("*").eq("id", taskId).eq("user_id", user.id).single();
}

export async function createTask(data: {
  title: string; description?: string; status?: string;
  priority?: string; category?: string; deadline?: string;
}) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const newTask = {
      id: uuidv4(),
      user_id: store.user.id,
      title: data.title,
      description: data.description || null,
      status: (data.status || "todo") as TaskStatus,
      priority: (data.priority || "medium") as TaskPriority,
      category: data.category || null,
      deadline: data.deadline || null,
      created_at: now,
      updated_at: now,
    };
    store.tasks.unshift(newTask);
    return { data: newTask, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("tasks").insert({ ...data, user_id: user.id }).select().single();
}

export async function updateTask(taskId: string, data: Record<string, unknown>) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const idx = store.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return { data: null, error: { message: "Task not found" } };
    store.tasks[idx] = { ...store.tasks[idx], ...data, updated_at: new Date().toISOString() };
    return { data: store.tasks[idx], error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("tasks").update(data).eq("id", taskId).eq("user_id", user.id).select().single();
}

export async function deleteTask(taskId: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.tasks = store.tasks.filter((t) => t.id !== taskId);
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("tasks").delete().eq("id", taskId).eq("user_id", user.id);
}

export async function getTaskStats() {
  if (isAuthFrozen()) {
    const tasks = getDemoStore().tasks;
    const now = new Date().toISOString();
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      pending: tasks.filter((t) => t.status !== "completed").length,
      overdue: tasks.filter((t) => t.status !== "completed" && t.deadline && t.deadline < now).length,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: tasks } = await supabase.from("tasks").select("status, deadline").eq("user_id", user.id);
  if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };

  const now = new Date().toISOString();
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status !== "completed").length,
    overdue: tasks.filter((t) => t.status !== "completed" && t.deadline && t.deadline < now).length,
  };
}

export async function getRecentTasks(limit = 5) {
  if (isAuthFrozen()) {
    return { data: getDemoStore().tasks.slice(0, limit), error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(limit);
}
