import { z } from 'zod';

// ── Task Schemas ──────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .nullable()
    .optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z
    .string()
    .max(50, 'Category must be 50 characters or fewer')
    .nullable()
    .optional(),
  deadline: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .nullable()
    .optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z
    .string()
    .max(50, 'Category must be 50 characters or fewer')
    .nullable()
    .optional(),
  deadline: z.string().nullable().optional(),
});

// ── Goal Schemas ──────────────────────────────────────────────────────────────

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .nullable()
    .optional(),
  target_date: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
});

export const updateGoalSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .nullable()
    .optional(),
  target_date: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
});

// ── Habit Schemas ─────────────────────────────────────────────────────────────

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .nullable()
    .optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Must be a valid hex color')
    .default('#00B4F0'),
  icon: z.string().max(40).nullable().optional(),
  goal_days: z.number().int().min(1).max(31).nullable().optional(),
});

// ── Milestone Schema ──────────────────────────────────────────────────────────

export const createMilestoneSchema = z.object({
  goal_id: z.string().uuid('Invalid goal ID'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
});

// ── Auth Schemas ──────────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be 100 characters or fewer'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ── Profile / Settings Schemas ────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer'),
  avatar_url: z.string().url('Must be a valid URL').nullable().optional(),
});

export const updateSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  task_reminders: z.boolean(),
  habit_reminders: z.boolean(),
  goal_reminders: z.boolean(),
  theme: z.enum(['light', 'dark', 'system']),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
