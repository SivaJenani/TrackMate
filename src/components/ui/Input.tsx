"use client";

import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = "left",
      className,
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={clsx("w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors",
              "focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/30",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-gray-200",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10"
            )}
            {...rest}
          />
          {icon && iconPosition === "right" && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
