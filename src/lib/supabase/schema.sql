-- TrackMate Database Schema
-- Run this in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('task', 'goal', 'habit', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  category TEXT,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status goal_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency habit_frequency DEFAULT 'daily',
  color VARCHAR(7) DEFAULT '#00B4F0',
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  task_reminders BOOLEAN DEFAULT TRUE,
  habit_reminders BOOLEAN DEFAULT TRUE,
  goal_reminders BOOLEAN DEFAULT TRUE,
  theme VARCHAR(10) DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON public.milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS goals_updated_at ON public.goals;
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS habits_updated_at ON public.habits;
CREATE TRIGGER habits_updated_at BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS user_settings_updated_at ON public.user_settings;
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
  CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
  CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
  CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
  CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
  CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
  CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own goals" ON public.goals;
  CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
  CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
  CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view own milestones" ON public.milestones;
  CREATE POLICY "Users can view own milestones" ON public.milestones FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own milestones" ON public.milestones;
  CREATE POLICY "Users can create own milestones" ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own milestones" ON public.milestones;
  CREATE POLICY "Users can update own milestones" ON public.milestones FOR UPDATE USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own milestones" ON public.milestones;
  CREATE POLICY "Users can delete own milestones" ON public.milestones FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
  CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own habits" ON public.habits;
  CREATE POLICY "Users can create own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
  CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
  CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view own habit logs" ON public.habit_logs;
  CREATE POLICY "Users can view own habit logs" ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own habit logs" ON public.habit_logs;
  CREATE POLICY "Users can create own habit logs" ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own habit logs" ON public.habit_logs;
  CREATE POLICY "Users can delete own habit logs" ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
  CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
  CREATE POLICY "Users can create own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
  CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
  CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
  CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
  CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
END $$;
