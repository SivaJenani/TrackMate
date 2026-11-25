"use client";

import { type ReactNode } from "react";
import clsx from "clsx";

const paddingStyles = {
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: keyof typeof paddingStyles;
}

export function Card({
  children,
  className,
  hover = false,
  onClick,
  padding = "md",
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-2xl border border-gray-100 bg-white shadow-sm",
        paddingStyles[padding],
        hover && "cursor-pointer transition-shadow duration-200 hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
