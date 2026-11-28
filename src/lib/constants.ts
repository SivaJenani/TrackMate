import type { TaskStatus, TaskPriority, HabitFrequency } from '@/types';

// ── Brand Colors ──────────────────────────────────────────────────────────────

export const BRAND = {
  black: '#05080B',
  slate: '#0E1A24',
  cyan: '#00B4F0',
  white: '#FFFFFF',
} as const;

// ── Sidebar / Dashboard Navigation ───────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide-react icon name
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
  { label: 'Goals', href: '/goals', icon: 'Target' },
  { label: 'Habits', href: '/habits', icon: 'Flame' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

// ── Select / Filter Options ──────────────────────────────────────────────────

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export const PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const STATUS_OPTIONS: SelectOption<TaskStatus>[] = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export const FREQUENCY_OPTIONS: SelectOption<HabitFrequency>[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

// ── Task Categories ──────────────────────────────────────────────────────────

export const CATEGORIES: string[] = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Education',
  'Shopping',
  'Home',
  'Social',
  'Other',
];

// ── Chart / Recharts Colors ──────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: '#00B4F0',
  secondary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#64748B',
} as const;

export const CHART_PALETTE: string[] = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.muted,
];

// ── Habit Preset Colors ──────────────────────────────────────────────────────

export const HABIT_COLORS: string[] = [
  '#00B4F0', // Cyan (brand)
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
];

// ── Misc ─────────────────────────────────────────────────────────────────────

export const DEFAULT_AVATAR_URL =
  'https://api.dicebear.com/7.x/initials/svg?seed=TM&backgroundColor=00B4F0';

export const ITEMS_PER_PAGE = 10;
