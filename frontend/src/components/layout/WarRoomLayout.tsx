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

      {/* Command Bar */}
      <HeaderCommandBar onSearch={onSearch} />

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-4 p-4">
          {/* Left Side - Agent Topology (7 columns) */}
          <div className="col-span-7 flex flex-col space-y-4 overflow-hidden">
            <AgentTopologyPanel
              agents={agents}
              connections={agentConnections}
              selectedAgentId={selectedAgentId}
              onAgentSelect={onAgentSelect}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Right Side - Tasks and Communication (5 columns) */}
          <div className="col-span-5 flex flex-col space-y-4 overflow-hidden">
            {/* Active Tasks Panel */}
            <div className="h-1/2 overflow-hidden">
              <ActiveTaskPanel
                tasks={tasks}
                onTaskClick={handleTaskClick}
                maxHeight="100%"
              />
            </div>

            {/* Communication Log Panel */}
            <div className="h-1/2 overflow-hidden">
              <CommunicationLogPanel
                sessionId={sessionId}
                messages={messages}
                agents={communicationAgents}
                onSendCommand={onSendCommand}
                onSubscribe={onMessageSubscribe}
                isConnected={isConnected}
                showFilter={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Timeline and Console */}
      <div className="bg-slate-900 border-t border-slate-800">
        <div className="grid grid-cols-12 gap-4 p-4">
          {/* Task Timeline (8 columns) */}
          <div className="col-span-8">
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

          {/* Command Console (4 columns) */}
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
        </div>
      </div>
    </div>
  );
};

export default WarRoomLayout;
