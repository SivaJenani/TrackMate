export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type NotificationType = 'task' | 'goal' | 'habit' | 'system';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  color: string;
  streak: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  habit_reminders: boolean;
  goal_reminders: boolean;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  active_goals: number;
  current_streak: number;
  productivity_percentage: number;
  weekly_activity: number[];
}

export interface TaskFilters {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  search?: string;
  sortBy?: 'deadline' | 'created_at' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}
