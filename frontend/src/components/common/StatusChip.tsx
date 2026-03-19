import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "running"
  | "completed"
  | "failed";

interface StatusChipProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
  icon?: boolean;
  className?: string;
}

interface StatusStyleConfig {
  container: string;
  text: string;
  dot: string;
  label: string;
  isActive?: boolean;
}

const statusStyles: Record<StatusType, StatusStyleConfig> = {
  success: {
    container: "border-emerald-500/20 bg-emerald-500/12",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    label: "Success",
  },
  completed: {
    container: "border-emerald-500/20 bg-emerald-500/12",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
    label: "Completed",
  },
  error: {
    container: "border-rose-500/20 bg-rose-500/12",
    text: "text-rose-300",
    dot: "bg-rose-400",
    label: "Error",
  },
  failed: {
    container: "border-rose-500/20 bg-rose-500/12",
    text: "text-rose-300",
    dot: "bg-rose-400",
    label: "Failed",
  },
  warning: {
    container: "border-amber-500/20 bg-amber-500/12",
    text: "text-amber-300",
    dot: "bg-amber-400",
    label: "Warning",
    isActive: true,
  },
  info: {
    container: "border-sky-500/20 bg-sky-500/12",
    text: "text-sky-300",
    dot: "bg-sky-400",
    label: "Info",
  },
  pending: {
    container: "border-slate-500/20 bg-slate-500/12",
    text: "text-slate-300",
    dot: "bg-slate-400",
    label: "Pending",
  },
  running: {
    container: "border-cyan-500/20 bg-cyan-500/12",
    text: "text-cyan-300",
    dot: "bg-cyan-400",
    label: "Running",
    isActive: true,
  },
};

const sizeStyles: Record<
  NonNullable<StatusChipProps["size"]>,
  { chip: string; dot: string }
> = {
  sm: {
    chip: "min-h-7 gap-1.5 px-2.5 text-[11px]",
    dot: "h-1.5 w-1.5",
  },
  md: {
    chip: "min-h-8 gap-1.5 px-3 text-xs",
    dot: "h-2 w-2",
  },
  lg: {
    chip: "min-h-9 gap-2 px-3.5 text-sm",
    dot: "h-2.5 w-2.5",
  },
};

const pulseTransition = {
  duration: 1.8,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = "md",
  icon = true,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const config = statusStyles[status] ?? statusStyles.pending;
  const displayLabel = label ?? config.label;
  const currentSize = sizeStyles[size];
  const showPulse = config.isActive && !shouldReduceMotion;

  return (
    <span
      className={cn(
        "inline-flex select-none items-center rounded-full border font-medium whitespace-nowrap",
        "backdrop-blur-sm",
        config.container,
        config.text,
        currentSize.chip,
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center",
            currentSize.dot,
          )}
        >
          {showPulse && (
            <motion.span
              className={cn(
                "absolute inset-0 rounded-full opacity-60",
                config.dot,
              )}
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={pulseTransition}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full shadow-[0_0_0_1px_rgba(15,23,42,0.45)]",
              currentSize.dot,
              config.dot,
            )}
          />
        </span>
      )}
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusChip;
