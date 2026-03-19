import { useEffect, useCallback, useMemo } from "react";
import { WarRoomLayout } from "./components/layout";
import { ToastContainer, NotificationDrawer } from "./components/common";
import type { Agent as UIAgent } from "./components/agents/types";
import type { Task as UITask } from "./types/task";
import type { Message as UIMessage } from "./components/communication/types";
import { useAgentStore, useTaskStore, useSessionStore, useMessageStore } from "./stores";
import { useNotificationStore } from "./stores/notificationStore";
import { useWebSocketWithStore } from "./hooks/useWebSocket";
import {
  fetchAgents,
  fetchTasks,
  fetchSessions,
} from "./services/api";
import {
  mapApiAgentToUI,
  mapApiTaskToUI,
  mapApiMessageToUI,
  buildAgentConnections,
} from "./lib/adapters";
import type { Agent, Task, Session } from "./types";

function App() {
  const agents = useAgentStore((s) => Object.values(s.agents));
  const tasks = useTaskStore((s) => Object.values(s.tasks));
  const messages = useMessageStore((s) => s.messages);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const selectAgent = useAgentStore((s) => s.selectAgent);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const setAgents = useAgentStore((s) => s.setAgents);
  const setTasks = useTaskStore((s) => s.setTasks);
  const setSessions = useSessionStore((s) => s.setSessions);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Hydrate stores from API on mount
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [agentsRes, tasksRes, sessionsRes] = await Promise.allSettled([
          fetchAgents(),
          fetchTasks(),
          fetchSessions(),
        ]);

        if (cancelled) return;

        if (agentsRes.status === "fulfilled" && Array.isArray(agentsRes.value?.data)) {
          setAgents(agentsRes.value.data as Agent[]);
        }
        if (tasksRes.status === "fulfilled" && Array.isArray(tasksRes.value?.data)) {
          setTasks(tasksRes.value.data as Task[]);
        }
        if (sessionsRes.status === "fulfilled" && Array.isArray(sessionsRes.value?.data)) {
          const sessionList = sessionsRes.value.data as Session[];
          setSessions(sessionList);
          const active = sessionList.find((s) => s.status === "running" || s.status === "planning");
          if (active) setActiveSession(active.id);
        }
      } catch {
        // API might be unavailable — UI still works with WebSocket-only data
      }
    }

    hydrate();
    // Re-hydrate every 30s as fallback
    const interval = setInterval(hydrate, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setAgents, setTasks, setSessions, setActiveSession]);

  // Wire WebSocket → stores (realtime updates)
  const connectionState = useWebSocketWithStore({
    sessionId: activeSessionId,
  });

  // Map backend types to UI types
  const uiAgents: UIAgent[] = useMemo(() => agents.map((a) => mapApiAgentToUI(a, tasks)), [agents, tasks]);
  const uiTasks: UITask[] = useMemo(() => tasks.map(mapApiTaskToUI), [tasks]);
  const uiMessages: UIMessage[] = useMemo(() => messages.map(mapApiMessageToUI), [messages]);
  const agentConnections = useMemo(() => buildAgentConnections(uiMessages), [uiMessages]);

  const connectionStatus = useMemo(() => {
    return connectionState as "connected" | "connecting" | "disconnected";
  }, [connectionState]);

  const handleAgentSelect = useCallback(
    (agent: UIAgent) => {
      const numId = typeof agent.id === "string" ? parseInt(agent.id, 10) : agent.id;
      selectAgent(selectedAgentId === numId ? null : numId);
    },
    [selectAgent, selectedAgentId],
  );

  const handleTaskClick = useCallback((task: UITask) => {
    console.log("Task clicked:", task.id);
  }, []);

  const handleSendCommand = useCallback((command: string) => {
    console.log("Command:", command);
    addNotification({ type: "info", title: "Perintah terkirim", message: command });
  }, [addNotification]);

  const handleSearch = useCallback((query: string) => {
    console.log("Search:", query);
  }, []);

  return (
    <>
      <WarRoomLayout
        sessionId={activeSessionId ? String(activeSessionId) : "default"}
        connectionStatus={connectionStatus}
        isConnected={connectionStatus === "connected"}
        agents={uiAgents}
        agentConnections={agentConnections}
        selectedAgentId={selectedAgentId != null ? String(selectedAgentId) : undefined}
        onAgentSelect={handleAgentSelect}
        tasks={uiTasks}
        taskHistory={[]}
        onTaskClick={handleTaskClick}
        messages={uiMessages}
        onSendCommand={handleSendCommand}
        commandSuggestions={[
          { command: "/help", description: "Tampilkan perintah yang tersedia" },
          { command: "/status", description: "Status sesi saat ini" },
          { command: "/agents", description: "Daftar agent aktif" },
          { command: "/tasks", description: "Daftar semua task" },
        ]}
        onSearch={handleSearch}
      />
      <ToastContainer />
      <NotificationDrawer />
    </>
  );
}

export default App;
