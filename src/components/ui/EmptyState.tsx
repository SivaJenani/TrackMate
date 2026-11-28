"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-2xl bg-[#00B4F0]/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-[#00B4F0]" />
      </div>
      <h3 className="text-lg font-semibold text-[#ecf0e5] mb-2">{title}</h3>
      <p className="text-[#8fa0a6] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
