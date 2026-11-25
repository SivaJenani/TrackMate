"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          type="date"
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white",
            "text-gray-900 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-[#00B4F0] focus:border-[#00B4F0]",
            "transition-all duration-200",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";
