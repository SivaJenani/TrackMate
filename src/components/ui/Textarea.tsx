"use client";

import { type TextareaHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, maxLength, showCount = false, className, id, value, ...rest }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={clsx("w-full", className)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={clsx(
            "w-full resize-y rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors",
            "focus:border-[#00B4F0] focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/30",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-gray-200"
          )}
          rows={4}
          {...rest}
        />
        <div className="mt-1.5 flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <p className="text-xs text-gray-400">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
