import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, WifiLow } from "lucide-react";
import { cn } from "../../lib/utils";

export type ConnectionState = "connected" | "disconnected" | "connecting" | "reconnecting";

export interface ConnectionStatusProps {
  status: ConnectionState;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  compact?: boolean;
}

const getStatusConfig = (status: ConnectionState) => {
  switch (status) {
    case "connected":
      return {
        icon: Wifi,
        label: "Terhubung",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
      };
    case "disconnected":
      return {
        icon: WifiOff,
        label: "Terputus",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
      };
    case "connecting":
      return {
        icon: WifiLow,
        label: "Menghubungkan...",
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
      };
    case "reconnecting":
      return {
        icon: WifiLow,
        label: "Menghubungkan ulang...",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-800",
      };
    default:
      return {
        icon: WifiOff,
        label: "Tidak diketahui",
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800",
      };
  }
};

const getSizeClasses = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        container: "px-2 py-1 gap-1.5",
        icon: "h-3 w-3",
        text: "text-xs",
      };
    case "md":
      return {
        container: "px-3 py-1.5 gap-2",
        icon: "h-4 w-4",
        text: "text-sm",
      };
    case "lg":
      return {
        container: "px-4 py-2 gap-2.5",
        icon: "h-5 w-5",
        text: "text-base",
      };
    default:
      return {
        container: "px-3 py-1.5 gap-2",
        icon: "h-4 w-4",
        text: "text-sm",
      };
  }
};

/**
 * Komponen untuk menampilkan status koneksi realtime.
 * Mendukung animasi dan reduced motion.
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  className,
  showLabel = true,
  size = "md",
  compact = false,
}) => {
  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  const isAnimating = status === "connecting" || status === "reconnecting";

  const iconVariants = {
    idle: { scale: 1, rotate: 0 },
    pulse: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  if (compact) {
    return (
      <motion.div
        className={cn(
          "inline-flex items-center justify-center rounded-full p-1.5",
          config.bgColor,
          className
        )}
        title={config.label}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          variants={iconVariants}
          initial="idle"
          animate={isAnimating ? "pulse" : "idle"}
        >
          <Icon className={cn(sizeClasses.icon, config.color)} aria-hidden="true" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        className={cn(
          "inline-flex items-center rounded-full border font-medium",
          config.bgColor,
          config.borderColor,
          sizeClasses.container,
          className
        )}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        role="status"
        aria-live="polite"
      >
        <motion.div
          variants={iconVariants}
          initial="idle"
          animate={isAnimating ? "pulse" : "idle"}
        >
          <Icon className={cn(sizeClasses.icon, config.color)} aria-hidden="true" />
        </motion.div>
        {showLabel && (
          <span className={cn(sizeClasses.text, config.color, "font-medium")}>
            {config.label}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
