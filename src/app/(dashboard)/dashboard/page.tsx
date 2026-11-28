"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, CheckSquare, Flame, Flag, Target, Trophy, Zap } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getHabitIcon } from "@/lib/habit-icons";
import type { Goal, Habit, HabitLog, Task } from "@/types";

const ACCENT = "#36d2ff";
const ACCENT_SOFT = "#9ceaff";
const MUTED = "#8b9480";
const TEXT = "#f0f2e9";
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shift = (date: Date, days: number) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const localDay = (value: string) => iso(new Date(value));
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
    let run = 0;
    let prev = "";
    for (const day of [...days].sort()) {
      const date = new Date(`${day}T12:00:00`);
      run = prev === iso(shift(date, -1)) ? run + 1 : 1;
      longest = Math.max(longest, run);
      prev = day;
    }
  }
  return longest;
}

function ago(value: string, now: Date) {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(value).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

const card = "rounded-2xl border border-white/[0.08] bg-[#132130]";

function Ring({ value, size = 64 }: { value: number; size?: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const safe = Math.max(0, Math.min(100, value));
  return (
    <svg role="img" aria-label={`${safe}% complete`} width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={ACCENT} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - safe / 100)} transform="rotate(-90 50 50)" />
      <text x="50" y="51" textAnchor="middle" dominantBaseline="middle" fill={TEXT} fontSize="22" fontWeight="700">{safe}%</text>
    </svg>
  );
}

function Donut({ rows, center }: { rows: { label: string; value: number | null; opacity: number }[]; center: number | null }) {
  const radii = [44, 33, 22];
  return (
    <svg role="img" aria-label="Overall progress" viewBox="0 0 110 110" className="h-40 w-40 shrink-0">
      {rows.map((row, i) => {
        const c = 2 * Math.PI * radii[i];
        const v = Math.max(0, Math.min(100, row.value ?? 0));
        return (
          <g key={row.label} transform="rotate(-90 55 55)">
            <circle cx="55" cy="55" r={radii[i]} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
            <circle cx="55" cy="55" r={radii[i]} fill="none" stroke={ACCENT} strokeOpacity={row.opacity} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
          </g>
        );
      })}
      <text x="55" y="53" textAnchor="middle" dominantBaseline="middle" fill={TEXT} fontSize="15" fontWeight="700">{center === null ? "--" : `${center}%`}</text>
      <text x="55" y="66" textAnchor="middle" fill={MUTED} fontSize="6">Overall</text>
    </svg>
  );
}

