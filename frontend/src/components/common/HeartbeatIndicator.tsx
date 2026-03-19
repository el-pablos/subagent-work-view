import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface HeartbeatIndicatorProps {
  isAlive: boolean;
  lastSeen?: string | Date;
  size?: "sm" | "md";
  className?: string;
}

export function HeartbeatIndicator({
  isAlive,
  lastSeen,
  size = "sm",
  className,
}: HeartbeatIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const dotSize = size === "sm" ? "w-2 h-2" : "w-3 h-3";

  return (
    <span
      className={cn("relative inline-flex", className)}
      title={lastSeen ? `Terakhir terlihat ${new Date(lastSeen).toLocaleString("id-ID")}` : undefined}
      aria-label={isAlive ? "Agen aktif" : "Agen tidak aktif"}
    >
      {isAlive && !shouldReduceMotion && (
        <motion.span
          className={cn(
            "absolute inline-flex rounded-full bg-emerald-400 opacity-75",
            dotSize,
          )}
          animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          dotSize,
          isAlive ? "bg-emerald-400" : "bg-slate-600",
        )}
      />
    </span>
  );
}
