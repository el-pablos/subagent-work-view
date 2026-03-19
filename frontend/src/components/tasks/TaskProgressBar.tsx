import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { TaskStatus } from "../../types/task";

export interface TaskProgressBarProps {
  progress: number; // 0-100
  status: TaskStatus;
  showLabel?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

const getStatusGradient = (
  status: TaskStatus,
  progress: number,
): { from: string; to: string; glow: string } => {
  switch (status) {
    case "failed":
      return {
        from: "from-rose-500",
        to: "to-rose-600",
        glow: "shadow-rose-500/40",
      };
    case "completed":
    case "running":
    case "pending":
    default:
      if (progress < 30) {
        return {
          from: "from-rose-500",
          to: "to-amber-500",
          glow: "shadow-amber-500/35",
        };
      }
      if (progress < 70) {
        return {
          from: "from-amber-500",
          to: "to-cyan-500",
          glow: "shadow-cyan-500/35",
        };
      }
      return {
        from: "from-emerald-500",
        to: "to-cyan-500",
        glow: "shadow-emerald-500/35",
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
  ariaLabel = "Task progress",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const gradient = getStatusGradient(status, clampedProgress);
  const sizeClass = getSizeClass(size);
  const progressText =
    status === "failed"
      ? `${clampedProgress}% complete, task failed`
      : `${clampedProgress}% complete, task ${status}`;

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={progressText}
      className={cn("w-full", className)}
    >
      {showLabel && (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Progress</span>
          <span className="text-xs font-semibold text-slate-100 tabular-nums">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full border border-slate-700/70 bg-slate-900/80",
          sizeClass,
        )}
      >
        <motion.div
          className={cn(
            "relative h-full rounded-full bg-gradient-to-r shadow-[0_0_14px_-3px] will-change-[width]",
            gradient.from,
            gradient.to,
            gradient.glow,
          )}
          initial={
            shouldReduceMotion
              ? { width: `${clampedProgress}%` }
              : { width: "0%" }
          }
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {!shouldReduceMotion && clampedProgress > 0 && clampedProgress < 100 && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-140%", "280%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          )}

          {clampedProgress > 0 && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-6 bg-white/15 blur-sm"
              animate={
                shouldReduceMotion
                  ? undefined
                  : { opacity: [0.35, 0.85, 0.35], scaleX: [0.95, 1.05, 0.95] }
              }
              transition={{
                duration: shouldReduceMotion ? 0 : 1.4,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TaskProgressBar;
