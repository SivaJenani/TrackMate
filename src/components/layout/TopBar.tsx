"use client";

import { Menu, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { GlobalSearch } from "./GlobalSearch";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  notificationCount?: number;
  user?: { name: string; avatar_url: string };
}

export function TopBar({ title, onMenuClick, notificationCount = 0, user }: TopBarProps) {
  return (
    <header className="h-16 bg-[var(--app-bg)] backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[#8fa0a6] hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#ecf0e5]">{title}</h1>
      </div>

      <GlobalSearch />

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl text-[#8fa0a6] hover:bg-white/5 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
        <Link href="/profile" className="hover:opacity-80 transition-opacity">
          <Avatar src={user?.avatar_url} name={user?.name} size="sm" />
        </Link>
      </div>
    </header>
  );
}
