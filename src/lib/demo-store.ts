import type {
  Task,
  Goal,
  Milestone,
  Habit,
  HabitLog,
  Notification,
  UserSettings,
  User,
  TaskFilters,
} from "@/types";
import { format, subDays } from "date-fns";

export function isAuthFrozen(): boolean {
  return process.env.NEXT_PUBLIC_DISABLE_AUTH === "true";
}

const now = new Date().toISOString();
const today = format(new Date(), "yyyy-MM-dd");
const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

interface DemoStore {
  user: User;
  settings: UserSettings;
  tasks: Task[];
  goals: (Goal & { milestones: Milestone[] })[];
  habits: Habit[];
  habitLogs: HabitLog[];
  notifications: Notification[];
}

const globalForDemo = globalThis as unknown as { __trackmateDemoStore?: DemoStore };

function createInitialStore(): DemoStore {
  return {
    user: {
      id: "demo-user-001",
      email: "demo@trackmate.app",
      full_name: "Demo User",
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    settings: {
      id: "demo-settings-001",
      user_id: "demo-user-001",
      email_notifications: true,
      push_notifications: true,
      task_reminders: true,
      habit_reminders: true,
      goal_reminders: true,
      theme: "system",
      created_at: now,
      updated_at: now,
    },
    tasks: [
      {
        id: "task-1",
        user_id: "demo-user-001",
        title: "Review Q4 product roadmap",
        description: "Align milestones and prioritize upcoming sprint deliverables.",
        status: "in_progress",
        priority: "high",
        category: "Work",
        deadline: `${tomorrow}T17:00:00.000Z`,
        created_at: now,
        updated_at: now,
      },
      {
        id: "task-2",
        user_id: "demo-user-001",
        title: "Complete daily workout routine",
        description: "30 minutes cardio and strength training.",
        status: "completed",
        priority: "medium",
        category: "Health",
        deadline: `${today}T18:00:00.000Z`,
        created_at: now,
        updated_at: now,
      },
      {
        id: "task-3",
        user_id: "demo-user-001",
        title: "Read 20 pages of Clean Architecture",
        description: null,
        status: "todo",
        priority: "low",
        category: "Learning",
        deadline: `${tomorrow}T20:00:00.000Z`,
        created_at: now,
        updated_at: now,
      },
    ],
    goals: [
      {
        id: "goal-1",
        user_id: "demo-user-001",
        title: "Launch TrackMate MVP",
        description: "Ship core task, goal, habit, and analytics features.",
        target_date: `${tomorrow}T00:00:00.000Z`,
        progress: 75,
        status: "active",
        created_at: now,
        updated_at: now,
        milestones: [
          {
            id: "ms-1",
            goal_id: "goal-1",
            user_id: "demo-user-001",
            title: "Design UI & Dashboard Layout",
            is_completed: true,
            completed_at: now,
            created_at: now,
          },
          {
            id: "ms-2",
            goal_id: "goal-1",
            user_id: "demo-user-001",
            title: "Build Tasks, Goals & Habits",
            is_completed: true,
            completed_at: now,
            created_at: now,
          },
          {
            id: "ms-3",
            goal_id: "goal-1",
            user_id: "demo-user-001",
            title: "Connect Production Supabase",
            is_completed: false,
            completed_at: null,
            created_at: now,
          },
        ],
      },
    ],
    habits: [
      {
        id: "habit-1",
        user_id: "demo-user-001",
        name: "Morning Meditation",
        description: "10 minutes mindfulness",
        frequency: "daily",
        color: "#00B4F0",
        streak: 5,
        created_at: now,
        updated_at: now,
      },
      {
        id: "habit-2",
        user_id: "demo-user-001",
        name: "Deep Work (2h)",
        description: "Focused coding without distractions",
        frequency: "daily",
        color: "#10B981",
        streak: 3,
        created_at: now,
        updated_at: now,
      },
    ],
    habitLogs: [
      {
        id: "hlog-1",
        habit_id: "habit-1",
        user_id: "demo-user-001",
        completed_date: today,
        created_at: now,
      },
      {
        id: "hlog-2",
        habit_id: "habit-1",
        user_id: "demo-user-001",
        completed_date: yesterday,
        created_at: now,
      },
    ],
    notifications: [
      {
        id: "notif-1",
        user_id: "demo-user-001",
        title: "Welcome to TrackMate",
        message: "Authentication is currently frozen in demo mode. All features are ready to explore!",
        type: "system",
        is_read: false,
        created_at: now,
      },
      {
        id: "notif-2",
        user_id: "demo-user-001",
        title: "Task Reminder",
        message: "Review Q4 product roadmap is due tomorrow.",
        type: "task",
        is_read: false,
        created_at: now,
      },
    ],
  };
}

export function getDemoStore(): DemoStore {
  if (!globalForDemo.__trackmateDemoStore) {
    globalForDemo.__trackmateDemoStore = createInitialStore();
  }
  return globalForDemo.__trackmateDemoStore;
}

export function filterDemoTasks(tasks: Task[], filters?: TaskFilters): Task[] {
  let result = [...tasks];
  if (filters?.status && filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    result = result.filter((t) => t.priority === filters.priority);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }
  const sortBy = filters?.sortBy || "created_at";
  const asc = filters?.sortOrder === "asc";
  result.sort((a, b) => {
    const av = String((a as unknown as Record<string, unknown>)[sortBy] || "");
    const bv = String((b as unknown as Record<string, unknown>)[sortBy] || "");
    return asc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  return result;
}
