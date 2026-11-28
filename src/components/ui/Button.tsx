"use client";

import clsx from "clsx";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

const variantStyles = {
  primary: "bg-[#00B4F0] text-white hover:bg-[#009DD0]",
  secondary: "bg-[#0F1424] text-white hover:bg-[#151C30]",
  outline: "border-2 border-[#00B4F0] text-[#00B4F0] hover:bg-[#00B4F0]/10",
  ghost: "text-gray-600 hover:bg-gray-100",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B4F0]/50 focus:ring-offset-2",
        "active:scale-[0.98] hover:scale-[1.02]",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        isDisabled && "cursor-not-allowed opacity-50 hover:scale-100 active:scale-100",
        className
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
