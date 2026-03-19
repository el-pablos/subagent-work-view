import React, { useState } from "react";
import { Network, ListTodo, MessageSquare } from "lucide-react";
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

type MobileTab = "topology" | "tasks" | "comms";

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
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>("topology");

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
      <div className="hidden sm:block">
        <HeaderCommandBar onSearch={onSearch} />
      </div>

      {/* Main Content - Mobile: single panel with tabs, Tablet+: multi-column */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile Layout (< md) - Single column with tab navigation */}
        <div className="h-full md:hidden flex flex-col">
          {/* Mobile panel content */}
          <div className="flex-1 overflow-hidden p-2">
            {mobileActiveTab === "topology" && (
              <AgentTopologyPanel
                agents={agents}
                connections={agentConnections}
                selectedAgentId={selectedAgentId}
                onAgentSelect={onAgentSelect}
                className="h-full"
              />
            )}
            {mobileActiveTab === "tasks" && (
              <ActiveTaskPanel
                tasks={tasks}
                onTaskClick={handleTaskClick}
                maxHeight="100%"
                className="h-full"
              />
            )}
            {mobileActiveTab === "comms" && (
              <CommunicationLogPanel
                sessionId={sessionId}
                messages={messages}
                agents={communicationAgents}
                onSendCommand={onSendCommand}
                onSubscribe={onMessageSubscribe}
                isConnected={isConnected}
                showFilter={true}
                className="h-full"
              />
            )}
          </div>

          {/* Mobile Bottom Navigation Tabs */}
          <nav
            className="flex border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm pb-safe"
            role="tablist"
            aria-label="Mobile navigation"
          >
            <button
              role="tab"
              aria-selected={mobileActiveTab === "topology"}
              aria-controls="mobile-panel-topology"
              onClick={() => setMobileActiveTab("topology")}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors relative ${
                mobileActiveTab === "topology"
                  ? "text-cyan-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <Network className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">Topology</span>
            </button>
            <button
              role="tab"
              aria-selected={mobileActiveTab === "tasks"}
              aria-controls="mobile-panel-tasks"
              onClick={() => setMobileActiveTab("tasks")}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors relative ${
                mobileActiveTab === "tasks"
                  ? "text-cyan-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <ListTodo className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">Tasks</span>
              {runningTaskCount > 0 && (
                <span className="absolute top-1 right-4 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full">
                  {runningTaskCount}
                </span>
              )}
            </button>
            <button
              role="tab"
              aria-selected={mobileActiveTab === "comms"}
              aria-controls="mobile-panel-comms"
              onClick={() => setMobileActiveTab("comms")}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors relative ${
                mobileActiveTab === "comms"
                  ? "text-cyan-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">Comms</span>
              {messages.length > 0 && (
                <span className="absolute top-1 right-4 px-1.5 py-0.5 text-[9px] font-bold bg-blue-500 text-white rounded-full">
                  {messages.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tablet Layout (md to lg) - 2 column */}
        <div className="hidden md:flex lg:hidden h-full gap-3 p-3">
          {/* Left column - Topology + Tasks */}
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            <div className="flex-1 min-h-0">
              <AgentTopologyPanel
                agents={agents}
                connections={agentConnections}
                selectedAgentId={selectedAgentId}
                onAgentSelect={onAgentSelect}
                className="h-full"
              />
            </div>
            <div className="flex-1 min-h-0">
              <ActiveTaskPanel
                tasks={tasks}
                onTaskClick={handleTaskClick}
                maxHeight="100%"
                className="h-full"
              />
            </div>
          </div>

          {/* Right column - Communications */}
          <div className="w-2/5 overflow-hidden">
            <CommunicationLogPanel
              sessionId={sessionId}
              messages={messages}
              agents={communicationAgents}
              onSendCommand={onSendCommand}
              onSubscribe={onMessageSubscribe}
              isConnected={isConnected}
              showFilter={true}
              className="h-full"
            />
          </div>
        </div>

        {/* Desktop Layout (lg+) - Original 3 column grid */}
        <div className="hidden lg:grid h-full grid-cols-12 gap-4 p-4">
          {/* Left Side - Agent Topology (7 columns on lg, 6 on 3xl+) */}
          <div className="col-span-7 3xl:col-span-6 flex flex-col space-y-4 overflow-hidden">
            <AgentTopologyPanel
              agents={agents}
              connections={agentConnections}
              selectedAgentId={selectedAgentId}
              onAgentSelect={onAgentSelect}
              className="flex-1 min-h-0"
            />
          </div>

          {/* Right Side - Tasks and Communication (5 columns on lg, 6 on 3xl+) */}
          <div className="col-span-5 3xl:col-span-6 flex flex-col space-y-4 overflow-hidden">
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

      {/* Bottom Section - Timeline and Console - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block bg-slate-900 border-t border-slate-800">
        <div className="grid grid-cols-12 gap-4 p-4">
          {/* Task Timeline (8 columns on lg, 7 on 3xl+) */}
          <div className="col-span-8 3xl:col-span-7">
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

          {/* Command Console (4 columns on lg, 5 on 3xl+) */}
          <div className="col-span-4 3xl:col-span-5">
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
