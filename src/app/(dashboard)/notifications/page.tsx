"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckSquare, Target, Flame, Info, Trash2, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { formatRelativeDate } from "@/lib/utils";
import type { Notification } from "@/types";
import toast from "react-hot-toast";

const typeIcons = {
  task: CheckSquare,
  goal: Target,
  habit: Flame,
  system: Info,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const params = filter === "unread" ? "?unread=true" : "";
      const res = await fetch(`/api/notifications${params}`);
      if (res.ok) setNotifications(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
      toast.success("All marked as read");
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      fetchNotifications();
    } catch { toast.error("Failed"); }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#05080B]">Notifications</h2>
          {unreadCount > 0 && <p className="text-gray-500 mt-1">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}><CheckCheck className="w-4 h-4 mr-2" /> Mark All Read</Button>
        )}
      </div>

      <Tabs tabs={[{ id: "all", label: "All" }, { id: "unread", label: "Unread" }]} defaultTab={filter} onChange={setFilter} />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up! 🎉" description="No notifications at the moment." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = typeIcons[n.type] || Info;
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className={`p-4 ${!n.is_read ? "bg-[#00B4F0]/5 border-[#00B4F0]/20" : ""}`}
                  hover
                  onClick={() => !n.is_read && markRead(n.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.is_read ? "bg-[#00B4F0]/10 text-[#00B4F0]" : "bg-gray-100 text-gray-400"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.is_read ? "text-[#05080B]" : "text-gray-600"}`}>{n.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(n.created_at)}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
