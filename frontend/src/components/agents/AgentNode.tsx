import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Agent } from "./types";
import AgentStatusRing from "./AgentStatusRing";
import TypingIndicator from "./TypingIndicator";
import {
  fadeInUp,
  hoverScale,
  pulseGlow,
  scaleIn,
  tapScale,
} from "../../lib/animations";
import { cn } from "../../lib/utils";
import { detectAgentSource, getSourceInfo } from "../../lib/sourceDetection";

interface AgentNodeProps {
  agent: Agent;
  isSelected?: boolean;
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

const AgentNode: React.FC<AgentNodeProps> = ({
  agent,
  isSelected = false,
  onClick,
  size = 64,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const buttonSize = Math.max(size, 44);
  const avatarSize = buttonSize - 12;
  const isWorking = agent.status === "busy" || agent.status === "communicating";
  const showPulseGlow = agent.status === "busy";
  const bgColor = roleColors[agent.role] || "bg-gray-600";
  const source = detectAgentSource(agent);
  const sourceInfo = getSourceInfo(source);

  return (
    <motion.button
      type="button"
      className={cn(
        "relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-none bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        className,
      )}
      style={{ width: buttonSize, height: buttonSize }}
      onClick={() => onClick?.(agent)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      initial={shouldReduceMotion ? false : "hidden"}
      animate={shouldReduceMotion ? { opacity: 1, scale: 1 } : "show"}
      variants={shouldReduceMotion ? undefined : scaleIn}
      whileHover={shouldReduceMotion ? undefined : hoverScale}
      whileTap={shouldReduceMotion ? undefined : tapScale}
      aria-label={`${agent.name}, ${agent.role}, ${agent.status}`}
      aria-pressed={isSelected}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        aria-hidden="true"
        variants={shouldReduceMotion ? undefined : pulseGlow}
        initial={false}
        animate={!shouldReduceMotion && showPulseGlow ? "active" : "idle"}
      />

      <AgentStatusRing status={agent.status} size={buttonSize} />

      <div
        className="absolute flex items-center justify-center overflow-hidden rounded-full"
        style={{
          width: avatarSize,
          height: avatarSize,
          top: (buttonSize - avatarSize) / 2,
          left: (buttonSize - avatarSize) / 2,
        }}
      >
        {agent.avatar ? (
          <img
            src={agent.avatar}
            alt={agent.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${bgColor}`}>
            <span className="text-sm font-semibold text-white">
              {getInitials(agent.name)}
            </span>
          </div>
        )}
      </div>

      <span
        className={cn(
          "absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-slate-900",
          sourceInfo.bgColor,
        )}
        aria-hidden="true"
      />
      <span className="sr-only">Source: {sourceInfo.label}</span>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWorking && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gray-800 px-2 py-1"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          >
            <TypingIndicator />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2"
            style={{ bottom: buttonSize + 8 }}
            initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
            animate={shouldReduceMotion ? { opacity: 1, y: 0 } : "show"}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            variants={shouldReduceMotion ? undefined : fadeInUp}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          >
            <div className="relative min-w-[120px] rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 shadow-lg">
              <div className="whitespace-nowrap text-fluid-sm font-medium tracking-tight text-gray-100">
                {agent.name}
              </div>
              <div className="text-xs capitalize text-gray-400">{agent.role}</div>
              {agent.currentTask && (
                <div className="mt-1 border-t border-gray-700 pt-1">
                  <div className="text-xs text-gray-500">Current task:</div>
                  <div className="max-w-[150px] truncate text-xs text-gray-300">
                    {agent.currentTask.title}
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${agent.currentTask.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-gray-700 bg-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-fluid-xs font-medium tracking-tight text-gray-400">
        {agent.name}
      </div>
    </motion.button>
  );
};

export default AgentNode;
