import React from "react";
import { motion } from "framer-motion";
import {
  Server,
  Radio,
  Webhook,
  Database,
  Cloud,
  Code,
  User,
  Bot,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type SourceType =
  | "server"
  | "websocket"
  | "webhook"
  | "database"
  | "api"
  | "manual"
  | "user"
  | "bot"
  | "automation"
  | "unknown";

export interface SourceBadgeProps {
  source: SourceType;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline" | "ghost";
  showIcon?: boolean;
  animated?: boolean;
}

interface SourceConfig {
  icon: LucideIcon;
  defaultLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const getSourceConfig = (source: SourceType): SourceConfig => {
  switch (source) {
    case "server":
      return {
        icon: Server,
        defaultLabel: "Server",
        color: "text-purple-700 dark:text-purple-300",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
      };
    case "websocket":
      return {
        icon: Radio,
        defaultLabel: "WebSocket",
        color: "text-blue-700 dark:text-blue-300",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
      };
    case "webhook":
      return {
        icon: Webhook,
        defaultLabel: "Webhook",
        color: "text-cyan-700 dark:text-cyan-300",
        bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
        borderColor: "border-cyan-200 dark:border-cyan-800",
      };
    case "database":
      return {
        icon: Database,
        defaultLabel: "Database",
        color: "text-emerald-700 dark:text-emerald-300",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        borderColor: "border-emerald-200 dark:border-emerald-800",
      };
    case "api":
      return {
        icon: Cloud,
        defaultLabel: "API",
        color: "text-indigo-700 dark:text-indigo-300",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        borderColor: "border-indigo-200 dark:border-indigo-800",
      };
    case "manual":
      return {
        icon: Code,
        defaultLabel: "Manual",
        color: "text-gray-700 dark:text-gray-300",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800",
      };
    case "user":
      return {
        icon: User,
        defaultLabel: "User",
        color: "text-sky-700 dark:text-sky-300",
        bgColor: "bg-sky-50 dark:bg-sky-900/20",
        borderColor: "border-sky-200 dark:border-sky-800",
      };
    case "bot":
      return {
        icon: Bot,
        defaultLabel: "Bot",
        color: "text-violet-700 dark:text-violet-300",
        bgColor: "bg-violet-50 dark:bg-violet-900/20",
        borderColor: "border-violet-200 dark:border-violet-800",
      };
    case "automation":
      return {
        icon: Zap,
        defaultLabel: "Otomatis",
        color: "text-amber-700 dark:text-amber-300",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        borderColor: "border-amber-200 dark:border-amber-800",
      };
    default:
      return {
        icon: Server,
        defaultLabel: "Unknown",
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
        container: "px-2 py-1 gap-1",
        icon: "h-3 w-3",
        text: "text-xs",
      };
    case "md":
      return {
        container: "px-2.5 py-1 gap-1.5",
        icon: "h-3.5 w-3.5",
        text: "text-xs",
      };
    case "lg":
      return {
        container: "px-3 py-1.5 gap-2",
        icon: "h-4 w-4",
        text: "text-sm",
      };
    default:
      return {
        container: "px-2.5 py-1 gap-1.5",
        icon: "h-3.5 w-3.5",
        text: "text-xs",
      };
  }
};

const getVariantClasses = (
  variant: "solid" | "outline" | "ghost",
  config: SourceConfig
) => {
  switch (variant) {
    case "solid":
      return {
        container: cn(config.bgColor, "border", config.borderColor),
        text: config.color,
      };
    case "outline":
      return {
        container: cn("border", config.borderColor, "bg-transparent"),
        text: config.color,
      };
    case "ghost":
      return {
        container: "border-transparent bg-transparent",
        text: config.color,
      };
    default:
      return {
        container: cn(config.bgColor, "border", config.borderColor),
        text: config.color,
      };
  }
};

/**
 * Badge untuk menampilkan sumber data/event dengan icon yang sesuai.
 * Mendukung berbagai ukuran dan variant.
 */
export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  label,
  className,
  size = "md",
  variant = "solid",
  showIcon = true,
  animated = false,
}) => {
  const config = getSourceConfig(source);
  const sizeClasses = getSizeClasses(size);
  const variantClasses = getVariantClasses(variant, config);
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  };

  const iconVariants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        sizeClasses.container,
        variantClasses.container,
        className
      )}
      variants={containerVariants}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      transition={{ duration: 0.2 }}
    >
      {showIcon && (
        <motion.span
          variants={iconVariants}
          initial="idle"
          animate={animated ? "animate" : "idle"}
        >
          <Icon className={cn(sizeClasses.icon, variantClasses.text)} aria-hidden="true" />
        </motion.span>
      )}
      <span className={cn(sizeClasses.text, variantClasses.text, "font-medium")}>
        {displayLabel}
      </span>
    </motion.span>
  );
};
