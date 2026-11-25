"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Task, DashboardStats } from "@/types";

const COLORS = ["#00B4F0", "#0E1A24", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          fetch("/api/dashboard"), fetch("/api/tasks"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#05080B]">Analytics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const weeklyData = stats?.weekly_activity?.map((v, i) => ({ day: dayLabels[i], tasks: v })) || [];

  const statusData = [
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length, color: "#9CA3AF" },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in_progress").length, color: "#00B4F0" },
    { name: "Completed", value: tasks.filter((t) => t.status === "completed").length, color: "#10B981" },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10B981" },
    { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#F59E0B" },
    { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#EF4444" },
  ].filter((d) => d.value > 0);

  const productivityData = weeklyData.map((d, i) => ({ ...d, trend: Math.max(0, d.tasks + Math.round(Math.sin(i) * 2)) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#05080B]">Analytics</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: stats?.total_tasks || 0 },
          { label: "Completed", value: stats?.completed_tasks || 0 },
          { label: "Productivity", value: `${stats?.productivity_percentage || 0}%` },
          { label: "Streak", value: `${stats?.current_streak || 0} days` },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl font-bold text-[#05080B]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#05080B] mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
              <Bar dataKey="tasks" fill="#00B4F0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Productivity Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#05080B] mb-4">Productivity Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={productivityData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="tasks" stroke="#00B4F0" strokeWidth={3} dot={{ fill: "#00B4F0", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tasks by Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#05080B] mb-4">Tasks by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400">No data yet</div>
          )}
        </Card>

        {/* Tasks by Priority */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#05080B] mb-4">Tasks by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400">No data yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
