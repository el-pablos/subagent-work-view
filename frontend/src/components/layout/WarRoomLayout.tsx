import React, { useState } from "react";
import Header from "./Header";
import type { ConnectionStatus } from "./Header";
import HeaderCommandBar from "./HeaderCommandBar";
import AgentTopologyPanel from "../agents/AgentTopologyPanel";
import type { Agent, AgentConnection } from "../agents/types";
import ActiveTaskPanel from "../tasks/ActiveTaskPanel";
import type { Task, TaskHistoryEvent } from "../../types/task";
import CommunicationLogPanel from "../communication/CommunicationLogPanel";
import TaskTimeline from "../tasks/TaskTimeline";
import CommandConsole from "../communication/CommandConsole";
import { useResponsive } from "../../hooks";
import type {
  Message,
  Agent as CommunicationAgent,
  CommandSuggestion,
} from "../communication/types";

export interface WarRoomLayoutProps {
  // Session and connection
  sessionId?: string;
  connectionStatus: ConnectionStatus;
  isConnected?: boolean;

  // Agents
  agents: Agent[];
  agentConnections?: AgentConnection[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;

  // Tasks
  tasks: Task[];
  taskHistory?: TaskHistoryEvent[];
  onTaskClick?: (task: Task) => void;

  // Communication
  messages: Message[];
  onSendCommand: (command: string) => void;
  commandSuggestions?: CommandSuggestion[];
  onMessageSubscribe?: (sessionId: string) => () => void;

  // Search and actions
  onSearch?: (query: string) => void;
  onSessionChange?: (sessionId: string) => void;
}

const WarRoomLayout: React.FC<WarRoomLayoutProps> = ({
  sessionId = "default-session",
  connectionStatus,
  isConnected = true,
  agents,
  agentConnections = [],
  selectedAgentId,
  onAgentSelect,
  tasks,
  taskHistory = [],
  onTaskClick,
  messages,
  onSendCommand,
  commandSuggestions,
  onMessageSubscribe,
  onSearch,
  onSessionChange,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Convert Agent to CommunicationAgent format
  const communicationAgents: CommunicationAgent[] = agents.map((agent) => ({
    id: agent.id,
    uuid: agent.uuid,
    name: agent.name,
    type: agent.role,
    avatar: agent.avatar,
  }));

  // Get active/running task count
  const runningTaskCount = tasks.filter(
    (task) => task.status === "running" || task.status === "pending",
  ).length;

  // Get task history for selected task or all tasks
  const displayedTaskHistory = selectedTaskId
    ? taskHistory.filter((event) => event.taskId === selectedTaskId)
    : taskHistory;

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    onTaskClick?.(task);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950">
      {/* Header */}
      <Header
        sessionId={sessionId}
        connectionStatus={connectionStatus}
        activeAgentCount={agents.length}
        runningTaskCount={runningTaskCount}
        onSessionChange={onSessionChange}
      />

      {/* Command Bar - Hidden on mobile */}
      {!isMobile && <HeaderCommandBar onSearch={onSearch} />}

      {/* Main Content Grid - Responsive */}
      <div className="flex-1 overflow-hidden">
        <div
          className={`h-full gap-4 p-2 sm:p-4 ${
            isMobile
              ? "flex flex-col" // Mobile: Stack vertically
              : isTablet
                ? "grid grid-cols-2" // Tablet: 2 columns
                : "grid grid-cols-12" // Desktop: 12 column grid
          }`}
        >
          {/* Agent Topology Panel */}
          <div
            className={`flex flex-col space-y-4 overflow-hidden ${
              isMobile
                ? "order-1" // Mobile: First
                : isTablet
                  ? "col-span-1" // Tablet: First column
                  : "col-span-7" // Desktop: 7 columns
            }`}
          >
            <AgentTopologyPanel
              agents={agents}
              connections={agentConnections}
              selectedAgentId={selectedAgentId}
              onAgentSelect={onAgentSelect}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Tasks and Communication Panel */}
          <div
            className={`flex flex-col space-y-4 overflow-hidden ${
              isMobile
                ? "order-2" // Mobile: Second
                : isTablet
                  ? "col-span-1" // Tablet: Second column
                  : "col-span-5" // Desktop: 5 columns
            }`}
          >
            {/* Active Tasks Panel */}
            <div
              className={isMobile ? "min-h-[300px]" : "h-1/2 overflow-hidden"}
            >
              <ActiveTaskPanel
                tasks={tasks}
                onTaskClick={handleTaskClick}
                maxHeight="100%"
              />
            </div>

            {/* Communication Log Panel */}
            <div
              className={isMobile ? "min-h-[300px]" : "h-1/2 overflow-hidden"}
            >
              <CommunicationLogPanel
                sessionId={sessionId}
                messages={messages}
                agents={communicationAgents}
                onSendCommand={onSendCommand}
                onSubscribe={onMessageSubscribe}
                showFilter={!isMobile} // Hide filter on mobile to save space
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Timeline and Console - Hidden on mobile, shown as tabs on tablet */}
      {!isMobile && (
        <div className="bg-slate-900 border-t border-slate-800">
          <div
            className={`gap-4 p-2 sm:p-4 ${
              isTablet ? "grid grid-cols-1" : "grid grid-cols-12"
            }`}
          >
            {/* Task Timeline */}
            <div className={isTablet ? "col-span-1" : "col-span-8"}>
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 max-h-[200px] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-100">
                    Task Timeline
                    {selectedTaskId && " (Filtered)"}
                  </h3>
                  {selectedTaskId && (
                    <button
                      onClick={() => setSelectedTaskId(undefined)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Show All
                    </button>
                  )}
                </div>
                <TaskTimeline events={displayedTaskHistory} />
              </div>
            </div>

            {/* Command Console - Hidden on tablet to save space */}
            {isDesktop && (
              <div className="col-span-4">
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden h-full">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-100">
                      Command Console
                    </h3>
                  </div>
                  <CommandConsole
                    onSubmit={onSendCommand}
                    suggestions={commandSuggestions}
                    disabled={!isConnected}
                    placeholder={
                      isConnected
                        ? "Enter command (e.g., /help)..."
                        : "Reconnecting..."
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WarRoomLayout;
