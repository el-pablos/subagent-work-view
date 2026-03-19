import React from "react";
import type { TaskStatus } from "../../types/task";

interface TaskProgressBarProps {
  progress: number; // 0-100
  status: TaskStatus;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const getStatusGradient = (
  status: TaskStatus,
): { from: string; to: string; glow: string } => {
  switch (status) {
    case "completed":
      return {
        from: "from-sky-400",
        to: "to-sky-600",
        glow: "shadow-sky-500/50",
      };
    case "running":
      return {
        from: "from-emerald-400",
        to: "to-emerald-600",
        glow: "shadow-emerald-500/50",
      };
    case "failed":
      return {
        from: "from-rose-400",
        to: "to-rose-600",
        glow: "shadow-rose-500/50",
      };
    case "pending":
      return {
        from: "from-amber-400",
        to: "to-amber-600",
        glow: "shadow-amber-500/50",
      };
    default:
      return {
        from: "from-gray-400",
        to: "to-gray-600",
        glow: "shadow-gray-500/50",
      };
  }
};

const getSizeClass = (size: TaskProgressBarProps["size"]): string => {
  switch (size) {
    case "sm":
      return "h-1";
    case "lg":
      return "h-3";
    case "md":
    default:
      return "h-2";
  }
};

const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  progress,
  status,
  showLabel = true,
  className = "",
  size = "md",
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const gradient = getStatusGradient(status);
  const sizeClass = getSizeClass(size);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-300">Progress</span>
          <span className="text-xs font-semibold text-gray-200">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-gray-700 rounded-full ${sizeClass} overflow-hidden`}
      >
        <div
          className={`${sizeClass} bg-gradient-to-r ${gradient.from} ${gradient.to} rounded-full transition-all duration-500 ease-out relative overflow-hidden shadow-md ${gradient.glow}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Animated shimmer effect for running tasks */}
          {status === "running" && (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                style={{
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
            </div>
          )}
          {/* Pulse glow effect for running tasks */}
          {status === "running" && clampedProgress > 0 && (
            <div
              className={`absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-sm animate-pulse`}
            />
          )}
        </div>
      </div>

      {/* Add keyframes via inline style for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export default TaskProgressBar;
