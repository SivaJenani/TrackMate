# TrackMate — Productivity & Personal Progress Tracker

TrackMate is a full-stack productivity and personal progress tracking application built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), Recharts, and Framer Motion.

## Features

- **Authentication**: Sign up, login, logout, forgot password, and protected dashboard routes via Supabase Auth.
- **Dashboard**: Real-time overview of total, completed, pending, and overdue tasks, active goals, habit streaks, productivity percentage, weekly activity chart, and recent tasks.
- **Task Management**: Full CRUD with status (`todo`, `in_progress`, `completed`), priority (`low`, `medium`, `high`), categories, deadlines, search, filtering, and sorting.
- **Goal Management**: Create personal/professional goals, track progress percentages, and manage expandable milestones.
- **Habit Tracker**: Weekly habit grid with daily completion toggles, custom colors, frequencies, and streak tracking.
- **Calendar View**: Monthly calendar displaying tasks on their deadline dates with priority color coding and day-detail modals.
- **Notifications**: Notification center with unread filtering, mark-as-read, mark-all-read, and delete actions.
- **Profile & Settings**: Manage user profile info, notification preferences, and theme settings.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide React
- **Backend**: Next.js API Routes, Supabase SSR
- **Database & Auth**: PostgreSQL on Supabase with Row Level Security (RLS)
- **Validation**: Zod

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up the Database

Open the SQL Editor in your Supabase Dashboard and run the contents of `src/lib/supabase/schema.sql`. This creates all tables (`users`, `tasks`, `goals`, `milestones`, `habits`, `habit_logs`, `notifications`, `user_settings`), enums, indexes, triggers, and Row Level Security policies.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment (Vercel + Supabase)

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables.
4. Deploy.
