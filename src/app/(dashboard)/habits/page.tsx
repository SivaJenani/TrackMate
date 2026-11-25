"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import type { Habit, HabitLog } from "@/types";
import { format, startOfWeek, addDays, isToday } from "date-fns";
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

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = format(weekStart, "yyyy-MM-dd");
      const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");
      const [habitsRes, logsRes] = await Promise.all([
        fetch("/api/habits"),
        fetch(`/api/habits/logs?startDate=${startDate}&endDate=${endDate}`),
      ]);
      if (habitsRes.ok) setHabits(await habitsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isLogged = (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return logs.some((l) => l.habit_id === habitId && l.completed_date === dateStr);
  };

  const toggleLog = async (habitId: string, date: Date) => {
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
    setEditingHabit(null); setName(""); setDescription(""); setFrequency("daily"); setColor("#00B4F0");
    setModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit); setName(habit.name); setDescription(habit.description || "");
    setFrequency(habit.frequency); setColor(habit.color);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const body = { name, description: description || null, frequency, color };
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

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#05080B]">Habit Tracker</h2>
        <Button variant="primary" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" /> Add Habit</Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState icon={Flame} title="No habits yet" description="Start building consistent habits!" actionLabel="Add Habit" onAction={openCreateModal} />
      ) : (
        <Card className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 pb-4 pr-4 min-w-[200px]">Habit</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="text-center text-sm font-medium text-gray-500 pb-4 w-16">
                    <div>{format(day, "EEE")}</div>
                    <div className={`text-xs mt-0.5 ${isToday(day) ? "text-[#00B4F0] font-bold" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </th>
                ))}
                <th className="text-center text-sm font-medium text-gray-500 pb-4 w-16">Streak</th>
                <th className="pb-4 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, i) => (
                <motion.tr key={habit.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-t border-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                      <div>
                        <p className="text-sm font-medium text-[#05080B]">{habit.name}</p>
                        <p className="text-xs text-gray-400">{habit.frequency}</p>
                      </div>
                    </div>
                  </td>
                  {weekDays.map((day) => {
                    const logged = isLogged(habit.id, day);
                    return (
                      <td key={day.toISOString()} className="py-3 text-center">
                        <button
                          onClick={() => toggleLog(habit.id, day)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 mx-auto ${
                            logged
                              ? "border-transparent text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          style={logged ? { backgroundColor: habit.color } : undefined}
                        >
                          {logged && <Check className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-3 text-center">
                    <span className="text-sm font-semibold text-orange-500">{habit.streak}🔥</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEditModal(habit)} className="p-1.5 text-gray-400 hover:text-[#00B4F0] rounded-lg hover:bg-gray-100"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteHabit(habit)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
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
