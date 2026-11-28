"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string; avatar_url: string };
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "My Tasks",
  "/goals": "Goals",
  "/habits": "Habit Tracker",
  "/calendar": "Calendar",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
};

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const title = useMemo(() => pageTitles[pathname] || "Dashboard", [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="app-dark min-h-screen bg-[var(--app-bg)]">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className="lg:pl-64">
        <TopBar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
