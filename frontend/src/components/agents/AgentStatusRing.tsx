import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { AgentStatus } from "./types";

interface AgentStatusRingProps {
  status: AgentStatus;
  size?: number;
  className?: string;
}

// Colorblind-safe palette with high contrast and distinct hues
// Idle: Cool gray-blue (neutral, low energy)
// Busy: Warm orange (active, high energy)
// Communicating: Purple-blue (distinct from busy)
// Error: Red-pink (danger, critical)
const statusColors: Record<
  AgentStatus,
  {
    from: string;
    to: string;
    accent: string;
    glow: string;
    track: string;
    pulseIntensity: number;
  }
> = {
  idle: {
    from: "#64748b", // Slate-500
    to: "#94a3b8", // Slate-400
    accent: "#cbd5e1", // Slate-300
    glow: "drop-shadow-[0_0_8px_rgba(100,116,139,0.18)]",
    track: "#1e293b",
    pulseIntensity: 0.5, // Subtle pulse for idle
  },
  busy: {
    from: "#f97316", // Orange-500 - distinct from cyan/blue for colorblind users
    to: "#fb923c", // Orange-400
    accent: "#fdba74", // Orange-300
    glow: "drop-shadow-[0_0_16px_rgba(249,115,22,0.48)]",
    track: "#0f172a",
    pulseIntensity: 1.0, // Full pulse for busy
  },
  communicating: {
    from: "#8b5cf6", // Violet-500
    to: "#a78bfa", // Violet-400
    accent: "#c4b5fd", // Violet-300
    glow: "drop-shadow-[0_0_16px_rgba(139,92,246,0.48)]",
    track: "#111827",
    pulseIntensity: 0.85, // Strong pulse for communicating
  },
  error: {
    from: "#dc2626", // Red-600 - deeper red for better visibility
    to: "#ef4444", // Red-500
    accent: "#f87171", // Red-400
    glow: "drop-shadow-[0_0_18px_rgba(220,38,38,0.55)]",
    track: "#111827",
    pulseIntensity: 0.9, // Urgent pulse for error
  },
};

const AgentStatusRing: React.FC<AgentStatusRingProps> = ({
  status,
  size = 64,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const { from, to, accent, glow, track, pulseIntensity } =
    statusColors[status];
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const isBusy = status === "busy";
  const isCommunicating = status === "communicating";
  const isError = status === "error";
  const isActive = isBusy || isCommunicating || isError;
  const strokeDasharray =
    status === "idle"
      ? `${circumference}`
      : `${circumference * 0.76} ${circumference * 0.24}`;

  const ringAnimation = shouldReduceMotion
    ? {}
    : isBusy
      ? {
          rotate: 360,
          opacity: [0.95, 1, 0.95],
        }
      : isCommunicating
        ? {
            scale: [1, 1.03, 1],
            opacity: [0.92, 1, 0.92],
          }
        : isError
          ? {
              opacity: [0.85, 1, 0.85],
              scale: [1, 1.02, 1],
            }
          : {
              opacity: [0.7, 0.85, 0.7],
            };

  const ringTransition = shouldReduceMotion
    ? {}
    : isBusy
      ? {
          duration: 2.2,
          repeat: Infinity,
          ease: "linear" as const,
        }
      : isCommunicating
        ? {
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }
        : isError
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }
          : {
              duration: 3.0,
              repeat: Infinity,
              ease: "easeInOut" as const,
            };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("absolute left-0 top-0 overflow-visible", glow, className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${gradientId}-ring`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={track}
        strokeWidth={strokeWidth}
        opacity={0.9}
      />

      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId}-ring)`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        initial={false}
        animate={ringAnimation}
        transition={ringTransition}
        style={{ transformOrigin: "50% 50%" }}
      />

      {/* Pulse ring for active states */}
      {isActive && !shouldReduceMotion && (
        <motion.circle
          cx={center}
          cy={center}
          r={radius + 2}
          fill="none"
          stroke={accent}
          strokeWidth={1.5}
          initial={false}
          animate={{
            opacity: [0.6 * pulseIntensity, 0, 0.6 * pulseIntensity],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: isBusy ? 1.5 : isError ? 1.2 : 1.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "50% 50%" }}
        />
      )}

      {isCommunicating && !shouldReduceMotion && (
        <motion.circle
          cx={center}
          cy={center}
          r={radius + 1.5}
          fill="none"
          stroke={accent}
          strokeWidth={1.25}
          initial={false}
          animate={{
            opacity: [0.45, 0, 0.45],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "50% 50%" }}
        />
      )}
    </svg>
  );
};

export default AgentStatusRing;
