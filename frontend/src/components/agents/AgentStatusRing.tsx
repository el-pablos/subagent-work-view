import React from "react";
import { motion } from "framer-motion";
import type { AgentStatus } from "./types";

interface AgentStatusRingProps {
  status: AgentStatus;
  size?: number;
  className?: string;
}

const statusColors: Record<AgentStatus, { ring: string; glow: string }> = {
  idle: {
    ring: "stroke-slate-400",
    glow: "drop-shadow-none",
  },
  busy: {
    ring: "stroke-emerald-500",
    glow: "drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  communicating: {
    ring: "stroke-sky-500",
    glow: "drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]",
  },
  error: {
    ring: "stroke-rose-500",
    glow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]",
  },
};

const AgentStatusRing: React.FC<AgentStatusRingProps> = ({
  status,
  size = 64,
  className = "",
}) => {
  const { ring, glow } = statusColors[status];
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const isPulsing = status === "busy" || status === "communicating";

  return (
    <svg
      width={size}
      height={size}
      className={`${glow} ${className}`}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-gray-700"
      />

      {/* Animated status ring */}
      <motion.circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={ring}
        strokeDasharray={circumference}
        strokeDashoffset={0}
        initial={{ rotate: 0 }}
        animate={
          isPulsing
            ? {
                rotate: 360,
                strokeDashoffset: [0, circumference * 0.25, 0],
              }
            : {}
        }
        transition={
          isPulsing
            ? {
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                },
                strokeDashoffset: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {}
        }
        style={{ transformOrigin: "center" }}
      />

      {/* Pulse effect for busy/communicating */}
      {isPulsing && (
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={1}
          className={ring}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{
            opacity: [0.6, 0],
            scale: [1, 1.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "center" }}
        />
      )}
    </svg>
  );
};

export default AgentStatusRing;
