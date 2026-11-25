import clsx from "clsx";

const heightStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: keyof typeof heightStyles;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color = "#00B4F0",
  height = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-500">
            {Math.round(clampedValue)}%
          </span>
        </div>
      )}
      <div
        className={clsx(
          "w-full overflow-hidden rounded-full bg-gray-100",
          heightStyles[height]
        )}
      >
        <div
          className="rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: color,
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
