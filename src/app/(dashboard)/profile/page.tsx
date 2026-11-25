"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFullName(data.full_name || "");
          setAvatarUrl(data.avatar_url || "");
          setMemberSince(data.created_at);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, avatar_url: avatarUrl || null }),
      });
      if (res.ok) toast.success("Profile updated!");
      else toast.error("Failed to update profile");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#00B4F0] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[#05080B]">Profile</h2>

      <Card className="p-8">
        <div className="flex flex-col items-center mb-8">
          <Avatar src={avatarUrl} name={fullName} size="xl" className="mb-4" />
          <h3 className="text-xl font-semibold text-[#05080B]">{fullName || "User"}</h3>
          <p className="text-gray-500">{user?.email}</p>
          {memberSince && <p className="text-xs text-gray-400 mt-1">Member since {formatDate(memberSince)}</p>}
        </div>

        <div className="space-y-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          <Input label="Email" value={user?.email || ""} disabled />
          <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
          <div className="pt-4">
            <Button variant="primary" onClick={handleSave} loading={saving} fullWidth>Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
