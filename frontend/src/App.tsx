import { useEffect, useCallback, useMemo, useState } from "react";
import { WarRoomLayout } from "./components/layout";
import { ToastContainer, NotificationDrawer } from "./components/common";
import type { Agent as UIAgent } from "./components/agents/types";
import type { Task as UITask } from "./types/task";
import type { Message as UIMessage } from "./components/communication/types";
import {
  useAgentStore,
  useTaskStore,
  useSessionStore,
  useMessageStore,
} from "./stores";
import { useNotificationStore } from "./stores/notificationStore";
import { useWebSocketWithStore } from "./hooks/useWebSocket";
import { useNotificationBridge } from "./hooks/useNotificationBridge";
import { fetchAgents, fetchTasks, fetchSessions } from "./services/api";
import {
  mapApiAgentToUI,
  mapApiTaskToUI,
  mapApiMessageToUI,
  buildAgentConnections,
} from "./lib/adapters";
import type { Agent, Task, Session } from "./types";

function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const agentRecords = useAgentStore((s) => s.agents);
  const taskRecords = useTaskStore((s) => s.tasks);
  const messages = useMessageStore((s) => s.messages);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const selectAgent = useAgentStore((s) => s.selectAgent);
  const selectedAgentId = useAgentStore((s) => s.selectedAgentId);
  const setAgents = useAgentStore((s) => s.setAgents);
  const setTasks = useTaskStore((s) => s.setTasks);
  const setSessions = useSessionStore((s) => s.setSessions);
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const clearAgents = useAgentStore((s) => s.clearAgents);
  const clearTasks = useTaskStore((s) => s.clearTasks);
  const clearSessions = useSessionStore((s) => s.clearSessions);
  const clearMessages = useMessageStore((s) => s.clearMessages);
  const agents = useMemo(() => Object.values(agentRecords), [agentRecords]);
  const tasks = useMemo(() => Object.values(taskRecords), [taskRecords]);

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

        if (
          agentsRes.status === "fulfilled" &&
          Array.isArray(agentsRes.value?.data)
        ) {
          setAgents(agentsRes.value.data as Agent[]);
        }
        if (
          tasksRes.status === "fulfilled" &&
          Array.isArray(tasksRes.value?.data)
        ) {
          setTasks(tasksRes.value.data as Task[]);
        }
        if (
          sessionsRes.status === "fulfilled" &&
          Array.isArray(sessionsRes.value?.data)
        ) {
          const sessionList = sessionsRes.value.data as Session[];
          setSessions(sessionList);
          const active = sessionList.find(
            (s) => s.status === "running" || s.status === "planning",
          );
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

  // Bridge store changes → notification toasts
  useNotificationBridge();

  // Wire WebSocket → stores (realtime updates)
  const connectionState = useWebSocketWithStore({
    sessionId: activeSessionId,
  });

  // Map backend types to UI types
  const uiAgents: UIAgent[] = useMemo(
    () => agents.map((a) => mapApiAgentToUI(a, tasks)),
    [agents, tasks],
  );
  const uiTasks: UITask[] = useMemo(() => tasks.map(mapApiTaskToUI), [tasks]);
  const uiMessages: UIMessage[] = useMemo(
    () => messages.map(mapApiMessageToUI),
    [messages],
  );
  const agentConnections = useMemo(
    () => buildAgentConnections(uiMessages),
    [uiMessages],
  );

  const connectionStatus = useMemo(() => {
    return connectionState.state as "connected" | "connecting" | "disconnected";
  }, [connectionState.state]);
  const commandSuggestions = useMemo(
    () => [
      { command: "/help", description: "Tampilkan perintah yang tersedia" },
      { command: "/status", description: "Status sesi saat ini" },
      { command: "/agents", description: "Daftar agent aktif" },
      { command: "/tasks", description: "Daftar semua task" },
    ],
    [],
  );

  const handleAgentSelect = useCallback(
    (agent: UIAgent) => {
      const numId =
        typeof agent.id === "string" ? parseInt(agent.id, 10) : agent.id;
      selectAgent(selectedAgentId === numId ? null : numId);
    },
    [selectAgent, selectedAgentId],
  );

  const handleTaskClick = useCallback((task: UITask) => {
    console.log("Task clicked:", task.id);
  }, []);

  const handleSendCommand = useCallback(
    (command: string) => {
      console.log("Command:", command);
      addNotification({
        type: "info",
        title: "Perintah terkirim",
        message: command,
      });
    },
    [addNotification],
  );

  const handleSearch = useCallback((query: string) => {
    console.log("Search:", query);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Clear all stores first
      clearAgents();
      clearTasks();
      clearSessions();
      clearMessages();

      // Re-fetch all data from API
      const [agentsRes, tasksRes, sessionsRes] = await Promise.allSettled([
        fetchAgents(),
        fetchTasks(),
        fetchSessions(),
      ]);

      if (
        agentsRes.status === "fulfilled" &&
        Array.isArray(agentsRes.value?.data)
      ) {
        setAgents(agentsRes.value.data as Agent[]);
      }
      if (
        tasksRes.status === "fulfilled" &&
        Array.isArray(tasksRes.value?.data)
      ) {
        setTasks(tasksRes.value.data as Task[]);
      }
      if (
        sessionsRes.status === "fulfilled" &&
        Array.isArray(sessionsRes.value?.data)
      ) {
        const sessionList = sessionsRes.value.data as Session[];
        setSessions(sessionList);
        const active = sessionList.find(
          (s) => s.status === "running" || s.status === "planning",
        );
        if (active) setActiveSession(active.id);
      }

      addNotification({
        type: "success",
        title: "Data refreshed",
        message: "All data has been refreshed from server",
      });
    } catch {
      addNotification({
        type: "error",
        title: "Refresh failed",
        message: "Failed to refresh data from server",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [
    clearAgents,
    clearTasks,
    clearSessions,
    clearMessages,
    setAgents,
    setTasks,
    setSessions,
    setActiveSession,
    addNotification,
  ]);

  return (
    <>
      <WarRoomLayout
        sessionId={activeSessionId ? String(activeSessionId) : "default"}
        connectionStatus={connectionStatus}
        isConnected={connectionStatus === "connected"}
        agents={uiAgents}
        agentConnections={agentConnections}
        selectedAgentId={
          selectedAgentId != null ? String(selectedAgentId) : undefined
        }
        onAgentSelect={handleAgentSelect}
        tasks={uiTasks}
        taskHistory={[]}
        onTaskClick={handleTaskClick}
        messages={uiMessages}
        onSendCommand={handleSendCommand}
        commandSuggestions={commandSuggestions}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <ToastContainer />
      <NotificationDrawer />
    </>
  );
}

export default App;
