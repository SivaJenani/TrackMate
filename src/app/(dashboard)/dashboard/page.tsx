"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Crown, Dumbbell, Flame, Heart, Trophy } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardStats, Habit, HabitLog, Task } from "@/types";

const CYAN = "#36d2ff";
const MUTED = "#8b9480";
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHORT_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shift = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const normalize = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase();

function maxStreakDays(logs: HabitLog[]) {
  const byHabit = new Map<string, Set<string>>();
  for (const log of logs) {
    const days = byHabit.get(log.habit_id) ?? new Set<string>();
    days.add(log.completed_date.slice(0, 10));
    byHabit.set(log.habit_id, days);
  }
  let longest = 0;
  for (const days of byHabit.values()) {
    const sorted = [...days].sort();
    let run = 0;
    let prev = "";
    for (const day of sorted) {
      const date = new Date(`${day}T12:00:00`);
      const prior = new Date(date); prior.setDate(prior.getDate() - 1);
      run = prev === iso(prior) ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = day;
    }
  }
  return longest;
}

function Ring({ value, size = 92 }: { value: number; size?: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, value));
  return <svg aria-label={`${safe}% complete`} role="img" width={size} height={size} viewBox="0 0 100 100" className="shrink-0 -rotate-90">
    <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(54,210,255,.12)" strokeWidth="8" />
    <circle cx="50" cy="50" r={radius} fill="none" stroke={CYAN} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - safe / 100)} />
    <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" className="rotate-90" transform="rotate(90 50 50)" fill="#f1f3eb" fontSize="20" fontWeight="700">{safe}%</text>
  </svg>;
}

