import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { Network } from "lucide-react";
import type { Agent, AgentConnection, AgentNodePosition } from "./types";
import AgentNode from "./AgentNode";
import {
  fadeInUp,
  staggerContainer,
  statusTransition,
} from "../../lib/animations";

interface AgentTopologyPanelProps {
  agents: Agent[];
  connections?: AgentConnection[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  className?: string;
}

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const getTouchDistance = (touches: React.TouchList): number => {
  if (touches.length < 2) return 0;
  const [first, second] = [touches[0], touches[1]];
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
};

const AgentTopologyPanel: React.FC<AgentTopologyPanelProps> = ({
  agents,
  connections = [],
  selectedAgentId,
  onAgentSelect,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchStateRef = useRef<{ distance: number; scale: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [sourceFilter, setSourceFilter] = useState<"all" | "claude" | "openclaw">("all");
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });

  // Filter agents by source
  const filteredAgents = useMemo(() => {
    if (sourceFilter === "all") return agents;
    return agents.filter((agent) => agent.source === sourceFilter);
  }, [agents, sourceFilter]);

  // Count agents per source
  const sourceCounts = useMemo(() => {
    const counts = { claude: 0, openclaw: 0, all: agents.length };
    agents.forEach((agent) => {
      if (agent.source === "claude") counts.claude++;
      else if (agent.source === "openclaw") counts.openclaw++;
    });
    return counts;
  }, [agents]);

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calculate node positions in a circular layout
  const nodePositions = useMemo((): AgentNodePosition[] => {
    if (filteredAgents.length === 0 || containerSize.width === 0) return [];

    const nodeSize = 64;
    const padding = 60;
    const centerX = containerSize.width / 2;
    const centerY = (containerSize.height - 60) / 2; // Account for header

    // For a single agent, place in center
    if (filteredAgents.length === 1) {
      return [
        {
          id: filteredAgents[0].id,
          x: centerX - nodeSize / 2,
          y: centerY - nodeSize / 2,
        },
      ];
    }

    // For multiple agents, arrange in a circle
    const radius = Math.min(
      (containerSize.width - padding * 2 - nodeSize) / 2,
      (containerSize.height - 100 - padding * 2 - nodeSize) / 2,
      150,
    );

    return filteredAgents.map((agent, index) => {
      const angle = (2 * Math.PI * index) / filteredAgents.length - Math.PI / 2;
      return {
        id: agent.id,
        x: centerX + radius * Math.cos(angle) - nodeSize / 2,
        y: centerY + radius * Math.sin(angle) - nodeSize / 2,
      };
    });
  }, [filteredAgents, containerSize]);

  // Get position by agent ID
  const getPositionById = useCallback(
    (id: string): AgentNodePosition | undefined => {
      return nodePositions.find((pos) => pos.id === id);
    },
    [nodePositions],
  );

  const handlePan = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (pinchStateRef.current) return;

      setViewport((previous) => ({
        ...previous,
        x: clamp(previous.x + info.delta.x, -140, 140),
        y: clamp(previous.y + info.delta.y, -140, 140),
      }));
    },
    [],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2) {
        pinchStateRef.current = {
          distance: getTouchDistance(event.touches),
          scale: viewport.scale,
        };
      }
    },
    [viewport.scale],
  );

  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStateRef.current) return;

    event.preventDefault();
    const currentDistance = getTouchDistance(event.touches);
    if (!currentDistance) return;

    setViewport((previous) => ({
      ...previous,
      scale: clamp(
        pinchStateRef.current
          ? pinchStateRef.current.scale *
              (currentDistance / pinchStateRef.current.distance)
          : previous.scale,
        0.8,
        1.75,
      ),
    }));
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchStateRef.current = null;
    }
  }, []);

  // Render connection lines between agents
  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromPos = getPositionById(connection.fromId);
      const toPos = getPositionById(connection.toId);

      if (!fromPos || !toPos) return null;

      const nodeSize = 64;
      const x1 = fromPos.x + nodeSize / 2;
      const y1 = fromPos.y + nodeSize / 2;
      const x2 = toPos.x + nodeSize / 2;
      const y2 = toPos.y + nodeSize / 2;

      return (
        <g key={`connection-${index}`}>
          <motion.line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={connection.active ? "#0ea5e9" : "#374151"}
            strokeWidth={2}
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: connection.active ? 0.9 : 0.5 }}
            transition={statusTransition.transition}
          />
          {connection.active && (
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="10 8"
              initial={false}
              animate={shouldReduceMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: -36 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: "linear",
              }}
            />
          )}
          {connection.active && !shouldReduceMotion && (
            <>
              <motion.circle
                cx={x1}
                cy={y1}
                r={3}
                fill="#67e8f9"
                initial={false}
                animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.circle
                cx={x1}
                cy={y1}
                r={2.5}
                fill="#e0f2fe"
                initial={false}
                animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.7,
                }}
              />
            </>
          )}
        </g>
      );
    });
  };

  return (
    <section
      aria-labelledby="agent-topology-title"
      className={`glass-panel glow-border noise-overlay flex flex-col rounded-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-900/75 px-3 py-2 backdrop-blur-xl sm:px-4 sm:py-3">
        <div className="flex items-center space-x-2">
          <Network className="h-4 w-4 text-slate-300 sm:h-5 sm:w-5" />
          <h2
            id="agent-topology-title"
            className="text-xs font-semibold text-white sm:text-sm"
          >
            Agent Topology
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 sm:text-xs">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""}
          </span>
          {/* Status legend - hidden on mobile, visible on lg+ */}
          <div className="ml-4 hidden items-center space-x-3 lg:flex">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="text-xs text-slate-400">Idle</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Busy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-sky-500" />
              <span className="text-xs text-slate-400">Communicating</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs text-slate-400">Error</span>
            </div>
          </div>
        </div>
      </div>

      {/* Source filter buttons */}
      <div className="flex items-center gap-2 border-b border-slate-700/50 bg-slate-900/60 px-3 py-2 backdrop-blur-sm sm:px-4">
        <span className="text-[10px] font-medium text-slate-400 sm:text-xs">Filter:</span>
        <div className="flex gap-1" role="group" aria-label="Filter agents by source">
          <button
            type="button"
            onClick={() => setSourceFilter("all")}
            className={`min-h-[28px] rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors sm:px-3 sm:text-xs ${
              sourceFilter === "all"
                ? "border border-slate-600 bg-slate-700/80 text-white"
                : "bg-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
            aria-pressed={sourceFilter === "all"}
          >
            All ({sourceCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter("claude")}
            className={`min-h-[28px] rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors sm:px-3 sm:text-xs ${
              sourceFilter === "claude"
                ? "border border-indigo-400/30 bg-indigo-500/20 text-indigo-100"
                : "bg-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
            aria-pressed={sourceFilter === "claude"}
          >
            Claude Code ({sourceCounts.claude})
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter("openclaw")}
            className={`min-h-[28px] rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors sm:px-3 sm:text-xs ${
              sourceFilter === "openclaw"
                ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-100"
                : "bg-transparent text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
            }`}
            aria-pressed={sourceFilter === "openclaw"}
          >
            OpenClaw ({sourceCounts.openclaw})
          </button>
        </div>
      </div>

      {/* Topology visualization area */}
      <div
        ref={containerRef}
        className="relative min-h-[250px] flex-1 overflow-hidden bg-slate-950/30 p-3 sm:min-h-[300px] sm:p-4"
      >
        <motion.div
          className="absolute inset-0 touch-none"
          style={{ touchAction: "none" }}
          onPan={handlePan}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: viewport.x, y: viewport.y, scale: viewport.scale }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 220, damping: 26 }
            }
          >
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              style={{ zIndex: 0 }}
              aria-hidden="true"
            >
              {renderConnections()}
            </svg>

            <motion.div
              role="group"
              aria-label="Agent topology"
              className="absolute inset-0"
              variants={shouldReduceMotion ? undefined : staggerContainer}
              initial={shouldReduceMotion ? false : "hidden"}
              animate={shouldReduceMotion ? { opacity: 1 } : "show"}
            >
              <AnimatePresence>
                {filteredAgents.map((agent) => {
                  const position = getPositionById(agent.id);
                  if (!position) return null;

                  return (
                    <motion.div
                      key={agent.id}
                      className="absolute"
                      style={{ left: position.x, top: position.y, zIndex: 1 }}
                      variants={shouldReduceMotion ? undefined : fadeInUp}
                      initial={shouldReduceMotion ? { opacity: 1 } : "hidden"}
                      animate={shouldReduceMotion ? { opacity: 1, y: 0 } : "show"}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
                      layout={!shouldReduceMotion}
                    >
                      <AgentNode
                        agent={agent}
                        isSelected={selectedAgentId === agent.id}
                        onClick={onAgentSelect}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Empty state */}
        {filteredAgents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Network className="mx-auto mb-2 h-10 w-10 text-slate-600 sm:h-12 sm:w-12" />
              <p className="text-xs text-slate-300 sm:text-sm">
                {agents.length === 0 ? "No agents connected" : "No agents match this filter"}
              </p>
              <p className="mt-1 px-4 text-[10px] text-slate-400 sm:text-xs">
                {agents.length === 0
                  ? "Agents will appear here when they join the session"
                  : "Try selecting a different filter"}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AgentTopologyPanel;
