"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { HABIT_ICONS, getHabitIcon } from "@/lib/habit-icons";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import type { Habit, HabitLog } from "@/types";
import { format, startOfWeek, addDays, isToday, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isAfter, startOfDay, getISOWeek } from "date-fns";
import toast from "react-hot-toast";
import { Flame } from "lucide-react";

const freqOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const colorOptions = ["#00B4F0", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteHabit, setDeleteHabit] = useState<Habit | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [color, setColor] = useState("#00B4F0");
  const [icon, setIcon] = useState<string | null>(null);
  const [view, setView] = useState<"month" | "week">("month");
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const rangeStart = view === "month" ? startOfMonth(monthAnchor) : weekStart;
      const rangeEnd = view === "month" ? endOfMonth(monthAnchor) : addDays(weekStart, 6);
      const startDate = format(rangeStart, "yyyy-MM-dd");
      const endDate = format(rangeEnd, "yyyy-MM-dd");
      const [habitsRes, logsRes] = await Promise.all([
        fetch("/api/habits"),
        fetch(`/api/habits/logs?startDate=${startDate}&endDate=${endDate}`),
      ]);
      if (habitsRes.ok) setHabits(await habitsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, monthAnchor]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isLogged = (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return logs.some((l) => l.habit_id === habitId && l.completed_date === dateStr);
  };

  const toggleLog = async (habitId: string, date: Date) => {
    if (isAfter(startOfDay(date), startOfDay(new Date()))) return;
    const dateStr = format(date, "yyyy-MM-dd");
    const logged = isLogged(habitId, date);
    try {
      if (logged) {
        await fetch(`/api/habits/${habitId}/log`, {
          method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: dateStr }),
        });
      } else {
        await fetch(`/api/habits/${habitId}/log`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: dateStr }),
        });
      }
      fetchData();
    } catch { toast.error("Failed to update"); }
  };

  const openCreateModal = () => {
    setEditingHabit(null); setName(""); setDescription(""); setFrequency("daily"); setColor("#00B4F0"); setIcon(null);
    setModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit); setName(habit.name); setDescription(habit.description || "");
    setFrequency(habit.frequency); setColor(habit.color); setIcon(habit.icon ?? null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const body = { name, description: description || null, frequency, color, icon };
      const res = editingHabit
        ? await fetch(`/api/habits/${editingHabit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(editingHabit ? "Habit updated" : "Habit created"); setModalOpen(false); fetchData(); }
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteHabit) return;
    try {
      const res = await fetch(`/api/habits/${deleteHabit.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Habit deleted"); setDeleteHabit(null); fetchData(); }
    } catch { toast.error("Failed to delete"); }
  };

  const monthDays = eachDayOfInterval({ start: startOfMonth(monthAnchor), end: endOfMonth(monthAnchor) });
  const isFuture = (d: Date) => isAfter(startOfDay(d), startOfDay(new Date()));
  const monthCount = (habitId: string) => monthDays.filter((d) => isLogged(habitId, d)).length;

  if (loading && habits.length === 0) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>;
  }

  const iconPicker = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
      <div className="grid grid-cols-7 gap-2" role="radiogroup" aria-label="Habit icon">
        {HABIT_ICONS.map((opt) => {
          const Ic = opt.icon;
          const selected = icon === opt.name;
          return (
            <button
              key={opt.name} type="button" role="radio" aria-checked={selected} title={opt.label} aria-label={opt.label}
              onClick={() => setIcon(selected ? null : opt.name)}
              className={`flex h-10 w-full items-center justify-center rounded-lg border transition-all ${selected ? "border-[#36d2ff] bg-[#0b0f11] text-[#36d2ff] shadow-[0_0_10px_rgba(54,210,255,.35)]" : "border-gray-200 bg-[#0b0f11] text-[#7d8e94] hover:text-[#9ceaff]"}`}
            >
              <Ic className="h-5 w-5" strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-gray-400">Tap the selected icon again to use an automatic one.</p>
    </div>
  );

  const toggleBtn = (v: "month" | "week", label: string) => (
    <button onClick={() => setView(v)} className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${view === v ? "bg-[#36d2ff] text-[#05080B]" : "text-[#9baab0] hover:text-white"}`}>{label}</button>
  );

  return (
    <div className="space-y-4 rounded-2xl bg-[#080b0d] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#ecf0e5]">Habit Tracker</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-white/10 bg-[#0b0f11] p-0.5">{toggleBtn("month", "Month")}{toggleBtn("week", "Week")}</div>
          <Button variant="primary" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" /> Add Habit</Button>
        </div>
      </div>

      {habits.length === 0 ? (
        <EmptyState icon={Flame} title="No habits yet" description="Start building consistent habits!" actionLabel="Add Habit" onAction={openCreateModal} />
      ) : view === "month" ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0b0f11] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <button aria-label="Previous month" onClick={() => setMonthAnchor(addMonths(monthAnchor, -1))} className="rounded-lg p-1.5 text-[#9baab0] hover:bg-white/5 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
            <p className="text-sm font-semibold text-[#ecf0e5]">{format(monthAnchor, "MMMM yyyy")}</p>
            <button aria-label="Next month" onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))} className="rounded-lg p-1.5 text-[#9baab0] hover:bg-white/5 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-0 text-[#dce1d5]" aria-label="Habit matrix for the month">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 min-w-[140px] bg-[#0b0f11] pb-1 pr-3 text-left text-[10px] font-medium uppercase tracking-wide text-[#74848a]">Habit</th>
                  {monthDays.map((d, i) => {
                    const newWeek = i > 0 && d.getDay() === 1;
                    return (
                      <th key={d.toISOString()} className={`min-w-[26px] pb-1 text-center text-[9px] font-medium ${newWeek ? "border-l border-white/10" : ""} ${isToday(d) ? "text-[#36d2ff]" : "text-[#74848a]"}`} title={`Week ${getISOWeek(d)}`}>
                        <div>{format(d, "EEEEE")}</div>
                        <div className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${isToday(d) ? "bg-[#36d2ff] font-bold text-[#05080B]" : ""}`}>{format(d, "d")}</div>
                      </th>
                    );
                  })}
                  <th className="pb-1 pl-3 text-right text-[10px] font-medium uppercase tracking-wide text-[#74848a]">Month</th>
                  <th className="pb-1 pl-2"></th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => {
                  const Ic = getHabitIcon(habit);
                  return (
                    <tr key={habit.id} className="group">
                      <td className="sticky left-0 z-10 border-t border-white/[0.06] bg-[#0b0f11] py-1.5 pr-3">
                        <div className="flex items-center gap-2"><Ic className="h-4 w-4 shrink-0 text-[#36d2ff]" strokeWidth={1.75} /><span className="max-w-[110px] truncate text-xs font-medium text-[#dce1d5]">{habit.name}</span></div>
                      </td>
                      {monthDays.map((d, i) => {
                        const logged = isLogged(habit.id, d);
                        const future = isFuture(d);
                        const newWeek = i > 0 && d.getDay() === 1;
                        return (
                          <td key={d.toISOString()} className={`border-t border-white/[0.06] py-1 text-center ${newWeek ? "border-l border-l-white/10" : ""} ${isToday(d) ? "bg-[#36d2ff]/[0.08]" : ""}`}>
                            <button
                              disabled={future} onClick={() => toggleLog(habit.id, d)}
                              aria-label={`${habit.name}, ${format(d, "MMM d")}, ${logged ? "completed" : "not completed"}`}
                              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-[5px] transition-colors ${logged ? "bg-[#36d2ff] text-[#05080B] shadow-[0_0_8px_rgba(54,210,255,.3)]" : "bg-white/[0.06]"} ${future ? "cursor-not-allowed opacity-30" : !logged ? "hover:bg-white/[0.14]" : ""}`}
                            >
                              {logged && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="border-t border-white/[0.06] py-1.5 pl-3 text-right text-xs font-bold text-[#36d2ff]">{monthCount(habit.id)}/{monthDays.length}</td>
                      <td className="border-t border-white/[0.06] py-1.5 pl-2">
                        <div className="flex items-center gap-0.5">
                          <button aria-label="Edit habit" onClick={() => openEditModal(habit)} className="rounded p-1 text-[#74848a] hover:text-[#36d2ff]"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button aria-label="Delete habit" onClick={() => setDeleteHabit(habit)} className="rounded p-1 text-[#74848a] hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0b0f11] p-4">
          <table className="w-full text-[#dce1d5]">
            <thead>
              <tr>
                <th className="min-w-[180px] pb-4 pr-4 text-left text-xs font-medium text-[#74848a]">Habit</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="w-14 pb-4 text-center text-xs font-medium text-[#74848a]">
                    <div>{format(day, "EEE")}</div>
                    <div className={`mt-0.5 text-xs ${isToday(day) ? "font-bold text-[#36d2ff]" : ""}`}>{format(day, "d")}</div>
                  </th>
                ))}
                <th className="w-16 pb-4 text-center text-xs font-medium text-[#74848a]">Streak</th>
                <th className="w-20 pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const Ic = getHabitIcon(habit);
                return (
                  <tr key={habit.id} className="border-t border-white/[0.06]">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Ic className="h-5 w-5 shrink-0 text-[#36d2ff]" strokeWidth={1.75} />
                        <div>
                          <p className="text-sm font-medium text-[#dce1d5]">{habit.name}</p>
                          <p className="text-xs text-[#74848a]">{habit.frequency}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const logged = isLogged(habit.id, day);
                      const future = isFuture(day);
                      return (
                        <td key={day.toISOString()} className="py-3 text-center">
                          <button
                            disabled={future} onClick={() => toggleLog(habit.id, day)}
                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${logged ? "border-transparent bg-[#36d2ff] text-[#05080B]" : "border-white/15 hover:border-white/30"} ${future ? "cursor-not-allowed opacity-30" : ""}`}
                          >
                            {logged && <Check className="h-4 w-4" strokeWidth={3} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-3 text-center"><span className="text-sm font-semibold text-[#36d2ff]">{habit.streak}</span></td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button aria-label="Edit habit" onClick={() => openEditModal(habit)} className="rounded-lg p-1.5 text-[#74848a] hover:text-[#36d2ff]"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button aria-label="Delete habit" onClick={() => setDeleteHabit(habit)} className="rounded-lg p-1.5 text-[#74848a] hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingHabit ? "Edit Habit" : "Add Habit"} size="md">
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Read 30 minutes" required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          <Select label="Frequency" options={freqOptions} value={frequency} onChange={(e) => setFrequency(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c} onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {iconPicker}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>{editingHabit ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteHabit} onClose={() => setDeleteHabit(null)} onConfirm={handleDelete}
        title="Delete Habit" message={`Delete "${deleteHabit?.name}"? This will remove all tracking data.`} confirmText="Delete" variant="danger" />
    </div>
  );
}
