import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthFrozen, getDemoStore } from "@/lib/demo-store";
import type { GoalStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getGoals(status?: string) {
  if (isAuthFrozen()) {
    let goals = getDemoStore().goals;
    if (status && status !== "all") goals = goals.filter((g) => g.status === status);
    return { data: goals, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase.from("goals").select("*, milestones(*)").eq("user_id", user.id);
  if (status && status !== "all") query = query.eq("status", status);
  return query.order("created_at", { ascending: false });
}

export async function getGoalById(goalId: string) {
  if (isAuthFrozen()) {
    const goal = getDemoStore().goals.find((g) => g.id === goalId) || null;
    return { data: goal, error: goal ? null : { message: "Goal not found" } };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("goals").select("*, milestones(*)").eq("id", goalId).eq("user_id", user.id).single();
}

export async function createGoal(data: {
  title: string; description?: string; target_date?: string; status?: string; progress?: number;
}) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const newGoal = {
      id: uuidv4(),
      user_id: store.user.id,
      title: data.title,
      description: data.description || null,
      target_date: data.target_date || null,
      progress: data.progress ?? 0,
      status: (data.status || "active") as GoalStatus,
      created_at: now,
      updated_at: now,
      milestones: [],
    };
    store.goals.unshift(newGoal);
    return { data: newGoal, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("goals").insert({ ...data, user_id: user.id }).select().single();
}

export async function updateGoal(goalId: string, data: Record<string, unknown>) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const idx = store.goals.findIndex((g) => g.id === goalId);
    if (idx === -1) return { data: null, error: { message: "Goal not found" } };
    store.goals[idx] = { ...store.goals[idx], ...data, updated_at: new Date().toISOString() };
    return { data: store.goals[idx], error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("goals").update(data).eq("id", goalId).eq("user_id", user.id).select().single();
}

export async function deleteGoal(goalId: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.goals = store.goals.filter((g) => g.id !== goalId);
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("goals").delete().eq("id", goalId).eq("user_id", user.id);
}

export async function createMilestone(goalId: string, data: { title: string }) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const goal = store.goals.find((g) => g.id === goalId);
    if (!goal) return { data: null, error: { message: "Goal not found" } };
    const ms = {
      id: uuidv4(),
      goal_id: goalId,
      user_id: store.user.id,
      title: data.title,
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    goal.milestones.push(ms);
    return { data: ms, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("milestones").insert({ ...data, goal_id: goalId, user_id: user.id }).select().single();
}

export async function updateMilestone(milestoneId: string, data: Record<string, unknown>) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    for (const goal of store.goals) {
      const idx = goal.milestones.findIndex((m) => m.id === milestoneId);
      if (idx !== -1) {
        goal.milestones[idx] = { ...goal.milestones[idx], ...data };
        return { data: goal.milestones[idx], error: null };
      }
    }
    return { data: null, error: { message: "Milestone not found" } };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("milestones").update(data).eq("id", milestoneId).eq("user_id", user.id).select().single();
}

export async function deleteMilestone(milestoneId: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    for (const goal of store.goals) {
      goal.milestones = goal.milestones.filter((m) => m.id !== milestoneId);
    }
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("milestones").delete().eq("id", milestoneId).eq("user_id", user.id);
}

export async function getGoalStats() {
  if (isAuthFrozen()) {
    const goals = getDemoStore().goals;
    return {
      total: goals.length,
      active: goals.filter((g) => g.status === "active").length,
      completed: goals.filter((g) => g.status === "completed").length,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data } = await supabase.from("goals").select("status").eq("user_id", user.id);
  return {
    total: data?.length || 0,
    active: data?.filter((g) => g.status === "active").length || 0,
    completed: data?.filter((g) => g.status === "completed").length || 0,
  };
}