function HeroScene() {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 280" preserveAspectRatio="xMaxYMax slice" className="absolute inset-y-0 right-0 hidden h-full w-[62%] sm:block">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity=".10" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" /></linearGradient>
        <linearGradient id="fadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#132130" /><stop offset=".45" stopColor="#132130" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="600" height="280" fill="url(#sky)" />
      <circle cx="400" cy="150" r="92" fill="none" stroke={ACCENT} strokeOpacity=".55" strokeWidth="1.5" />
      <circle cx="400" cy="150" r="104" fill="none" stroke={ACCENT} strokeOpacity=".18" strokeWidth="1" />
      <path d="M0 280 L0 215 L70 170 L120 195 L210 110 L270 160 L340 70 L395 125 L450 90 L520 150 L600 105 L600 280 Z" fill="#0d1a1f" />
      <path d="M0 280 L0 240 L90 205 L160 225 L260 160 L340 215 L420 170 L500 215 L600 180 L600 280 Z" fill="#12242b" />
      <path d="M210 110 L240 140 L225 138 L215 150 L200 132 Z M340 70 L372 108 L356 104 L346 120 L330 100 Z M450 90 L474 116 L460 112 L452 124 L440 108 Z" fill={ACCENT_SOFT} fillOpacity=".55" />
      <path d="M0 215 L70 170 L120 195 L210 110 L270 160 L340 70 L395 125 L450 90 L520 150 L600 105" fill="none" stroke={ACCENT} strokeOpacity=".5" strokeWidth="1.2" />
      <rect width="600" height="280" fill="url(#fadeL)" />
    </svg>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-[#86969c]">{text}</p>;
}

function CardHead({ icon: Icon, title, sub, right }: { icon: typeof Target; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[#36d2ff]"><Icon className="h-4 w-4" strokeWidth={1.75} /></span>
        <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-[#f0f2e9]">{title}</h2>{sub && <p className="mt-0.5 text-[11px] text-[#86969c]">{sub}</p>}</div>
      </div>
      {right}
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const now = useMemo(() => new Date(), []);
  const today = iso(now);
  const historyStart = iso(shift(now, -84));

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [t, g, h, l] = await Promise.all([
          fetch("/api/tasks?sortBy=updated_at&sortOrder=desc"),
          fetch("/api/goals"),
          fetch("/api/habits"),
          fetch(`/api/habits/logs?startDate=${historyStart}&endDate=${today}`),
        ]);
        if (!live) return;
        if (t.ok) setTasks(await t.json());
        if (g.ok) setGoals(await g.json());
        if (h.ok) setHabits(await h.json());
        if (l.ok) setLogs(await l.json());
      } catch (e) { console.error(e); }
      finally { if (live) setLoaded(true); }
    })();
    return () => { live = false; };
  }, [historyStart, today]);

  const toggleTask = useCallback(async (task: Task) => {
    const next = task.status === "completed" ? "todo" : "completed";
    const stamp = new Date().toISOString();
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: next, updated_at: stamp } : t)));
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (!res.ok) throw new Error("failed");
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  }, []);

  const uniqueHabits = useMemo(() => habits.filter((h, i, all) => all.findIndex((c) => normalize(c.name) === normalize(h.name)) === i), [habits]);
  const logDays = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const log of logs) {
      const days = map.get(log.habit_id) ?? new Set<string>();
      days.add(log.completed_date.slice(0, 10));
      map.set(log.habit_id, days);
    }
    return map;
  }, [logs]);

  const doneOn = useCallback((key: string) => uniqueHabits.filter((h) => logDays.get(h.id)?.has(key)).length, [uniqueHabits, logDays]);
  const rateFor = useCallback((end: Date, days: number) => {
    if (!uniqueHabits.length) return null;
    let done = 0;
    for (let i = 0; i < days; i++) done += doneOn(iso(shift(end, -i)));
    return Math.round((done / (uniqueHabits.length * days)) * 100);
  }, [uniqueHabits, doneOn]);

  const tasksTotal = tasks.length;
  const tasksDone = tasks.filter((t) => t.status === "completed").length;
  const taskPct = tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const habitWeek = rateFor(now, 7);
  const habitPrev = rateFor(shift(now, -7), 7);
  const habitDelta = habitWeek !== null && habitPrev !== null ? habitWeek - habitPrev : null;
  const currentStreak = Math.max(0, ...uniqueHabits.map((h) => h.streak || 0));
  const longestStreak = maxStreakDays(logs);

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const date = shift(now, i - 6);
    const done = doneOn(iso(date));
    return { day: DAY[date.getDay()], value: uniqueHabits.length ? Math.round((done / uniqueHabits.length) * 100) : 0, done };
  });

  const activeGoals = goals.filter((g) => g.status === "active");
  const goalRows = [...activeGoals].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 4);
  const goalAvg = goals.length ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : null;

  const trend = useMemo(() => {
    return Array.from({ length: range }, (_, i) => {
      const date = shift(now, i - (range - 1));
      const key = iso(date);
      const existing = tasks.filter((t) => localDay(t.created_at) <= key);
      const done = existing.filter((t) => t.status === "completed" && localDay(t.updated_at) <= key).length;
      return {
        label: range === 7 ? DAY[date.getDay()] : date.toLocaleDateString("en", { month: "short", day: "numeric" }),
        value: existing.length ? Math.round((done / existing.length) * 100) : null,
      };
    });
  }, [tasks, range, now]);
  const trendHasData = trend.some((p) => p.value !== null);

  const dueToday = tasks.filter((t) => t.deadline && localDay(t.deadline) <= today && (t.status !== "completed" || localDay(t.deadline) === today));
  const fallbackOpen = !dueToday.length;
  const todayList = (fallbackOpen ? tasks.filter((t) => t.status !== "completed") : dueToday).slice(0, 6);
  const todayDone = todayList.filter((t) => t.status === "completed").length;
  const todayPct = todayList.length ? Math.round((todayDone / todayList.length) * 100) : 0;

  const overallRows = [
    { label: "Tasks", value: tasksTotal ? taskPct : null, opacity: 1 },
    { label: "Habits", value: habitWeek, opacity: 0.6 },
    { label: "Goals", value: goalAvg, opacity: 0.35 },
  ];
  const available = overallRows.filter((r) => r.value !== null) as { value: number }[];
  const overall = available.length ? Math.round(available.reduce((s, r) => s + r.value, 0) / available.length) : null;

  const activity = useMemo(() => {
    const items: { at: string; text: string; icon: typeof Flame }[] = [];
    for (const t of tasks) if (t.status === "completed") items.push({ at: t.updated_at, text: `Completed "${t.title}"`, icon: CheckSquare });
    const names = new Map(habits.map((h) => [h.id, h.name]));
    for (const l of logs) if (names.has(l.habit_id)) items.push({ at: l.created_at, text: `Logged "${names.get(l.habit_id)}"`, icon: Flame });
    for (const g of goals) items.push({ at: g.updated_at, text: g.status === "completed" ? `Completed goal "${g.title}"` : `Updated goal "${g.title}" (${g.progress}%)`, icon: Target });
    return items.sort((a, b) => b.at.localeCompare(a.at));
  }, [tasks, habits, logs, goals]);
  const activityShown = activity.slice(0, showAllActivity ? 15 : 5);

  const axis = { fill: MUTED, fontSize: 10 };
  const tip = { background: "#12191b", border: "1px solid rgba(54,210,255,.24)", borderRadius: 10, color: TEXT, fontSize: 12 };

  return (
    <div className="space-y-4 text-[#f0f2e9] sm:space-y-5">
      <section className={`${card} relative overflow-hidden p-6 sm:p-8`}>
        <HeroScene />
        <div className="relative max-w-xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[#9ceaff]">Your discipline dashboard</p>
          <h1 className="text-4xl font-extrabold uppercase leading-[1] tracking-tight sm:text-5xl">Discipline today,<br /><span style={{ color: ACCENT }}>freedom</span> tomorrow.</h1>
          <p className="mt-4 flex items-start gap-2 text-sm italic text-[#9baab0] sm:text-base"><span aria-hidden="true" className="text-2xl font-bold not-italic leading-none text-[#36d2ff]">&ldquo;</span>Consistency in the small things creates extraordinary results.</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        <div className={`${card} flex items-center justify-between gap-3 p-4`}>
          <div className="min-w-0"><p className="text-xs text-[#9baab0]">Tasks Completed</p><p className="mt-1 text-2xl font-bold">{tasksDone}<span className="text-base font-medium text-[#86969c]"> / {tasksTotal}</span></p></div>
          <Ring value={taskPct} />
        </div>
        <div className={`${card} p-4`}>
          <p className="text-xs text-[#9baab0]">Habit Consistency</p>
          <p className="mt-1 text-2xl font-bold">{habitWeek === null ? "--" : `${habitWeek}%`}</p>
          <p className="mt-1 text-[11px] text-[#86969c]">{habitDelta === null ? "No habit data yet" : <><span className="font-semibold text-[#36d2ff]">{habitDelta >= 0 ? "+" : ""}{habitDelta}%</span> vs last week</>}</p>
        </div>
        <div className={`${card} flex items-center justify-between gap-3 p-4`}>
          <div><p className="text-xs text-[#9baab0]">Current Streak</p><p className="mt-1 text-2xl font-bold">{currentStreak}<span className="text-base font-medium text-[#86969c]"> {currentStreak === 1 ? "Day" : "Days"}</span></p></div>
          <Flame className="h-9 w-9 shrink-0 text-[#36d2ff]" strokeWidth={1.5} />
        </div>
        <div className={`${card} flex items-center justify-between gap-3 p-4`}>
          <div><p className="text-xs text-[#9baab0]">Longest Streak</p><p className="mt-1 text-2xl font-bold">{longestStreak}<span className="text-base font-medium text-[#86969c]"> {longestStreak === 1 ? "Day" : "Days"}</span></p></div>
          <Trophy className="h-9 w-9 shrink-0 text-[#36d2ff]" strokeWidth={1.5} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} flex flex-col p-5`}>
          <CardHead icon={Target} title="Goal Progress" sub="Your active goals" right={<Link href="/goals" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#36d2ff] hover:text-[#9ceaff]">View Goals <ArrowUpRight className="h-3 w-3" /></Link>} />
          {goalRows.length ? (
            <ul className="space-y-4">
              {goalRows.map((g) => (
                <li key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="truncate text-[#dce1d5]">{g.title}</span><span className="shrink-0 font-semibold text-[#f0f2e9]">{g.progress}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-[#36d2ff]" style={{ width: `${Math.max(0, Math.min(100, g.progress))}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <Empty text={loaded ? "No active goals yet. Create one in Goals." : "Loading..."} />}
        </div>

        <div className={`${card} flex flex-col p-5`}>
          <CardHead icon={Activity} title="Weekly Habit Consistency" sub="Completion rate, last 7 days" />
          {uniqueHabits.length ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekBars} margin={{ top: 18, right: 4, left: -22, bottom: 0 }} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
                  <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={axis} tickLine={false} axisLine={false} width={44} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,.04)" }} formatter={(v, _n, item) => [`${v}% (${item.payload.done} / ${uniqueHabits.length} habits)`, "Completion"]} contentStyle={tip} />
                  <Bar dataKey="value" fill={ACCENT} radius={[5, 5, 0, 0]} maxBarSize={30} isAnimationActive={false}>
                    <LabelList dataKey="value" position="top" formatter={(v) => `${v}%`} fill={ACCENT_SOFT} fontSize={9} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty text={loaded ? "Add a habit to see your weekly consistency." : "Loading..."} />}
        </div>

        <div className={`${card} flex flex-col p-5`}>
          <CardHead icon={CheckSquare} title="Today's Tasks" sub={todayList.length ? (fallbackOpen ? "Nothing due today, showing open tasks" : `${todayDone} of ${todayList.length} completed`) : undefined} right={todayList.length ? <span className="text-xs font-semibold text-[#9baab0]">{todayPct}%</span> : undefined} />
          {todayList.length ? (
            <>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-[#36d2ff]" style={{ width: `${todayPct}%` }} /></div>
              <ul className="divide-y divide-white/[0.06]">
                {todayList.map((t) => {
                  const done = t.status === "completed";
                  return (
                    <li key={t.id}>
                      <button onClick={() => toggleTask(t)} aria-pressed={done} className="flex w-full items-center gap-3 py-2 text-left text-xs">
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${done ? "border-[#36d2ff] bg-[#36d2ff] text-[#05080B]" : "border-white/25"}`}>{done && <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M2.5 6.5l2.2 2.2L9.5 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
                        <span className={`truncate ${done ? "text-[#74848a] line-through" : "text-[#dce1d5]"}`}>{t.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : <Empty text={loaded ? "No open tasks. Add one in Tasks." : "Loading..."} />}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} flex flex-col p-5`}>
          <CardHead icon={Zap} title="Productivity Trend" sub="Share of tasks completed over time" right={
            <div className="flex shrink-0 rounded-lg border border-white/10 bg-[#0B1620] p-0.5">
              {([7, 30, 90] as const).map((r) => <button key={r} onClick={() => setRange(r)} aria-pressed={range === r} className={`rounded-md px-2 py-1 text-[10px] font-semibold ${range === r ? "bg-[#36d2ff] text-[#05080B]" : "text-[#9baab0] hover:text-white"}`}>{r}D</button>)}
            </div>
          } />
          {trendHasData ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity=".28" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.07)" />
                  <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={axis} tickLine={false} axisLine={false} width={44} />
                  <Tooltip formatter={(v) => [`${v}%`, "Tasks completed"]} contentStyle={tip} />
                  <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#trendFill)" dot={range === 7 ? { r: 3, fill: ACCENT, stroke: "#132130" } : false} connectNulls={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty text={loaded ? "Create tasks to see your completion trend." : "Loading..."} />}
        </div>

        <div className={`${card} flex flex-col p-5`}>
          <CardHead icon={Flag} title="Overall Progress" sub="Tasks, habits and goals" />
          <div className="flex flex-1 flex-wrap items-center justify-center gap-5">
            <Donut rows={overallRows} center={overall} />
            <ul className="space-y-3 text-xs">
              {overallRows.map((r) => (
                <li key={r.label} className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-sm bg-[#36d2ff]" style={{ opacity: r.opacity }} /><span className="w-12 text-[#9baab0]">{r.label}</span><span className="font-semibold">{r.value === null ? "--" : `${r.value}%`}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`${card} flex flex-col p-5`}>
          <CardHead icon={Zap} title="Recent Activity" right={activity.length > 5 ? <button onClick={() => setShowAllActivity((v) => !v)} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#36d2ff] hover:text-[#9ceaff]">{showAllActivity ? "Show less" : "View All"} <ArrowUpRight className="h-3 w-3" /></button> : undefined} />
          {activityShown.length ? (
            <ul className="space-y-3">
              {activityShown.map((a, i) => {
                const Ic = a.icon;
                return (
                  <li key={`${a.at}-${i}`} className="flex items-center gap-3 text-xs">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[#36d2ff]"><Ic className="h-3.5 w-3.5" strokeWidth={1.75} /></span>
                    <span className="min-w-0 flex-1 truncate text-[#dce1d5]">{a.text}</span>
                    <span className="shrink-0 text-[#74848a]">{ago(a.at, now)}</span>
                  </li>
                );
              })}
            </ul>
          ) : <Empty text={loaded ? "Nothing yet. Complete a task or log a habit." : "Loading..."} />}
        </div>
      </section>


      {uniqueHabits.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">Your habits</h2><Link href="/habits" className="inline-flex items-center gap-1 text-xs font-semibold text-[#36d2ff] hover:text-[#9ceaff]">All habits <ArrowUpRight className="h-3 w-3" /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {uniqueHabits.map((h) => {
              const Ic = getHabitIcon(h);
              return (
                <article key={h.id} className={`${card} p-4`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2"><Ic className="h-4 w-4 shrink-0 text-[#36d2ff]" strokeWidth={1.75} /><h3 className="truncate text-xs font-semibold uppercase tracking-wide text-[#dce1d5]">{h.name}</h3></div>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#36d2ff]"><Flame className="h-3.5 w-3.5" />{h.streak}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => { const d = shift(now, i - 6); const on = logDays.get(h.id)?.has(iso(d)); return <div key={i} className="flex flex-col items-center gap-1"><span className="text-[8px] text-[#74848a]">{DAY[d.getDay()][0]}</span><span aria-label={`${h.name}, ${DAY[d.getDay()]} ${on ? "completed" : "not completed"}`} className={`h-4 w-full rounded-sm ${on ? "bg-[#36d2ff]" : "bg-white/[0.07]"}`} /></div>; })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
