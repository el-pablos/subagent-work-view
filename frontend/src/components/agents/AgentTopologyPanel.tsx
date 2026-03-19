import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network } from "lucide-react";
import type { Agent, AgentConnection, AgentNodePosition } from "./types";
import AgentNode from "./AgentNode";
import { echo } from "../../services/websocket";
import { SearchInput, FilterTags, FilterTag } from "../common";

// WebSocket event types for agents channel
interface AgentSpawnedEvent {
  agent: Agent;
}

interface AgentTerminatedEvent {
  agentId: string;
}

interface AgentStatusUpdatedEvent {
  agentId: string;
  status: Agent["status"];
  currentTask?: Agent["currentTask"];
}

interface AgentTopologyPanelProps {
  agents: Agent[];
  connections?: AgentConnection[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  onAgentsChange?: (agents: Agent[]) => void;
  className?: string;
}

const AgentTopologyPanel: React.FC<AgentTopologyPanelProps> = ({
  agents: initialAgents,
  connections = [],
  selectedAgentId,
  onAgentSelect,
  onAgentsChange,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilters, setStatusFilters] = useState<FilterTag[]>([]);

  // Available status filters
  const availableStatuses: Array<{
    status: Agent["status"];
    label: string;
    color: FilterTag["color"];
  }> = [
    { status: "idle", label: "Idle", color: "gray" },
    { status: "busy", label: "Busy", color: "green" },
    { status: "communicating", label: "Communicating", color: "blue" },
    { status: "error", label: "Error", color: "red" },
  ];

  // Toggle status filter
  const toggleStatusFilter = (status: Agent["status"]) => {
    const existingFilter = statusFilters.find((f) => f.value === status);
    if (existingFilter) {
      setStatusFilters((prev) => prev.filter((f) => f.value !== status));
    } else {
      const statusConfig = availableStatuses.find((s) => s.status === status);
      if (statusConfig) {
        setStatusFilters((prev) => [
          ...prev,
          {
            id: status,
            label: statusConfig.label,
            value: status,
            color: statusConfig.color,
          },
        ]);
      }
    }
  };

  // Remove filter by ID
  const removeFilter = (filterId: string) => {
    setStatusFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilters([]);
  };

  // Filter agents based on search and status filters
  const filteredAgents = useMemo(() => {
    let result = agents;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.role?.toLowerCase().includes(query) ||
          agent.currentTask?.toLowerCase().includes(query),
      );
    }

    // Apply status filters
    if (statusFilters.length > 0) {
      const statusValues = statusFilters.map((f) => f.value);
      result = result.filter((agent) => statusValues.includes(agent.status));
    }

    return result;
  }, [agents, searchQuery, statusFilters]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setIsSearching(true);
    setSearchQuery(value);
    // Simulate search completion
    setTimeout(() => setIsSearching(false), 300);
  };

  // Sync with external agents prop
  useEffect(() => {
    setAgents(initialAgents);
  }, [initialAgents]);

  // Notify parent of agent changes
  useEffect(() => {
    onAgentsChange?.(agents);
  }, [agents, onAgentsChange]);

  // Subscribe to WebSocket agents channel for realtime updates
  useEffect(() => {
    const channel = echo.channel("agents");

    // Handle new agent spawn
    channel.listen(".agent.spawned", (event: AgentSpawnedEvent) => {
      console.log("[WS] Agent spawned:", event);
      setAgents((prev) => {
        // Check if agent already exists
        if (prev.some((a) => a.id === event.agent.id)) {
          return prev;
        }
        return [...prev, event.agent];
      });
      // Mark as recently changed for animation
      setRecentlyChangedIds((prev) => new Set(prev).add(event.agent.id));
      setTimeout(() => {
        setRecentlyChangedIds((prev) => {
          const next = new Set(prev);
          next.delete(event.agent.id);
          return next;
        });
      }, 2000);
    });

    // Handle agent termination
    channel.listen(".agent.terminated", (event: AgentTerminatedEvent) => {
      console.log("[WS] Agent terminated:", event);
      setAgents((prev) => prev.filter((a) => a.id !== event.agentId));
    });

    // Handle agent status update
    channel.listen(
      ".agent.status_updated",
      (event: AgentStatusUpdatedEvent) => {
        console.log("[WS] Agent status updated:", event);
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === event.agentId
              ? {
                  ...agent,
                  status: event.status,
                  currentTask: event.currentTask ?? agent.currentTask,
                }
              : agent,
          ),
        );
        // Mark as recently changed for pulse animation
        setRecentlyChangedIds((prev) => new Set(prev).add(event.agentId));
        setTimeout(() => {
          setRecentlyChangedIds((prev) => {
            const next = new Set(prev);
            next.delete(event.agentId);
            return next;
          });
        }, 1500);
      },
    );

    // Cleanup on unmount
    return () => {
      echo.leave("agents");
    };
  }, []);

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
    if (agents.length === 0 || containerSize.width === 0) return [];

    const nodeSize = 64;
    const padding = 60;
    const centerX = containerSize.width / 2;
    const centerY = (containerSize.height - 60) / 2; // Account for header

    // For a single agent, place in center
    if (agents.length === 1) {
      return [
        {
          id: agents[0].id,
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

    return agents.map((agent, index) => {
      const angle = (2 * Math.PI * index) / agents.length - Math.PI / 2;
      return {
        id: agent.id,
        x: centerX + radius * Math.cos(angle) - nodeSize / 2,
        y: centerY + radius * Math.sin(angle) - nodeSize / 2,
      };
    });
  }, [agents, containerSize]);

  // Get position by agent ID
  const getPositionById = useCallback(
    (id: string): AgentNodePosition | undefined => {
      return nodePositions.find((pos) => pos.id === id);
    },
    [nodePositions],
  );

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
          {/* Background line */}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#374151"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Active connection animation */}
          {connection.active && (
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="8 4"
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: -24 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
          {/* Connection dots at endpoints */}
          {connection.active && (
            <>
              <motion.circle
                cx={x1}
                cy={y1}
                r={4}
                fill="#38bdf8"
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.circle
                cx={x2}
                cy={y2}
                r={4}
                fill="#38bdf8"
                initial={{ scale: 1.2, opacity: 1 }}
                animate={{ scale: 0.8, opacity: 0.5 }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </>
          )}
        </g>
      );
    });
  };

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-100">
            Agent Topology
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
          </span>
          {/* Status legend */}
          <div className="flex items-center space-x-3 ml-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs text-gray-500">Idle</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Busy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-xs text-gray-500">Communicating</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs text-gray-500">Error</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topology visualization area */}
      <div ref={containerRef} className="flex-1 relative min-h-[300px] p-4">
        {/* SVG layer for connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {renderConnections()}
        </svg>

        {/* Agent nodes with AnimatePresence for enter/exit animations */}
        <AnimatePresence mode="popLayout">
          {agents.map((agent) => {
            const position = getPositionById(agent.id);
            if (!position) return null;

            const isRecentlyChanged = recentlyChangedIds.has(agent.id);

            return (
              <motion.div
                key={agent.id}
                className="absolute"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                  x: position.x,
                  y: position.y,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  rotate: 180,
                  transition: { duration: 0.3, ease: "easeIn" },
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  mass: 0.8,
                }}
                style={{ zIndex: 1 }}
              >
                <AgentNode
                  agent={agent}
                  isSelected={selectedAgentId === agent.id}
                  onClick={onAgentSelect}
                  isRecentlyChanged={isRecentlyChanged}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {agents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-12 h-12 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No agents connected</p>
              <p className="text-xs text-gray-600 mt-1">
                Agents will appear here when they join the session
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTopologyPanel;
