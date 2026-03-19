import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "../../lib/utils";

export interface HeartbeatIndicatorProps {
  active?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "green" | "blue" | "red" | "yellow";
  label?: string;
  showPulse?: boolean;
}

const getColorClasses = (color: string) => {
  switch (color) {
    case "green":
      return {
        icon: "text-green-600 dark:text-green-400",
        pulse: "bg-green-500",
      };
    case "blue":
      return {
        icon: "text-blue-600 dark:text-blue-400",
        pulse: "bg-blue-500",
      };
    case "red":
      return {
        icon: "text-red-600 dark:text-red-400",
        pulse: "bg-red-500",
      };
    case "yellow":
      return {
        icon: "text-yellow-600 dark:text-yellow-400",
        pulse: "bg-yellow-500",
      };
    default:
      return {
        icon: "text-gray-600 dark:text-gray-400",
        pulse: "bg-gray-500",
      };
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        icon: "h-3 w-3",
        pulse: "h-2 w-2",
        text: "text-xs",
      };
    case "md":
      return {
        icon: "h-4 w-4",
        pulse: "h-2.5 w-2.5",
        text: "text-sm",
      };
    case "lg":
      return {
        icon: "h-5 w-5",
        pulse: "h-3 w-3",
        text: "text-base",
      };
    default:
      return {
        icon: "h-4 w-4",
        pulse: "h-2.5 w-2.5",
        text: "text-sm",
      };
  }
};

/**
 * Komponen indikator heartbeat dengan animasi pulse.
 * Menghormati prefers-reduced-motion.
 */
export const HeartbeatIndicator: React.FC<HeartbeatIndicatorProps> = ({
  active = true,
  className,
  size = "md",
  color = "default",
  label,
  showPulse = true,
}) => {
  const colorClasses = getColorClasses(color);
  const sizeClasses = getSizeClasses(size);

  const heartbeatVariants = {
    idle: {
      scale: 1,
    },
    beat: {
      scale: [1, 1.3, 1, 1.15, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants = {
    idle: {
      scale: 1,
      opacity: 0,
    },
    pulse: {
      scale: [1, 2, 2.5],
      opacity: [0.6, 0.3, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="relative inline-flex items-center justify-center">
        {/* Pulse ring effect */}
        {showPulse && active && (
          <motion.div
            className={cn(
              "absolute rounded-full",
              colorClasses.pulse,
              sizeClasses.pulse
            )}
            variants={pulseVariants}
            initial="idle"
            animate="pulse"
            aria-hidden="true"
          />
        )}

        {/* Icon with heartbeat animation */}
        <motion.div
          variants={heartbeatVariants}
          initial="idle"
          animate={active ? "beat" : "idle"}
        >
          <Activity
            className={cn(
              sizeClasses.icon,
              active ? colorClasses.icon : "text-gray-400 dark:text-gray-600"
            )}
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {label && (
        <span
          className={cn(
            sizeClasses.text,
            active
              ? "text-gray-700 dark:text-gray-300"
              : "text-gray-400 dark:text-gray-600"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};
