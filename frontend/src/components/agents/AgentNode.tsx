import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Agent } from "./types";
import AgentStatusRing from "./AgentStatusRing";
import TypingIndicator from "./TypingIndicator";

interface AgentNodeProps {
  agent: Agent;
  isSelected?: boolean;
  isRecentlyChanged?: boolean;
  onClick?: (agent: Agent) => void;
  size?: number;
  className?: string;
}

const roleColors: Record<string, string> = {
  leader: "bg-indigo-600",
  worker: "bg-green-600",
  reviewer: "bg-amber-600",
  planner: "bg-violet-600",
  executor: "bg-blue-600",
};

const getInitials = (name: string): string => {
  return name
    .split(/[\s-_]+/)
    .map((word) => word[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
};

// Status to glow color mapping
const statusGlowColors: Record<string, string> = {
  idle: "rgba(148, 163, 184, 0.4)", // slate
  busy: "rgba(16, 185, 129, 0.6)", // emerald
  communicating: "rgba(56, 189, 248, 0.6)", // sky
  error: "rgba(244, 63, 94, 0.6)", // rose
};

const AgentNode: React.FC<AgentNodeProps> = ({
  agent,
  isSelected = false,
  isRecentlyChanged = false,
  onClick,
  size = 64,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const avatarSize = size - 12; // Leave space for the ring

  const isWorking = agent.status === "busy" || agent.status === "communicating";
  const bgColor = roleColors[agent.role] || "bg-gray-600";
  const glowColor = statusGlowColors[agent.status] || statusGlowColors.idle;

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onClick={() => onClick?.(agent)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={
        isRecentlyChanged
          ? {
              scale: [1, 1.1, 1],
              transition: {
                duration: 0.4,
                ease: "easeInOut",
              },
            }
          : {}
      }
    >
      {/* Active glow effect */}
      {isWorking && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 20px 8px ${glowColor}`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Pulse ring animation on status change */}
      {isRecentlyChanged && (
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: glowColor }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            scale: [1, 1.5, 2],
            opacity: [1, 0.5, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            repeat: 2,
          }}
        />
      )}
      {/* Status ring */}
      <AgentStatusRing status={agent.status} size={size} />

      {/* Avatar container */}
      <div
        className="absolute flex items-center justify-center rounded-full overflow-hidden"
        style={{
          width: avatarSize,
          height: avatarSize,
          top: (size - avatarSize) / 2,
          left: (size - avatarSize) / 2,
        }}
      >
        {agent.avatar ? (
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${bgColor}`}
          >
            <span className="text-white font-semibold text-sm">
              {getInitials(agent.name)}
            </span>
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Working indicator (typing dots) */}
      {isWorking && (
        <motion.div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full px-2 py-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TypingIndicator />
        </motion.div>
      )}

      {/* Tooltip on hover */}
      {isHovered && (
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          style={{ bottom: size + 8 }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg min-w-[120px]">
            <div className="text-sm font-medium text-gray-100 whitespace-nowrap">
              {agent.name}
            </div>
            <div className="text-xs text-gray-400 capitalize">{agent.role}</div>
            {agent.currentTask && (
              <div className="mt-1 pt-1 border-t border-gray-700">
                <div className="text-xs text-gray-500">Current task:</div>
                <div className="text-xs text-gray-300 truncate max-w-[150px]">
                  {agent.currentTask.title}
                </div>
                <div className="mt-1 bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${agent.currentTask.progress}%` }}
                  />
                </div>
              </div>
            )}
            {/* Tooltip arrow */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45" />
          </div>
        </motion.div>
      )}

      {/* Agent name label below */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
        {agent.name}
      </div>
    </motion.div>
  );
};

export default AgentNode;
