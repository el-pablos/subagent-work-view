import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendValue,
  icon,
  className,
}: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
        ? "text-red-400"
        : "text-slate-400";

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 shadow-lg backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">
            {value}
          </p>
        </div>
        {icon && (
          <div className="shrink-0 text-slate-400" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn("mt-2 flex items-center gap-1", trendColor)}>
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          <span className="text-[10px] font-medium">
            {trendValue ?? "No change"}
          </span>
        </div>
      )}
    </motion.div>
  );
}
