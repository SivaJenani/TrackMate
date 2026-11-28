"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Flame, Search, Target } from "lucide-react";
import type { Goal, Habit, Task } from "@/types";

interface Hit { id: string; label: string; kind: "Task" | "Habit" | "Goal"; href: string }

const icons = { Task: CheckSquare, Habit: Flame, Goal: Target };

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Hit[] | null>(null);

  const load = async () => {
    if (items) return;
    try {
      const [t, h, g] = await Promise.all([fetch("/api/tasks"), fetch("/api/habits"), fetch("/api/goals")]);
      const tasks: Task[] = t.ok ? await t.json() : [];
      const habits: Habit[] = h.ok ? await h.json() : [];
      const goals: Goal[] = g.ok ? await g.json() : [];
      setItems([
        ...tasks.map((x) => ({ id: x.id, label: x.title, kind: "Task" as const, href: "/tasks" })),
        ...habits.map((x) => ({ id: x.id, label: x.name, kind: "Habit" as const, href: "/habits" })),
        ...goals.map((x) => ({ id: x.id, label: x.title, kind: "Goal" as const, href: "/goals" })),
      ]);
    } catch { setItems([]); }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
    };
    const onClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick); };
  }, []);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !items) return [];
    return items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, items]);

  const go = (hit: Hit) => { setOpen(false); setQuery(""); router.push(hit.href); };

  return (
    <div ref={boxRef} className="relative hidden w-full max-w-sm md:block">
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0F1424] px-3 py-2 text-sm focus-within:border-[#36d2ff]/60">
        <Search className="h-4 w-4 shrink-0 text-[#8fa0a6]" />
        <input
          ref={inputRef} value={query} placeholder="Search tasks, habits, goals..." aria-label="Search tasks, habits, goals"
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); load(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && hits[0]) go(hits[0]); }}
          className="w-full bg-transparent text-sm text-[#ecf0e5] outline-none placeholder:text-[#66767c]"
        />
        <kbd className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-[#8fa0a6]">⌘ K</kbd>
      </label>
      {open && query.trim() && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0F1424] shadow-xl">
          {items === null ? <li className="px-3 py-3 text-xs text-[#8fa0a6]">Searching...</li>
            : hits.length === 0 ? <li className="px-3 py-3 text-xs text-[#8fa0a6]">No matches</li>
            : hits.map((h) => {
                const Ic = icons[h.kind];
                return (
                  <li key={`${h.kind}-${h.id}`}>
                    <button onClick={() => go(h)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-white/5">
                      <Ic className="h-4 w-4 shrink-0 text-[#36d2ff]" strokeWidth={1.75} />
                      <span className="min-w-0 flex-1 truncate text-[#dce1d5]">{h.label}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-wide text-[#74848a]">{h.kind}</span>
                    </button>
                  </li>
                );
              })}
        </ul>
      )}
    </div>
  );
}
