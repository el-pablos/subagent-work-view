import { useState, useCallback, lazy, Suspense } from "react";
import { Toaster } from "sonner";
import type { ConnectionStatus } from "./components/layout/Header";
import type { Agent, AgentConnection } from "./components/agents/types";
import type { Task, TaskHistoryEvent } from "./types/task";
import type {
  Message,
  CommandSuggestion,
} from "./components/communication/types";

// Lazy load WarRoomLayout for code splitting
const WarRoomLayout = lazy(() => import("./components/layout/WarRoomLayout"));

// Mock data for demonstration
const mockAgents: Agent[] = [
  {
    id: "agent-1",
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    name: "Team Lead",
    role: "leader",
    status: "busy",
    currentTask: {
      id: "task-1",
      title: "Coordinate sprint tasks",
      progress: 45,
    },
  },
  {
    id: "agent-2",
    uuid: "550e8400-e29b-41d4-a716-446655440002",
    name: "Frontend Dev",
    role: "executor",
    status: "busy",
    currentTask: {
      id: "task-2",
      title: "Implement dashboard UI",
      progress: 60,
    },
  },
  {
    id: "agent-3",
    uuid: "550e8400-e29b-41d4-a716-446655440003",
    name: "Backend Dev",
    role: "executor",
    status: "communicating",
    currentTask: {
      id: "task-3",
      title: "Build API endpoints",
      progress: 35,
    },
  },
  {
    id: "agent-4",
    uuid: "550e8400-e29b-41d4-a716-446655440004",
    name: "Code Reviewer",
    role: "reviewer",
    status: "idle",
  },
];

const mockConnections: AgentConnection[] = [
  { fromId: "agent-1", toId: "agent-2", active: true },
  { fromId: "agent-1", toId: "agent-3", active: false },
  { fromId: "agent-2", toId: "agent-3", active: true },
  { fromId: "agent-1", toId: "agent-4", active: false },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Coordinate sprint tasks",
    description: "Distribute and monitor team tasks",
    status: "running",
    assignedAgent: { id: "agent-1", name: "Team Lead" },
    progress: 45,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "task-2",
    title: "Implement dashboard UI",
    description: "Create the main dashboard layout and components",
    status: "running",
    assignedAgent: { id: "agent-2", name: "Frontend Dev" },
    progress: 60,
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "task-3",
    title: "Build API endpoints",
    description: "Implement REST API for task management",
    status: "running",
    assignedAgent: { id: "agent-3", name: "Backend Dev" },
    progress: 35,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "task-4",
    title: "Write unit tests",
    description: "Create test coverage for core modules",
    status: "pending",
    progress: 0,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions workflow",
    status: "completed",
    assignedAgent: { id: "agent-3", name: "Backend Dev" },
    progress: 100,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 6000000).toISOString(),
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    duration: 2400,
  },
];

const mockTaskHistory: TaskHistoryEvent[] = [
  {
    id: "event-1",
    taskId: "task-1",
    type: "created",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "event-2",
    taskId: "task-1",
    type: "assigned",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    data: { agent: { id: "agent-1", name: "Team Lead" } },
  },
  {
    id: "event-3",
    taskId: "task-1",
    type: "started",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "event-4",
    taskId: "task-2",
    type: "created",
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "event-5",
    taskId: "task-2",
    type: "assigned",
    timestamp: new Date(Date.now() - 2300000).toISOString(),
    data: { agent: { id: "agent-2", name: "Frontend Dev" } },
  },
  {
    id: "event-6",
    taskId: "task-2",
    type: "started",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "event-7",
    taskId: "task-2",
    type: "progress",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    data: { progress: 60 },
  },
  {
    id: "event-8",
    taskId: "task-5",
    type: "completed",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    data: { agent: { id: "agent-3", name: "Backend Dev" } },
  },
];

const mockMessages: Message[] = [
  {
    id: "msg-1",
    sessionId: "session-abc123",
    channel: "general",
    type: "system",
    content: "Session started. 4 agents connected.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg-2",
    sessionId: "session-abc123",
    channel: "general",
    type: "agent",
    content: "I will start coordinating the sprint tasks.",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    sender: {
      id: "agent-1",
      uuid: "550e8400-e29b-41d4-a716-446655440001",
      name: "Team Lead",
      type: "leader",
    },
  },
  {
    id: "msg-3",
    sessionId: "session-abc123",
    channel: "handoff",
    type: "agent",
    content:
      "Handing off the dashboard layout design to Frontend Dev. Requirements are in the task description.",
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    sender: {
      id: "agent-1",
      uuid: "550e8400-e29b-41d4-a716-446655440001",
      name: "Team Lead",
      type: "leader",
    },
  },
  {
    id: "msg-4",
    sessionId: "session-abc123",
    channel: "general",
    type: "agent",
    content: "Received the task. Starting implementation of the dashboard UI.",
    timestamp: new Date(Date.now() - 2300000).toISOString(),
    sender: {
      id: "agent-2",
      uuid: "550e8400-e29b-41d4-a716-446655440002",
      name: "Frontend Dev",
      type: "executor",
    },
  },
  {
    id: "msg-5",
    sessionId: "session-abc123",
    channel: "general",
    type: "agent",
    content: "API endpoint /api/tasks is now ready. Frontend can integrate.",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    sender: {
      id: "agent-3",
      uuid: "550e8400-e29b-41d4-a716-446655440003",
      name: "Backend Dev",
      type: "executor",
    },
  },
  {
    id: "msg-6",
    sessionId: "session-abc123",
    channel: "alert",
    type: "system",
    content: "Task #5 completed successfully. CI/CD pipeline is now active.",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

const mockCommandSuggestions: CommandSuggestion[] = [
  { command: "/help", description: "Show available commands" },
  { command: "/status", description: "Show current session status" },
  { command: "/agents", description: "List all active agents" },
  { command: "/tasks", description: "List all tasks" },
  {
    command: "/broadcast",
    description: "Send message to all agents",
    usage: "/broadcast <message>",
  },
  { command: "/stop", description: "Stop current session" },
  { command: "/pause", description: "Pause agent execution" },
  { command: "/resume", description: "Resume agent execution" },
];

function App() {
  const [connectionStatus] = useState<ConnectionStatus>("connected");
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();

  const handleAgentSelect = useCallback((agent: Agent) => {
    setSelectedAgentId((prev) => (prev === agent.id ? undefined : agent.id));
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    console.log("Task clicked:", task);
  }, []);

  const handleSendCommand = useCallback((command: string) => {
    console.log("Command sent:", command);
  }, []);

  const handleSearch = useCallback((query: string) => {
    console.log("Search query:", query);
  }, []);

  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading War Room...</p>
          </div>
        </div>
      }
    >
      <WarRoomLayout
        sessionId="session-abc123"
        connectionStatus={connectionStatus}
        isConnected={connectionStatus === "connected"}
        agents={mockAgents}
        agentConnections={mockConnections}
        selectedAgentId={selectedAgentId}
        onAgentSelect={handleAgentSelect}
        tasks={mockTasks}
        taskHistory={mockTaskHistory}
        onTaskClick={handleTaskClick}
        messages={mockMessages}
        onSendCommand={handleSendCommand}
        commandSuggestions={mockCommandSuggestions}
        onSearch={handleSearch}
      />
    </Suspense>
  );
}

export default App;
