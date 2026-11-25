"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Clock, AlertTriangle, Target, Flame,
  TrendingUp, ListTodo, ArrowUpRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCardSkeleton, ChartSkeleton, TaskCardSkeleton } from "@/components/ui/Skeleton";
import { getGreeting, formatRelativeDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { DashboardStats, Task } from "@/types";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/tasks?sortBy=updated_at&sortOrder=desc"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          setRecentTasks(tasks.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const statCards = stats
    ? [
        { label: "Total Tasks", value: stats.total_tasks, icon: ListTodo, color: "bg-blue-50 text-blue-600" },
        { label: "Completed", value: stats.completed_tasks, icon: CheckSquare, color: "bg-green-50 text-green-600" },
        { label: "Pending", value: stats.pending_tasks, icon: Clock, color: "bg-amber-50 text-amber-600" },
        { label: "Overdue", value: stats.overdue_tasks, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
        { label: "Active Goals", value: stats.active_goals, icon: Target, color: "bg-cyan-50 text-[#00B4F0]" },
        { label: "Current Streak", value: `${stats.current_streak}d`, icon: Flame, color: "bg-orange-50 text-orange-600" },
        { label: "Productivity", value: `${stats.productivity_percentage}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
      ]
    : [];

  const chartData = stats?.weekly_activity?.map((val, i) => ({ day: dayLabels[i], tasks: val })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <TaskCardSkeleton key={i} />)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-[#05080B]">
          {getGreeting()}, {userName}! 👋
        </h2>
        <p className="text-gray-500 mt-1">Here&apos;s your productivity overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-[#05080B]">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#05080B] mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="tasks" fill="#00B4F0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#05080B]">Recent Tasks</h3>
            <a href="/tasks" className="text-sm text-[#00B4F0] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No tasks yet. Create your first task!</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#05080B] truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(task.updated_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant={task.priority}>{task.priority}</Badge>
                    <Badge variant={task.status}>{task.status === "in_progress" ? "In Progress" : task.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
