"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, CheckCircle, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tabs } from "@/components/ui/Tabs";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import type { Goal, GoalStatus } from "@/types";
import toast from "react-hot-toast";
import { Target } from "lucide-react";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<GoalStatus>("active");
  const [progress, setProgress] = useState(0);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/goals${params}`);
      if (res.ok) setGoals(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const openCreateModal = () => {
    setEditingGoal(null); setTitle(""); setDescription(""); setTargetDate(""); setStatus("active"); setProgress(0);
    setModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal); setTitle(goal.title); setDescription(goal.description || "");
    setTargetDate(goal.target_date ? goal.target_date.split("T")[0] : "");
    setStatus(goal.status); setProgress(goal.progress);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const body = { title, description: description || null, target_date: targetDate || null, status, progress };
      const res = editingGoal
        ? await fetch(`/api/goals/${editingGoal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(editingGoal ? "Goal updated" : "Goal created"); setModalOpen(false); fetchGoals(); }
      else { const err = await res.json(); toast.error(err.error || "Failed"); }
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDeleteGoal = async () => {
    if (!deleteGoal) return;
    try {
      const res = await fetch(`/api/goals/${deleteGoal.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Goal deleted"); setDeleteGoal(null); fetchGoals(); }
    } catch { toast.error("Failed to delete"); }
  };

  const addMilestone = async (goalId: string) => {
    if (!newMilestone.trim()) return;
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: newMilestone }),
      });
      if (res.ok) { setNewMilestone(""); fetchGoals(); toast.success("Milestone added"); }
    } catch { toast.error("Failed to add milestone"); }
  };

  const toggleMilestone = async (milestoneId: string, isCompleted: boolean) => {
    try {
      await fetch(`/api/milestones/${milestoneId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : null }),
      });
      fetchGoals();
    } catch { toast.error("Failed to update"); }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "paused", label: "Paused" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between"><div className="h-8 w-32 animate-shimmer rounded-lg" /></div>
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#05080B]">My Goals</h2>
        <Button variant="primary" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" /> Create Goal</Button>
      </div>

      <Tabs tabs={tabs} defaultTab={filter} onChange={setFilter} />

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Set your first goal and start making progress!" actionLabel="Create Goal" onAction={openCreateModal} />
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#05080B]">{goal.title}</h3>
                      <Badge variant={goal.status}>{goal.status}</Badge>
                    </div>
                    {goal.description && <p className="text-sm text-gray-500">{goal.description}</p>}
                    {goal.target_date && <p className="text-xs text-gray-400 mt-1">Target: {formatDate(goal.target_date)}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(goal)} className="p-2 text-gray-400 hover:text-[#00B4F0] rounded-lg hover:bg-gray-100"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteGoal(goal)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <ProgressBar value={goal.progress} showLabel className="mb-3" />

                {/* Milestones */}
                <button
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  className="text-sm text-gray-500 hover:text-[#00B4F0] flex items-center gap-1 transition-colors"
                >
                  {goal.milestones?.length || 0} milestones
                  {expandedGoal === goal.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedGoal === goal.id && (
                  <div className="mt-3 pl-2 border-l-2 border-gray-100 space-y-2">
                    {goal.milestones?.map((ms) => (
                      <div key={ms.id} className="flex items-center gap-2">
                        <button onClick={() => toggleMilestone(ms.id, ms.is_completed)}>
                          {ms.is_completed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-300" />}
                        </button>
                        <span className={`text-sm ${ms.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}>{ms.title}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)}
                        placeholder="Add milestone..." className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00B4F0]"
                        onKeyDown={(e) => e.key === "Enter" && addMilestone(goal.id)}
                      />
                      <Button variant="outline" size="sm" onClick={() => addMilestone(goal.id)}>Add</Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingGoal ? "Edit Goal" : "Create Goal"} size="md">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your goal" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)} />
            <DatePicker label="Target Date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Progress: {progress}%</label>
            <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-[#00B4F0]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>{editingGoal ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteGoal} onClose={() => setDeleteGoal(null)} onConfirm={handleDeleteGoal}
        title="Delete Goal" message={`Are you sure you want to delete "${deleteGoal?.title}"?`} confirmText="Delete" variant="danger" />
    </div>
  );
}
