import { motion } from "framer-motion";
import {
  AlertCircle,
  type LucideIcon,
  Search,
  WifiOff,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: "default" | "search" | "error" | "offline";
}

export function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const VariantIcon =
    variant === "offline" ? WifiOff : variant === "error" ? AlertCircle : Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="glass-panel flex flex-col items-center justify-center rounded-xl px-4 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-800/50"
        aria-hidden="true"
      >
        <VariantIcon className="h-8 w-8 text-slate-500" />
      </motion.div>
      <h3 className="mb-1 text-sm font-medium text-slate-300">{title}</h3>
      {description && (
        <p className="max-w-[240px] text-xs text-slate-500">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 min-h-[36px] rounded-lg bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          aria-label={action.label}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
