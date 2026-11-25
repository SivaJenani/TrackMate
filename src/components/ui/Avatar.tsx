"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ src, name = "", size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[#00B4F0] text-white flex items-center justify-center font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {initials || "U"}
    </div>
  );
}
