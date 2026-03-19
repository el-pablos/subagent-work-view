import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { AgentStatus } from "./types";

interface AgentStatusRingProps {
  status: AgentStatus;
  size?: number;
  className?: string;
}

const statusColors: Record<
  AgentStatus,
  {
    from: string;
    to: string;
    accent: string;
    glow: string;
    track: string;
  }
> = {
  idle: {
    from: "#64748b",
    to: "#94a3b8",
    accent: "#94a3b8",
    glow: "drop-shadow-[0_0_10px_rgba(100,116,139,0.22)]",
    track: "#1f2937",
  },
  busy: {
    from: "#06b6d4",
    to: "#2dd4bf",
    accent: "#67e8f9",
    glow: "drop-shadow-[0_0_14px_rgba(34,211,238,0.42)]",
    track: "#0f172a",
  },
  communicating: {
    from: "#8b5cf6",
    to: "#d946ef",
    accent: "#c084fc",
    glow: "drop-shadow-[0_0_14px_rgba(192,132,252,0.42)]",
    track: "#111827",
  },
  error: {
    from: "#f43f5e",
    to: "#fb7185",
    accent: "#fda4af",
    glow: "drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]",
    track: "#111827",
  },
};

const AgentStatusRing: React.FC<AgentStatusRingProps> = ({
  status,
  size = 64,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const { from, to, accent, glow, track } = statusColors[status];
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const isBusy = status === "busy";
  const isCommunicating = status === "communicating";
  const strokeDasharray =
    status === "idle"
      ? `${circumference}`
      : `${circumference * 0.76} ${circumference * 0.24}`;

  const ringAnimation = shouldReduceMotion
    ? {}
    : isBusy
      ? {
          rotate: 360,
        }
      : isCommunicating
        ? {
            scale: [1, 1.03, 1],
            opacity: [0.92, 1, 0.92],
          }
        : {
            opacity: [0.85, 1, 0.85],
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
        : {
            duration: 2.6,
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
