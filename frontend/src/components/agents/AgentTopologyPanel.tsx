import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";
import AgentNode from "./AgentNode";
import type { Agent, AgentConnection, AgentNodePosition } from "./types";

interface AgentTopologyPanelProps {
  agents: Agent[];
  connections?: AgentConnection[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  className?: string;
}

type SourceFilter = "all" | "claude" | "openclaw";

const AgentTopologyPanel: React.FC<AgentTopologyPanelProps> = ({
  agents,
  connections = [],
  selectedAgentId,
  onAgentSelect,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const filteredAgents = useMemo(() => {
    if (sourceFilter === "all") {
      return agents;
    }

    return agents.filter((agent) => agent.source === sourceFilter);
  }, [agents, sourceFilter]);

  const sourceCounts = useMemo(() => {
    const counts = { all: agents.length, claude: 0, openclaw: 0 };

    agents.forEach((agent) => {
      if (agent.source === "claude") {
        counts.claude += 1;
      }

      if (agent.source === "openclaw") {
        counts.openclaw += 1;
      }
    });

    return counts;
  }, [agents]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) {
        return;
      }

      setContainerSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const layoutMetrics = useMemo(() => {
    const width = containerSize.width;

    if (width >= 1536) {
      return { nodeSize: 72, padding: 76, radiusCap: 220, headerOffset: 112 };
    }

    if (width >= 1024) {
      return { nodeSize: 64, padding: 60, radiusCap: 170, headerOffset: 104 };
    }

    if (width >= 640) {
      return { nodeSize: 56, padding: 42, radiusCap: 136, headerOffset: 96 };
    }

    return { nodeSize: 48, padding: 28, radiusCap: 96, headerOffset: 84 };
  }, [containerSize.width]);

  const nodePositions = useMemo((): AgentNodePosition[] => {
    if (filteredAgents.length === 0 || containerSize.width === 0) {
      return [];
    }

    const { nodeSize, padding, radiusCap, headerOffset } = layoutMetrics;
    const centerX = containerSize.width / 2;
    const centerY = (containerSize.height - headerOffset) / 2 + headerOffset / 2;

    if (filteredAgents.length === 1) {
      return [
        {
          id: filteredAgents[0].id,
          x: centerX - nodeSize / 2,
          y: centerY - nodeSize / 2,
        },
      ];
    }

    const minRadius = filteredAgents.length > 8 ? 72 : 56;
    const radius = Math.max(
      Math.min(
        (containerSize.width - padding * 2 - nodeSize) / 2,
        (containerSize.height - headerOffset - padding * 2 - nodeSize) / 2,
        radiusCap,
      ),
      minRadius,
    );

    return filteredAgents.map((agent, index) => {
      const angle = (2 * Math.PI * index) / filteredAgents.length - Math.PI / 2;

      return {
        id: agent.id,
        x: centerX + radius * Math.cos(angle) - nodeSize / 2,
        y: centerY + radius * Math.sin(angle) - nodeSize / 2,
      };
    });
  }, [containerSize, filteredAgents, layoutMetrics]);

  const getPositionById = useCallback(
    (id: string): AgentNodePosition | undefined => {
      return nodePositions.find((position) => position.id === id);
    },
    [nodePositions],
  );

  const renderConnections = () => {
    return connections.map((connection, index) => {
      const fromPos = getPositionById(connection.fromId);
      const toPos = getPositionById(connection.toId);

      if (!fromPos || !toPos) {
        return null;
      }

      const nodeSize = layoutMetrics.nodeSize;
      const strokeWidth = nodeSize < 56 ? 1.5 : 2;
      const endpointRadius = nodeSize < 56 ? 3 : 4;
      const x1 = fromPos.x + nodeSize / 2;
      const y1 = fromPos.y + nodeSize / 2;
      const x2 = toPos.x + nodeSize / 2;
      const y2 = toPos.y + nodeSize / 2;

      return (
        <g key={`connection-${index}`}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {connection.active ? (
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#38bdf8"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray="8 4"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -24 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : null}

          {connection.active ? (
            <>
              <motion.circle
                cx={x1}
                cy={y1}
                r={endpointRadius}
                fill="#38bdf8"
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              />
              <motion.circle
                cx={x2}
                cy={y2}
                r={endpointRadius}
                fill="#38bdf8"
                initial={{ scale: 1.2, opacity: 1 }}
                animate={{ scale: 0.8, opacity: 0.5 }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              />
            </>
          ) : null}
        </g>
      );
    });
  };

  return (
    <section
      aria-labelledby="agent-topology-title"
      className={`flex h-full min-h-0 flex-col rounded-lg border border-gray-800 bg-gray-900 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
          <h2 id="agent-topology-title" className="text-sm font-semibold text-gray-100">
            Agent Topology
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1 text-[10px] text-slate-400 sm:hidden">
            Pinch-to-zoom soon
          </span>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Idle</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Busy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Comms</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Error</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-800 bg-gray-900/60 px-3 py-2 sm:px-4">
        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto"
          role="group"
          aria-label="Filter agents by source"
        >
          {([
            { id: "all", label: `All (${sourceCounts.all})`, activeClass: "bg-slate-700 text-white" },
            { id: "claude", label: `Claude (${sourceCounts.claude})`, activeClass: "bg-indigo-600 text-white" },
            { id: "openclaw", label: `OpenClaw (${sourceCounts.openclaw})`, activeClass: "bg-emerald-600 text-white" },
          ] as {
            id: SourceFilter;
            label: string;
            activeClass: string;
          }[]).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSourceFilter(filter.id)}
              aria-pressed={sourceFilter === filter.id}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                sourceFilter === filter.id
                  ? filter.activeClass
                  : "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-[280px] flex-1 touch-pan-y overflow-hidden p-3 sm:min-h-[340px] sm:p-4 2xl:min-h-[420px]"
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
          style={{ zIndex: 0 }}
        >
          {renderConnections()}
        </svg>

        <div role="group" aria-label="Agent topology" className="absolute inset-0">
          {filteredAgents.map((agent) => {
            const position = getPositionById(agent.id);

            if (!position) {
              return null;
            }

            return (
              <motion.div
                key={agent.id}
                className="absolute"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: position.x,
                  y: position.y,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ zIndex: 1 }}
              >
                <AgentNode
                  agent={agent}
                  isSelected={selectedAgentId === agent.id}
                  onClick={onAgentSelect}
                  size={layoutMetrics.nodeSize}
                />
              </motion.div>
            );
          })}
        </div>

        {filteredAgents.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-4 text-center">
              <Network className="mx-auto mb-2 h-10 w-10 text-gray-700 sm:h-12 sm:w-12" />
              <p className="text-sm text-gray-500">
                {agents.length === 0
                  ? "No agents connected"
                  : "No agents match this filter"}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {agents.length === 0
                  ? "Agents will appear here when they join the session"
                  : "Try selecting a different source filter"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AgentTopologyPanel;
