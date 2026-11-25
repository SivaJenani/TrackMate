"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00B4F0] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading TrackMate...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout
      user={{
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      }}
    >
      {children}
    </DashboardLayout>
  );
}
