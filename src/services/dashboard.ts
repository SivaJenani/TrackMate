import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAuthFrozen, getDemoStore } from "@/lib/demo-store";
import { format, subDays, startOfDay } from "date-fns";

export async function getDashboardStats() {
  if (isAuthFrozen()) {
    const store = getDemoStore();
    const now = new Date().toISOString();
    const totalTasks = store.tasks.length;
    const completedTasks = store.tasks.filter((t) => t.status === "completed").length;
    const pendingTasks = store.tasks.filter((t) => t.status !== "completed").length;
    const overdueTasks = store.tasks.filter((t) => t.status !== "completed" && t.deadline && t.deadline < now).length;
    const activeGoals = store.goals.filter((g) => g.status === "active").length;
    const currentStreak = store.habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const productivityPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
      overdue_tasks: overdueTasks,
      active_goals: activeGoals,
      current_streak: currentStreak,
      productivity_percentage: productivityPercentage,
      weekly_activity: [2, 3, 1, 4, 2, 3, completedTasks],
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const now = new Date().toISOString();

  const { data: tasks } = await supabase.from("tasks").select("status, deadline").eq("user_id", user.id);
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
  const pendingTasks = tasks?.filter((t) => t.status !== "completed").length || 0;
  const overdueTasks = tasks?.filter((t) => t.status !== "completed" && t.deadline && t.deadline < now).length || 0;

  const { data: goals } = await supabase.from("goals").select("status").eq("user_id", user.id);
  const activeGoals = goals?.filter((g) => g.status === "active").length || 0;

  const { data: habits } = await supabase.from("habits").select("streak").eq("user_id", user.id);
  const currentStreak = habits?.reduce((max, h) => Math.max(max, h.streak || 0), 0) || 0;

  const productivityPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weeklyActivity: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = format(startOfDay(subDays(new Date(), i)), "yyyy-MM-dd");
    const dayEnd = format(startOfDay(subDays(new Date(), i - 1)), "yyyy-MM-dd");
    const { count } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .gte("updated_at", `${dayStart}T00:00:00`)
      .lt("updated_at", `${dayEnd}T00:00:00`);
    weeklyActivity.push(count || 0);
  }

  return {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    pending_tasks: pendingTasks,
    overdue_tasks: overdueTasks,
    active_goals: activeGoals,
    current_streak: currentStreak,
    productivity_percentage: productivityPercentage,
    weekly_activity: weeklyActivity,
  };
}

export async function getRecentActivity(limit = 5) {
  if (isAuthFrozen()) {
    return { data: getDemoStore().tasks.slice(0, limit), error: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return supabase.from("tasks").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(limit);
}
