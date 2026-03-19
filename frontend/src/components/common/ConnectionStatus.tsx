import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "../../lib/utils";

export type ConnectionState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

export interface ConnectionStatusProps {
  status: ConnectionState;
  className?: string;
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = {
    connected: {
      icon: Wifi,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      label: "Terhubung",
    },
    connecting: {
      icon: Loader2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      label: "Menghubungkan...",
    },
    disconnected: {
      icon: WifiOff,
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      label: "Terputus",
    },
    error: {
      icon: WifiOff,
      color: "text-red-400",
      bg: "bg-red-500/10",
      label: "Error",
    },
  }[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-1",
        config.bg,
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={`Status koneksi: ${config.label}`}
    >
      <motion.div
        animate={
          status === "connecting" && !shouldReduceMotion ? { rotate: 360 } : {}
        }
        transition={
          status === "connecting" && !shouldReduceMotion
            ? { duration: 1, repeat: Infinity, ease: "linear" }
            : undefined
        }
      >
        <Icon className={cn("h-3 w-3", config.color)} />
      </motion.div>
      <span className={cn("text-[10px] font-medium", config.color)}>
        {config.label}
      </span>
      <AnimatePresence>
        {status === "connected" && (
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={
              shouldReduceMotion
                ? undefined
                : { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }
            }
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 2, repeat: Infinity }
            }
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
