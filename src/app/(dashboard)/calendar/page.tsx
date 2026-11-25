"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday, isSameDay,
} from "date-fns";
import type { Task } from "@/types";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) setTasks(await res.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchTasks();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date: Date) => {
    return tasks.filter((t) => t.deadline && isSameDay(new Date(t.deadline), date));
  };

  const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#05080B]">Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-[#05080B] min-w-[180px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                onClick={() => dayTasks.length > 0 && setSelectedDate(day)}
                className={`relative min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-xl border text-left transition-all ${
                  today ? "border-[#00B4F0] bg-[#00B4F0]/5" : "border-transparent hover:bg-gray-50"
                } ${!inMonth ? "opacity-30" : ""} ${dayTasks.length > 0 ? "cursor-pointer" : "cursor-default"}`}
              >
                <span className={`text-sm font-medium ${today ? "text-[#00B4F0]" : "text-gray-700"}`}>
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div key={t.id} className={`text-xs truncate px-1.5 py-0.5 rounded ${
                      t.priority === "high" ? "bg-red-100 text-red-700" :
                      t.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    }`}>
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <span className="text-xs text-gray-400">+{dayTasks.length - 2} more</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Day Detail Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
        size="md"
      >
        {selectedTasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tasks for this day.</p>
        ) : (
          <div className="space-y-3">
            {selectedTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-[#05080B]">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Badge variant={task.priority}>{task.priority}</Badge>
                  <Badge variant={task.status}>{task.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
