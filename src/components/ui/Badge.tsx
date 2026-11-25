import { type ReactNode } from "react";
import clsx from "clsx";

const variantStyles: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-[#00B4F0]/10 text-[#00B4F0]",
  completed: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
  default: "bg-[#00B4F0]/10 text-[#00B4F0]",
};

interface BadgeProps {
  variant?: keyof typeof variantStyles;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant as string] ?? variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
