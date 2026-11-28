import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthFrozen, getDemoStore } from "@/lib/demo-store";
import type { HabitFrequency } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function getHabits() {
  if (isAuthFrozen()) {
    return { data: getDemoStore().habits, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
}

export async function createHabit(data: {
  name: string; description?: string; frequency?: string; color?: string; icon?: string | null;
}) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const newHabit = {
      id: uuidv4(),
      user_id: store.user.id,
      name: data.name,
      description: data.description || null,
      frequency: (data.frequency || "daily") as HabitFrequency,
      color: data.color || "#00B4F0",
      icon: data.icon ?? null,
      streak: 0,
      created_at: now,
      updated_at: now,
    };
    store.habits.unshift(newHabit);
    return { data: newHabit, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habits").insert({ ...data, user_id: user.id }).select().single();
}

export async function updateHabit(habitId: string, data: Record<string, unknown>) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const idx = store.habits.findIndex((h) => h.id === habitId);
    if (idx === -1) return { data: null, error: { message: "Habit not found" } };
    store.habits[idx] = { ...store.habits[idx], ...data, updated_at: new Date().toISOString() };
    return { data: store.habits[idx], error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habits").update(data).eq("id", habitId).eq("user_id", user.id).select().single();
}

export async function deleteHabit(habitId: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.habits = store.habits.filter((h) => h.id !== habitId);
    store.habitLogs = store.habitLogs.filter((l) => l.habit_id !== habitId);
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id);
}

export async function logHabit(habitId: string, date: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const existing = store.habitLogs.find((l) => l.habit_id === habitId && l.completed_date === date);
    if (existing) return { data: existing, error: null };
    const log = {
      id: uuidv4(),
      habit_id: habitId,
      user_id: store.user.id,
      completed_date: date,
      created_at: new Date().toISOString(),
    };
    store.habitLogs.push(log);
    const habit = store.habits.find((h) => h.id === habitId);
    if (habit) habit.streak += 1;
    return { data: log, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user.id, completed_date: date }).select().single();
}

export async function unlogHabit(habitId: string, date: string) {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    store.habitLogs = store.habitLogs.filter((l) => !(l.habit_id === habitId && l.completed_date === date));
    const habit = store.habits.find((h) => h.id === habitId);
    if (habit && habit.streak > 0) habit.streak -= 1;
    return { error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id).eq("completed_date", date);
}

export async function getHabitLogs(habitId: string, startDate: string, endDate: string) {
  if (isAuthFrozen()) {
    const logs = getDemoStore().habitLogs.filter(
      (l) => l.habit_id === habitId && l.completed_date >= startDate && l.completed_date <= endDate
    );
    return { data: logs, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habit_logs").select("*").eq("habit_id", habitId).eq("user_id", user.id)
    .gte("completed_date", startDate).lte("completed_date", endDate);
}

export async function getAllHabitLogs(startDate: string, endDate: string) {
  if (isAuthFrozen()) {
    const logs = getDemoStore().habitLogs.filter(
      (l) => (!startDate || l.completed_date >= startDate) && (!endDate || l.completed_date <= endDate)
    );
    return { data: logs, error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("habit_logs").select("*").eq("user_id", user.id)
    .gte("completed_date", startDate).lte("completed_date", endDate);
}

export async function getHabitStats() {
  if (isAuthFrozen()) {
    const habits = getDemoStore().habits;
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    return { totalHabits: habits.length, maxStreak };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: habits } = await supabase.from("habits").select("streak").eq("user_id", user.id);
  const maxStreak = habits?.reduce((max, h) => Math.max(max, h.streak || 0), 0) || 0;
  return { totalHabits: habits?.length || 0, maxStreak };
}
