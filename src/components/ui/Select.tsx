"use client";

import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...rest }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={clsx("w-full", className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              "w-full appearance-none rounded-xl border bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 transition-colors",
              "focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/30",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-gray-200"
            )}
            {...rest}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
