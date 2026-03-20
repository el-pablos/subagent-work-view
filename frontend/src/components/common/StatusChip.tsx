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

// Colorblind-safe palette with high contrast
// Using distinct hues: orange (active), red (error), blue (info), green (success), gray (neutral)
const statusStyles: Record<StatusType, StatusStyleConfig> = {
  success: {
    container: "border-emerald-500/25 bg-emerald-500/15",
    text: "text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    label: "Success",
  },
  completed: {
    container: "border-emerald-500/25 bg-emerald-500/15",
    text: "text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    label: "Completed",
  },
  error: {
    container: "border-red-500/25 bg-red-500/15",
    text: "text-red-300",
    dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]",
    label: "Error",
  },
  failed: {
    container: "border-red-500/25 bg-red-500/15",
    text: "text-red-300",
    dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]",
    label: "Failed",
  },
  warning: {
    container: "border-amber-500/25 bg-amber-500/15",
    text: "text-amber-300",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    label: "Warning",
    isActive: true,
  },
  info: {
    container: "border-blue-500/25 bg-blue-500/15",
    text: "text-blue-300",
    dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]",
    label: "Info",
  },
  pending: {
    container: "border-slate-500/25 bg-slate-500/15",
    text: "text-slate-300",
    dot: "bg-slate-400 shadow-[0_0_6px_rgba(148,163,184,0.4)]",
    label: "Pending",
  },
  running: {
    container: "border-orange-500/25 bg-orange-500/15",
    text: "text-orange-300",
    dot: "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]",
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
  duration: 1.4,
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
                "absolute inset-0 rounded-full opacity-50",
                config.dot.split(" ")[0], // Only take bg- class
              )}
              animate={{ scale: [1, 2.0, 1], opacity: [0.5, 0, 0.5] }}
              transition={pulseTransition}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full ring-1 ring-white/10",
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