function panel(extra = "") {
  return `rounded-2xl border border-white/[0.08] bg-[#101416] shadow-[0_8px_30px_rgba(0,0,0,.18)] ${extra}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [weekSelection, setWeekSelection] = useState<"this" | "last">("this");
  const now = useMemo(() => new Date(), []);
  const today = iso(now);
  const dates = useMemo(() => {
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => shift(monday, i));
  }, [now]);
  const historyDates = useMemo(() => {
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return Array.from({ length: 84 }, (_, i) => shift(monday, i - 77));
  }, [now]);
  const historyStart = iso(historyDates[0]);
  const weekDays = dates.map(iso);
  const selectedWeekDates = weekSelection === "this" ? dates : dates.map((date) => shift(date, -7));

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const [s, t, h, l] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/tasks?sortBy=updated_at&sortOrder=desc"),
          fetch("/api/habits"),
          fetch(`/api/habits/logs?startDate=${historyStart}&endDate=${today}`),
        ]);
        if (!live) return;
        if (s.ok) setStats(await s.json());
        if (t.ok) setTasks(await t.json());
        if (h.ok) setHabits(await h.json());
        if (l.ok) setLogs(await l.json());
      } catch (e) { console.error(e); }
    };
    load();
    return () => { live = false; };
  }, [historyStart, today]);

  const uniqueHabits = useMemo(() => habits.filter((habit, index, all) =>
    all.findIndex((candidate) => normalize(candidate.name) === normalize(habit.name)) === index
  ), [habits]);
  const logsByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const log of logs) {
      const days = map.get(log.habit_id) ?? new Set<string>();
      days.add(log.completed_date.slice(0, 10));
      map.set(log.habit_id, days);
    }
    return map;
  }, [logs]);
  const currentStreak = Math.max(0, ...uniqueHabits.map((habit) => habit.streak || 0));
  const longestStreak = maxStreakDays(logs);
  const weekChart = selectedWeekDates.map((date, i) => {
    const key = iso(date);
    const completed = uniqueHabits.filter((habit) => logsByHabit.get(habit.id)?.has(key)).length;
    return { day: DAY_NAMES[i].toUpperCase(), date: date.getDate(), value: uniqueHabits.length ? Math.round((completed / uniqueHabits.length) * 100) : 0, completed };
  });
  const overallChart = weekDays.map((day, i) => {
    const completed = uniqueHabits.filter((habit) => logsByHabit.get(habit.id)?.has(day)).length;
    return { day: DAY_NAMES[i].toUpperCase(), date: dates[i].getDate(), value: uniqueHabits.length ? Math.round((completed / uniqueHabits.length) * 100) : 0, completed };
  });
  const completionPercentForRange = (start: Date, days: number) => {
    if (!uniqueHabits.length) return 0;
    let completed = 0;
    for (let i = 0; i < days; i++) {
      const key = iso(shift(start, i));
      completed += uniqueHabits.filter((habit) => logsByHabit.get(habit.id)?.has(key)).length;
    }
    return Math.round((completed / (uniqueHabits.length * days)) * 100);
  };
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const elapsedMonthDays = now.getDate();
  const currentMonthRate = completionPercentForRange(monthStart, elapsedMonthDays);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  const previousMonthComparableDays = Math.min(elapsedMonthDays, previousMonthDays);
  const previousMonthRate = completionPercentForRange(previousMonthStart, previousMonthComparableDays);
  const monthlyChange = currentMonthRate - previousMonthRate;
  const monthStats = useMemo(() => {
    const monthKeys = [...new Set(historyDates.filter((date) => date.getDate() === 1).map((date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`))];
    return monthKeys.map((key) => {
      const [year, month] = key.split("-").map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      const days = end.getDate();
      const inRange = start >= historyDates[0] && end <= now;
      let completed = 0;
      for (let i = 0; i < days; i++) {
        const date = shift(start, i);
        if (date > now) break;
        const dateKey = iso(date);
        completed += uniqueHabits.filter((habit) => logsByHabit.get(habit.id)?.has(dateKey)).length;
      }
      const elapsedDays = Math.min(days, start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear() ? now.getDate() : days);
      const rate = uniqueHabits.length && elapsedDays ? Math.round((completed / (uniqueHabits.length * elapsedDays)) * 100) : 0;
      return { key, rate, inRange };
    });
  }, [historyDates, now, uniqueHabits, logsByHabit]);
  const bestMonthRate = monthStats.filter((item) => item.inRange).reduce((best, item) => Math.max(best, item.rate), 0);
  const weekTotal = weekDays.reduce((sum, day) => sum + uniqueHabits.filter((h) => logsByHabit.get(h.id)?.has(day)).length, 0);
  const weekPossible = uniqueHabits.length * 7;
  const weekPercent = weekPossible ? Math.round((weekTotal / weekPossible) * 100) : 0;
  const monthlyConsistency = currentMonthRate;
  const tasksDone = tasks.filter((task) => task.status === "completed").length;
  const moduleIcons = [Dumbbell, Activity, Heart, Crown];
  const heatmapWeeks = Array.from({ length: 12 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => historyDates[weekIndex * 7 + dayIndex])
  );
  const monthLabels = heatmapWeeks.map((week, index) => {
    const monthDay = week.find((date) => date.getDate() === 1);
    if (monthDay) return monthDay.toLocaleDateString("en", { month: "short" }).toUpperCase();
    if (index === 0) return week[0].toLocaleDateString("en", { month: "short" }).toUpperCase();
    return "";
  });

  return <div className="dashboard-redesign min-h-screen space-y-4 bg-[#080d0f] text-[#f0f2e9] sm:space-y-5" style={{ "--dash-accent": CYAN } as React.CSSProperties}>
    <style jsx global>{`
      body:has(.dashboard-redesign) > div:not([data-rht-toaster]) { background: #080d0f !important; }
      body:has(.dashboard-redesign) > [data-rht-toaster] { background: transparent !important; pointer-events: none; }
      body:has(.dashboard-redesign) > [data-rht-toaster]:empty { z-index: 0 !important; }
      body:has(.dashboard-redesign) header { background: rgba(8,13,15,.9) !important; border-color: rgba(255,255,255,.08) !important; }
      body:has(.dashboard-redesign) header h1 { color: #f0f2e9 !important; }
      body:has(.dashboard-redesign) header a,
      body:has(.dashboard-redesign) header button { color: #9baab0 !important; }
    `}</style>
    <style jsx global>{`
      .dashboard-redesign .dash-accent { color: ${CYAN}; }
      .dashboard-redesign .dash-border { border-color: rgba(54,210,255,.22); }
      .dashboard-redesign .dash-glow { box-shadow: 0 0 22px rgba(54,210,255,.08), inset 0 0 18px rgba(54,210,255,.025); }
      .dashboard-redesign .dash-kicker { color: #9ceaff; font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 600; }
      .dashboard-redesign .dash-gridline { stroke: rgba(255,255,255,.08); }
      .dashboard-redesign .dash-axis { fill: ${MUTED}; font-size: 10px; }
      .dashboard-redesign .recharts-cartesian-axis-tick-value { fill: ${MUTED}; }
    `}</style>

    <section className={`${panel("dash-border dash-glow")} relative overflow-hidden p-6 sm:p-8 lg:p-10`}>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_80%_50%,rgba(54,210,255,.10),transparent_62%)]" />
      <div className="relative max-w-3xl">
        <p className="dash-kicker mb-3">Your discipline dashboard</p>
        <h1 className="max-w-2xl text-4xl font-extrabold uppercase leading-[.98] tracking-tight text-[#f0f2e9] sm:text-5xl lg:text-6xl">Discipline today,<br /><span className="dash-accent">freedom</span> tomorrow.</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#9baab0] sm:text-base">Discipline is the bridge between <span className="text-[#9ceaff]">goals</span> and accomplishment.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3"><div className="text-xs text-[#8b9480]">Tasks completed</div><div className="mt-1 text-xl font-bold text-white">{tasksDone}<span className="ml-1 text-sm font-medium text-[#8b9480]">/ {tasks.length}</span></div></div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3"><div className="text-xs text-[#8b9480]">Habit consistency this week</div><div className="mt-1 text-xl font-bold text-white">{weekPercent}<span className="ml-1 text-sm font-medium text-[#8b9480]">%</span></div></div>
        </div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      <div className={`${panel("dash-border p-4 sm:p-5 lg:col-span-2")} dash-glow`}>
        <div className="mb-3 flex items-center justify-between gap-3"><div><p className="dash-kicker">Overall progress</p><p className="mt-1 text-xs text-[#86969c]">Habit consistency · Monday to Sunday</p></div><div className="text-right"><span className="text-lg font-bold dash-accent">{monthlyChange >= 0 ? "+" : ""}{monthlyChange}%</span><p className="text-[10px] text-[#86969c]">vs last month</p></div></div>
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={overallChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="dashboardProgressFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CYAN} stopOpacity={0.24} /><stop offset="100%" stopColor={CYAN} stopOpacity={0.015} /></linearGradient></defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
            <XAxis dataKey="day" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
            <Tooltip formatter={(value) => [`${value}%`, "Completion"]} labelFormatter={(label, payload) => payload?.[0]?.payload?.date ? `${label} ${payload[0].payload.date}` : label} contentStyle={{ background: "#12191b", border: "1px solid rgba(54,210,255,.24)", borderRadius: 10, color: "#f0f2e9", fontSize: 12 }} labelStyle={{ color: CYAN }} />
            <Area isAnimationActive={false} type="monotone" dataKey="value" name="Completion" stroke={CYAN} strokeWidth={3} fill="url(#dashboardProgressFill)" dot={{ r: 3, fill: CYAN, stroke: "#101416", strokeWidth: 2 }} activeDot={{ r: 5, fill: CYAN, stroke: "#101416", strokeWidth: 2 }} />
          </AreaChart></ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className={`${panel("dash-border p-5")} flex items-center justify-between gap-4`}>
          <div><p className="dash-kicker">Current streak</p><div className="mt-2 flex items-baseline gap-2"><span className="text-5xl font-extrabold text-[#9ceaff]">{currentStreak}</span><span className="text-sm font-semibold uppercase tracking-wider text-[#9baab0]">days</span></div><p className="mt-1 text-xs text-[#86969c]">from consecutive habit logs</p></div><Flame className="h-16 w-16 shrink-0 text-[#36d2ff] drop-shadow-[0_0_14px_rgba(54,210,255,.45)]" strokeWidth={1.5} />
        </div>
        <div className={`${panel("dash-border p-5")} flex items-center justify-between gap-4`}>
          <div><p className="dash-kicker">Longest streak</p><div className="mt-2 flex items-baseline gap-2"><span className="text-4xl font-extrabold text-[#9ceaff]">{longestStreak}</span><span className="text-sm font-semibold uppercase tracking-wider text-[#9baab0]">days</span></div><p className="mt-1 text-xs text-[#86969c]">best consecutive run recorded</p></div><Trophy className="h-11 w-11 shrink-0 text-[#36d2ff]" strokeWidth={1.6} />
        </div>
      </div>
    </section>

    <section className={`${panel("dash-border p-4 sm:p-5")}`}>
      <div className="mb-4 flex items-end justify-between gap-3"><div><p className="dash-kicker">Modules</p><h2 className="mt-1 text-xl font-bold text-[#ecf0e5]">Your habits, in motion</h2></div><a href="/habits" className="inline-flex items-center gap-1 text-xs font-semibold text-[#36d2ff] hover:text-[#9ceaff]">All habits <ArrowUpRight className="h-3.5 w-3.5" /></a></div>
      {uniqueHabits.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {uniqueHabits.map((habit, index) => {
          const days = logsByHabit.get(habit.id) ?? new Set<string>();
          const complete = weekDays.filter((day) => days.has(day)).length;
          const ratio = Math.round(complete / 7 * 100);
          const Icon = moduleIcons[index % moduleIcons.length];
          return <article key={habit.id} className="rounded-xl border border-white/[0.08] bg-[#0b0f11] p-4">
            <div className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-[#36d2ff]" /><h3 className="truncate text-xs font-semibold uppercase tracking-wide text-[#dce1d5]">{habit.name}</h3></div><span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#36d2ff]"><Flame className="h-3.5 w-3.5" />{habit.streak}</span></div>
            <div className="mt-4 flex items-center justify-center"><Ring value={ratio} /></div>
            <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[.14em] text-[#9baab0]">{complete} / 7 days</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5">{dates.map((day, i) => {
              const isDone = days.has(iso(day));
              return <div key={iso(day)} className="flex flex-col items-center gap-1"><span className="text-[8px] text-[#74848a]">{SHORT_DAYS[i]}</span><span className={`h-4 w-full rounded-sm ${isDone ? "bg-[#36d2ff] shadow-[0_0_8px_rgba(54,210,255,.25)]" : "bg-white/[0.07]"}`} aria-label={`${habit.name}, ${DAY_NAMES[i]} ${isDone ? "completed" : "not completed"}`} /></div>;
            })}</div>
            <p className="mt-3 truncate text-[10px] text-[#87969a]">{habit.frequency} · {habit.description || "Keep showing up"}</p>
          </article>;
        })}
      </div> : <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-[#86969c]">No habits yet. Add one to start building your streak.</p>}
    </section>

    <section className={`${panel("dash-border p-4 sm:p-5")}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-5">
        <div className="min-w-0"><div className="mb-2 flex items-end justify-between gap-3"><p className="dash-kicker">Consistency</p><span className="shrink-0 text-[9px] text-[#758c94] sm:text-[10px]">LESS <span className="mx-1 text-[#36d2ff]">■ ▪ ■ ▪ ■</span> MORE</span></div>
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className="flex shrink-0 flex-col gap-y-[3px] pt-[17px] text-[7px] font-medium leading-3 tracking-wide text-[#84949a] sm:gap-y-1 sm:pt-5 sm:text-[8px]">{["MON", "WED", "FRI"].map((day) => <span key={day} className="h-3 leading-3 sm:h-[18px] sm:leading-[18px]">{day}</span>)}</div>
            <div className="min-w-0 overflow-x-auto pb-1">
              <div className="grid w-max grid-flow-col grid-rows-[14px_repeat(7,12px)] auto-cols-[12px] gap-x-[3px] gap-y-[3px] pb-1 sm:grid-rows-[16px_repeat(7,18px)] sm:auto-cols-[18px] sm:gap-x-1 sm:gap-y-1" aria-label="Habit consistency heatmap, last 12 weeks">
                {heatmapWeeks.map((week, weekIndex) => {
                  const monthLabel = monthLabels[weekIndex];
                  return <div key={`week-${weekIndex}`} className="contents">
                    <span className="h-3 text-[7px] leading-3 text-[#84949a] sm:text-[8px]">{monthLabel}</span>
                    {week.map((day) => {
                      const amount = logs.filter((log) => log.completed_date.slice(0, 10) === iso(day)).length;
                      const isFuture = day > now;
                      const shade = amount === 0 ? "bg-white/[0.06]" : amount === 1 ? "bg-[#16718e]" : amount === 2 ? "bg-[#229fc1]" : "bg-[#36d2ff] shadow-[0_0_8px_rgba(54,210,255,.34)]";
                      return <span key={iso(day)} title={`${iso(day)} · ${amount} habit ${amount === 1 ? "log" : "logs"}`} className={`h-3 w-3 rounded-[3px] ${isFuture ? "bg-transparent" : shade} sm:h-[18px] sm:w-[18px] sm:rounded-[4px]`} />;
                    })}
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 border-l border-white/[0.08] py-1 pl-3 sm:gap-6 sm:pl-5">
          <div><p className="text-[9px] font-medium uppercase tracking-wide text-[#84949a] sm:text-[10px]">This Month</p><p className="mt-1 text-2xl font-extrabold leading-none text-[#36d2ff] sm:text-3xl">{monthlyConsistency}%</p><p className="mt-1 text-[8px] uppercase text-[#74848a] sm:text-[9px]">Consistency</p></div>
          <div><p className="text-[9px] font-medium uppercase tracking-wide text-[#84949a] sm:text-[10px]">Best Month</p><p className="mt-1 text-2xl font-extrabold leading-none text-[#dce1d5] sm:text-3xl">{bestMonthRate}%</p><p className="mt-1 text-[8px] uppercase text-[#74848a] sm:text-[9px]">Consistency</p></div>
        </div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <div className={`${panel("dash-border p-4 sm:p-5")}`}>
        <div className="mb-4 flex items-center justify-between"><div><p className="dash-kicker">Streaks</p><p className="mt-1 text-xs text-[#86969c]">Current runs by habit</p></div><Flame className="h-5 w-5 text-[#36d2ff]" /></div>
        <ul className="space-y-3">{[...uniqueHabits].sort((a, b) => b.streak - a.streak).map((habit) => <li key={habit.id} className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2 last:border-0"><span className="flex min-w-0 items-center gap-2 truncate text-sm text-[#d9ded2]"><Flame className="h-4 w-4 shrink-0 text-[#36d2ff]" />{habit.name}</span><span className="shrink-0 text-xs font-bold text-[#36d2ff]">{habit.streak} days</span></li>)}{!uniqueHabits.length && <li className="py-4 text-center text-sm text-[#86969c]">No streaks yet. Log a habit to start one.</li>}</ul>
      </div>
      <div className={`${panel("dash-border p-4 sm:p-5")}`}>
        <div className="mb-3 flex items-center justify-between gap-3"><div><p className="dash-kicker">Weekly progress</p><p className="mt-1 text-xs text-[#86969c]">Habit completion by day</p></div><label className="relative"><span className="sr-only">Select week</span><select value={weekSelection} onChange={(event) => setWeekSelection(event.target.value as "this" | "last")} className="appearance-none rounded-lg border border-white/10 bg-[#101416] py-1.5 pl-3 pr-7 text-[10px] font-medium text-[#9baab0] focus:outline-none focus:ring-1 focus:ring-[#36d2ff]"><option value="this">This Week</option><option value="last">Last Week</option></select><span aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#9baab0]">⌄</span></label></div>
        <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
          <XAxis dataKey="day" tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: MUTED, fontSize: 10 }} tickLine={false} axisLine={false} width={56} />
          <Tooltip formatter={(value, _name, item) => [`${value}%${item.payload.completed !== undefined ? ` (${item.payload.completed} / ${uniqueHabits.length} habits)` : ""}`, "Completion"]} contentStyle={{ background: "#12191b", border: "1px solid rgba(54,210,255,.24)", borderRadius: 10, color: "#f0f2e9", fontSize: 12 }} />
          <Bar dataKey="value" name="Completion" fill={CYAN} radius={[6, 6, 0, 0]} maxBarSize={30} isAnimationActive={false} />
        </BarChart></ResponsiveContainer></div>
      </div>
    </section>

    <footer className={`${panel("dash-border flex flex-col items-center gap-2 px-5 py-4 text-center sm:flex-row sm:justify-between")}`}><p className="text-[10px] font-semibold uppercase tracking-[.28em] text-[#9aabb0]">Discipline is choosing what you want most</p><p className="text-xs italic text-[#b1c6ce]">“Small steps every day add up to big change.”</p></footer>
  </div>;
}
