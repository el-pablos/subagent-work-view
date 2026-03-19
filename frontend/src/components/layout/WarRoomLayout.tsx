import React, { useState } from "react";
import { ListTodo, MessageSquare, Network } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Task, TaskHistoryEvent } from "../../types/task";
import AgentTopologyPanel from "../agents/AgentTopologyPanel";
import type { Agent, AgentConnection } from "../agents/types";
import CommandConsole from "../communication/CommandConsole";
import CommunicationLogPanel from "../communication/CommunicationLogPanel";
import { NotificationDrawer, ToastContainer } from "../common";
import type {
  Message,
  Agent as CommunicationAgent,
  CommandSuggestion,
} from "../communication/types";
import ActiveTaskPanel from "../tasks/ActiveTaskPanel";
import TaskTimeline from "../tasks/TaskTimeline";
import Header from "./Header";
import type { ConnectionStatus } from "./Header";
import HeaderCommandBar from "./HeaderCommandBar";

export interface WarRoomLayoutProps {
  sessionId?: string;
  connectionStatus: ConnectionStatus;
  isConnected?: boolean;
  agents: Agent[];
  agentConnections?: AgentConnection[];
  selectedAgentId?: string;
  onAgentSelect?: (agent: Agent) => void;
  tasks: Task[];
  taskHistory?: TaskHistoryEvent[];
  onTaskClick?: (task: Task) => void;
  messages: Message[];
  onSendCommand: (command: string) => void;
  commandSuggestions?: CommandSuggestion[];
  onMessageSubscribe?: (sessionId: string) => () => void;
  onSearch?: (query: string) => void;
  onSessionChange?: (sessionId: string) => void;
}

type ActivePanel = "topology" | "tasks" | "comms";

