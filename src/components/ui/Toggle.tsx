"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-center justify-between gap-4 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <div>
        {label && <p className="text-sm font-medium text-gray-900">{label}</p>}
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
          checked ? "bg-[#00B4F0]" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out mt-0.5",
            checked ? "translate-x-5 ml-0.5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
