"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

const themeOptions = [
  { value: "system", label: "System Default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    habit_reminders: true,
    goal_reminders: true,
    theme: "system",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            task_reminders: data.task_reminders ?? true,
            habit_reminders: data.habit_reminders ?? true,
            goal_reminders: data.goal_reminders ?? true,
            theme: data.theme || "system",
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("Settings saved!");
      else toast.error("Failed to save settings");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#00B4F0] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[#05080B]">Settings</h2>

      {/* Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#05080B] mb-6">Notifications</h3>
        <div className="space-y-5">
          <Toggle label="Email Notifications" description="Receive notifications via email" checked={settings.email_notifications} onChange={(v) => setSettings((s) => ({ ...s, email_notifications: v }))} />
          <Toggle label="Push Notifications" description="Receive browser push notifications" checked={settings.push_notifications} onChange={(v) => setSettings((s) => ({ ...s, push_notifications: v }))} />
          <Toggle label="Task Reminders" description="Get reminders for upcoming task deadlines" checked={settings.task_reminders} onChange={(v) => setSettings((s) => ({ ...s, task_reminders: v }))} />
          <Toggle label="Habit Reminders" description="Daily reminders to complete your habits" checked={settings.habit_reminders} onChange={(v) => setSettings((s) => ({ ...s, habit_reminders: v }))} />
          <Toggle label="Goal Reminders" description="Reminders for approaching goal deadlines" checked={settings.goal_reminders} onChange={(v) => setSettings((s) => ({ ...s, goal_reminders: v }))} />
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#05080B] mb-4">Appearance</h3>
        <Select label="Theme" options={themeOptions} value={settings.theme} onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value }))} />
      </Card>

      {/* Save */}
      <Button variant="primary" onClick={handleSave} loading={saving} fullWidth>Save Settings</Button>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
        <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { setShowDeleteConfirm(false); toast.error("Account deletion is handled through Supabase dashboard."); }}
        title="Delete Account"
        message="Are you sure? This action is permanent and cannot be undone."
        confirmText="Delete My Account"
        variant="danger"
      />
    </div>
  );
}
