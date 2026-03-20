import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "../../lib/utils";

export type ConnectionState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

export type ConnectionQuality = "excellent" | "good" | "poor" | null;

export interface ConnectionStatusProps {
  status: ConnectionState;
  quality?: ConnectionQuality;
  latency?: number; // in milliseconds
  className?: string;
}

// Quality indicator bars component
function QualityBars({
  quality,
  shouldReduceMotion,
}: {
  quality: ConnectionQuality;
  shouldReduceMotion: boolean | null;
}) {
  const bars = quality === "excellent" ? 3 : quality === "good" ? 2 : 1;
  const barColor =
    quality === "excellent"
      ? "bg-emerald-400"
      : quality === "good"
        ? "bg-amber-400"
        : "bg-red-400";

  return (
    <div className="flex items-end gap-[2px] h-3">
      {[1, 2, 3].map((level) => (
        <motion.div
          key={level}
          className={cn(
            "w-[3px] rounded-sm",
            level <= bars ? barColor : "bg-slate-600/50",
          )}
          initial={{ height: 0 }}
          animate={{
            height: level === 1 ? 4 : level === 2 ? 7 : 10,
            opacity: level <= bars ? 1 : 0.3,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.3, delay: level * 0.1 }
          }
        />
      ))}
    </div>
  );
}

// Reconnecting wave animation
function ReconnectingWaves({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean | null;
}) {
  return (
    <div className="relative flex items-center justify-center w-5 h-5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full rounded-full border border-amber-400/60"
          animate={
            shouldReduceMotion
              ? { opacity: 0.5 }
              : {
                  scale: [0.3, 1.2],
                  opacity: [0.8, 0],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut",
                }
          }
        />
      ))}
      <Loader2
        className={cn(
          "h-3 w-3 text-amber-400 relative z-10",
          !shouldReduceMotion && "animate-spin",
        )}
      />
    </div>
  );
}

// Pulsing dot for connected state
function PulsingDot({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean | null;
}) {
  return (
    <div className="relative">
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-400"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 2],
                opacity: [0.4, 0],
              }
        }
        transition={
          shouldReduceMotion
            ? undefined
            : {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }
        }
        style={{ width: 8, height: 8 }}
      />
      {/* Inner solid dot */}
      <div className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
    </div>
  );
}

// Alert icon for error/disconnected
function AlertIcon({
  status,
  shouldReduceMotion,
}: {
  status: "disconnected" | "error";
  shouldReduceMotion: boolean | null;
}) {
  const isError = status === "error";
  return (
    <motion.div
      animate={
        shouldReduceMotion
          ? undefined
          : isError
            ? { scale: [1, 1.1, 1] }
            : undefined
      }
      transition={
        shouldReduceMotion
          ? undefined
          : isError
            ? { duration: 0.5, repeat: Infinity }
            : undefined
      }
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 text-red-400" />
      ) : (
        <WifiOff className="h-4 w-4 text-slate-400" />
      )}
    </motion.div>
  );
}

export function ConnectionStatus({
  status,
  quality = null,
  latency,
  className,
}: ConnectionStatusProps) {
  const shouldReduceMotion = useReducedMotion();

  const config = {
    connected: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/15 border-emerald-500/30",
      label: "Terhubung",
      glow: "shadow-[0_0_12px_rgba(52,211,153,0.3)]",
    },
    connecting: {
      color: "text-amber-400",
      bg: "bg-amber-500/15 border-amber-500/30",
      label: "Menghubungkan",
      glow: "",
    },
    disconnected: {
      color: "text-slate-400",
      bg: "bg-slate-500/15 border-slate-500/30",
      label: "Terputus",
      glow: "",
    },
    error: {
      color: "text-red-400",
      bg: "bg-red-500/15 border-red-500/30",
      label: "Koneksi Error",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.3)]",
    },
  }[status];

  const qualityLabel =
    quality === "excellent"
      ? "Sangat Baik"
      : quality === "good"
        ? "Baik"
        : quality === "poor"
          ? "Lemah"
          : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 5 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 border",
          config.bg,
          config.glow,
          // Make disconnected/error states more prominent
          (status === "disconnected" || status === "error") &&
            "border-2 animate-pulse",
          className,
        )}
        role="status"
        aria-live="assertive"
        aria-label={`Status koneksi: ${config.label}${qualityLabel ? `, Kualitas: ${qualityLabel}` : ""}${latency ? `, Latency: ${latency}ms` : ""}`}
      >
        {/* Status icon area */}
        <div className="flex items-center">
          {status === "connected" && (
            <PulsingDot shouldReduceMotion={shouldReduceMotion} />
          )}
          {status === "connecting" && (
            <ReconnectingWaves shouldReduceMotion={shouldReduceMotion} />
          )}
          {(status === "disconnected" || status === "error") && (
            <AlertIcon
              status={status}
              shouldReduceMotion={shouldReduceMotion}
            />
          )}
        </div>

        {/* Label and details */}
        <div className="flex flex-col">
          <span
            className={cn("text-xs font-semibold leading-tight", config.color)}
          >
            {config.label}
          </span>
          {status === "connected" && (qualityLabel || latency) && (
            <span className="text-[10px] text-slate-400 leading-tight">
              {qualityLabel}
              {qualityLabel && latency && " · "}
              {latency && `${latency}ms`}
            </span>
          )}
          {status === "connecting" && (
            <span className="text-[10px] text-amber-400/70 leading-tight">
              Mencoba koneksi ulang...
            </span>
          )}
          {status === "disconnected" && (
            <span className="text-[10px] text-slate-500 leading-tight">
              Periksa jaringan Anda
            </span>
          )}
          {status === "error" && (
            <span className="text-[10px] text-red-400/70 leading-tight">
              Gagal terhubung ke server
            </span>
          )}
        </div>

        {/* Quality indicator for connected state */}
        {status === "connected" && quality && (
          <QualityBars
            quality={quality}
            shouldReduceMotion={shouldReduceMotion}
          />
        )}

        {/* Connected icon for visual confirmation */}
        {status === "connected" && (
          <Wifi className="h-4 w-4 text-emerald-400 ml-1" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
