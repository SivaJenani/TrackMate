import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TaskPriority, TaskStatus } from '@/types';

/**
 * Merge Tailwind classes with clsx + tailwind-merge for conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string or Date object to "MMM dd, yyyy" (e.g. "Nov 25, 2026").
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date as a human-readable relative string.
 * Examples: "just now", "2 minutes ago", "3 hours ago", "yesterday", "5 days ago"
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return '1 week ago';
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;

  return formatDate(d);
}

/**
 * Calculate productivity as a percentage (0–100). Returns 0 when total is 0.
 */
export function calculateProductivity(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Return a time-of-day greeting.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Count the current streak of consecutive days (ending today or yesterday)
 * from an array of ISO date strings.
 */
export function getStreakCount(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(dates.map((d) => new Date(d).toISOString().split('T')[0]))
  ).sort((a, b) => b.localeCompare(a)); // newest first

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Streak must start from today or yesterday
  if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const current = new Date(uniqueDays[i - 1]);
    const previous = new Date(uniqueDays[i]);
    const diffDays = Math.round(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Return a Tailwind text-color class for a task priority.
 */
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-amber-500';
    case 'low':
      return 'text-emerald-500';
    default:
      return 'text-slate-400';
  }
}

/**
 * Return a Tailwind text-color class for a task status.
 */
export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'text-emerald-500';
    case 'in_progress':
      return 'text-cyan-500';
    case 'todo':
      return 'text-slate-400';
    default:
      return 'text-slate-400';
  }
}

/**
 * Return a human-readable label for a task status.
 */
export function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'todo':
      return 'To Do';
    default:
      return 'Unknown';
  }
}

/**
 * Return the number of whole days from now until the given date.
 * Positive = future, negative = past (overdue).
 */
export function getDaysUntil(date: string): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
