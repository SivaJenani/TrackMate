"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "card" | "chart";
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant = "text", width, height, className }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full rounded-md",
    circle: "h-10 w-10 rounded-full",
    card: "h-32 w-full rounded-2xl",
    chart: "h-64 w-full rounded-2xl",
  };

  return (
    <div
      className={cn("animate-shimmer bg-gray-200", variantClasses[variant], className)}
      style={{ width, height }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circle" className="h-12 w-12" />
        <Skeleton variant="text" className="h-4 w-16" />
      </div>
      <Skeleton variant="text" className="h-8 w-20 mb-2" />
      <Skeleton variant="text" className="h-4 w-32" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton variant="text" className="h-5 w-48 mb-2" />
          <Skeleton variant="text" className="h-4 w-72" />
        </div>
        <Skeleton variant="text" className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-3 mt-4">
        <Skeleton variant="text" className="h-6 w-16 rounded-full" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <Skeleton variant="text" className="h-6 w-40 mb-6" />
      <Skeleton variant="chart" />
    </div>
  );
}
