"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskCardSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate, getDaysUntil } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import toast from "react-hot-toast";
import { CheckSquare } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "all", label: "All Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusFormOptions = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityFormOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("sortBy", "created_at");
      params.set("sortOrder", "desc");

      const res = await fetch(`/api/tasks?${params}`);
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, debouncedSearch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle(""); setDescription(""); setStatus("todo"); setPriority("medium"); setCategory(""); setDeadline("");
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title); setDescription(task.description || ""); setStatus(task.status); setPriority(task.priority);
    setCategory(task.category || ""); setDeadline(task.deadline ? task.deadline.split("T")[0] : "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const body = { title, description: description || null, status, priority, category: category || null, deadline: deadline || null };
      const res = editingTask
        ? await fetch(`/api/tasks/${editingTask.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (res.ok) {
        toast.success(editingTask ? "Task updated" : "Task created");
        setModalOpen(false);
        fetchTasks();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } catch { toast.error("Failed to save task"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    try {
      const res = await fetch(`/api/tasks/${deleteTask.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Task deleted"); setDeleteTask(null); fetchTasks(); }
    } catch { toast.error("Failed to delete"); }
  };

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) fetchTasks();
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#05080B]">My Tasks</h2>
          <p className="text-gray-500 mt-1">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks..." className="flex-1" />
        <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        <Select options={priorityOptions} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} />
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <TaskCardSkeleton key={i} />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No tasks found" description="Create your first task to get started!" actionLabel="Add Task" onAction={openCreateModal} />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow" hover>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleStatus(task)} className="mt-0.5 shrink-0">
                      {task.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-[#00B4F0] transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === "completed" ? "line-through text-gray-400" : "text-[#05080B]"}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={task.priority}>{task.priority}</Badge>
                        <Badge variant={task.status}>{task.status === "in_progress" ? "In Progress" : task.status}</Badge>
                        {task.category && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.category}</span>}
                        {task.deadline && (
                          <span className={`text-xs ${getDaysUntil(task.deadline) < 0 && task.status !== "completed" ? "text-red-500" : "text-gray-400"}`}>
                            Due: {formatDate(task.deadline)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEditModal(task)} className="p-2 text-gray-400 hover:text-[#00B4F0] rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTask(task)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? "Edit Task" : "Create Task"} size="md">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task description (optional)" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" options={statusFormOptions} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} />
            <Select label="Priority" options={priorityFormOptions} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Work" />
            <DatePicker label="Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>{editingTask ? "Update" : "Create"}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