const MOBILE_PANEL_TABS: {
  id: ActivePanel;
  label: string;
  icon: typeof Network;
}[] = [
  { id: "topology", label: "Topology", icon: Network },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "comms", label: "Comms", icon: MessageSquare },
];

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
  const [activePanel, setActivePanel] = useState<ActivePanel>("topology");

  const communicationAgents: CommunicationAgent[] = agents.map((agent) => ({
    id: agent.id,
    uuid: agent.uuid,
    name: agent.name,
    type: agent.role,
    avatar: agent.avatar,
  }));

  const runningTaskCount = tasks.filter(
    (task) => task.status === "running" || task.status === "pending",
  ).length;

  const displayedTaskHistory = selectedTaskId
    ? taskHistory.filter((event) => event.taskId === selectedTaskId)
    : taskHistory;

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setActivePanel("tasks");
    onTaskClick?.(task);
  };

  const timelinePanel = (
    <section aria-label="Task Timeline" className="flex h-full min-h-0 flex-col rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-sm font-semibold text-gray-100">
          Task Timeline
          {selectedTaskId ? " (Filtered)" : ""}
        </h2>
        {selectedTaskId ? (
          <button
            type="button"
            onClick={() => setSelectedTaskId(undefined)}
            className="text-xs text-cyan-400 transition-colors hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Show All
          </button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <TaskTimeline events={displayedTaskHistory} />
      </div>
    </section>
  );

  const consolePanel = (
    <section aria-label="Command Console" className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 px-3 py-2.5 sm:px-4 sm:py-3">
        <h2 className="text-sm font-semibold text-gray-100">Command Console</h2>
      </div>
      <div className="min-h-0 flex-1">
        <CommandConsole
          onSubmit={onSendCommand}
          suggestions={commandSuggestions}
          disabled={!isConnected}
          placeholder={
            isConnected ? "Enter command (e.g., /help)..." : "Reconnecting..."
          }
        />
      </div>
    </section>
  );

  return (
    <div className="flex h-dvh min-h-screen w-full flex-col bg-slate-950">
      <Header
        sessionId={sessionId}
        connectionStatus={connectionStatus}
        activeAgentCount={agents.length}
        runningTaskCount={runningTaskCount}
        onSessionChange={onSessionChange}
      />

      <HeaderCommandBar onSearch={onSearch} />

      <main role="main" aria-label="Dashboard content" className="flex-1 overflow-hidden pb-24 lg:pb-0">
        <div className="flex h-full min-h-0 flex-col gap-3 p-3 md:grid md:grid-cols-2 md:gap-4 md:p-4 lg:grid-cols-12 2xl:grid-cols-14 2xl:gap-5 3xl:px-6 4xl:px-8">
          <section
            aria-labelledby="topology-panel-heading"
            className={cn(
              "min-h-0 flex-col overflow-hidden",
              activePanel === "topology" ? "flex" : "hidden",
              "md:flex md:col-span-1",
              "lg:col-span-7",
              "2xl:col-span-8",
            )}
          >
            <h2 id="topology-panel-heading" className="sr-only">
              Agent topology
            </h2>
            <AgentTopologyPanel
              agents={agents}
              connections={agentConnections}
              selectedAgentId={selectedAgentId}
              onAgentSelect={onAgentSelect}
              className="flex-1 min-h-0"
            />
          </section>

          <aside
            aria-label="Tasks and communications"
            className={cn(
              "min-h-0 flex-col overflow-hidden gap-3 lg:gap-4",
              activePanel === "topology" ? "hidden" : "flex",
              "md:flex md:col-span-1",
              "lg:col-span-5",
              "2xl:col-span-6",
            )}
          >
            <div
              aria-label="Task Panel"
              className={cn(
                "min-h-0 overflow-hidden",
                activePanel === "tasks" ? "flex flex-1 flex-col" : "hidden",
                "md:flex md:flex-1 md:flex-col",
              )}
            >
              <ActiveTaskPanel
                tasks={tasks}
                onTaskClick={handleTaskClick}
                className="h-full min-h-0"
                maxHeight="100%"
              />
            </div>

            <div
              role="log"
              aria-live="polite"
              aria-label="Communication Log"
              className={cn(
                "min-h-0 overflow-hidden",
                activePanel === "comms" ? "flex flex-1 flex-col" : "hidden",
                "md:flex md:flex-1 md:flex-col",
              )}
            >
              <CommunicationLogPanel
                sessionId={sessionId}
                messages={messages}
                agents={communicationAgents}
                onSendCommand={onSendCommand}
                onSubscribe={onMessageSubscribe}
                isConnected={isConnected}
                showFilter={true}
                className="h-full min-h-0"
              />
            </div>

            <div
              className={cn(
                "min-h-0 overflow-hidden md:hidden",
                activePanel === "tasks"
                  ? "flex h-[34vh] min-h-[220px] flex-col"
                  : "hidden",
              )}
            >
              {timelinePanel}
            </div>

            <div
              className={cn(
                "overflow-hidden md:hidden",
                activePanel === "comms"
                  ? "flex min-h-[200px] flex-col"
                  : "hidden",
              )}
            >
              {consolePanel}
            </div>
          </aside>
        </div>
      </main>

      <footer aria-label="Task history and console" className="hidden border-t border-slate-800 bg-slate-900 md:block">
        <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-12 2xl:grid-cols-14 2xl:gap-5 3xl:px-6 4xl:px-8">
          <div className="col-span-1 min-h-0 lg:col-span-8 2xl:col-span-9">
            {timelinePanel}
          </div>
          <div className="col-span-1 min-h-0 lg:col-span-4 2xl:col-span-5">
            {consolePanel}
          </div>
        </div>
      </footer>

      <nav aria-label="Mobile panel navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl pb-safe lg:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {MOBILE_PANEL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePanel(tab.id)}
                aria-label={`Show ${tab.label.toLowerCase()} panel`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-[84px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                  isActive && "bg-slate-800 text-cyan-300",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <ToastContainer />
      <NotificationDrawer />
    </div>
  );
};

export default WarRoomLayout;
