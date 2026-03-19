import { useEffect } from "react";
import { useAgentStore } from "../stores/agentStore";
import { useTaskStore } from "../stores/taskStore";
import { useNotificationStore } from "../stores/notificationStore";
import {
  onConnectionStateChange,
  type ConnectionState,
} from "../services/websocket";

/**
 * Bridges Zustand store changes and WebSocket connection events
 * to the notification system. Call once at the app root.
 */
export function useNotificationBridge(): void {
  useEffect(() => {
    const { addNotification } = useNotificationStore.getState();
    let firstAgentChange = true;

    // --- Agent store: notify when a new agent appears ---
    const unsubAgents = useAgentStore.subscribe((state, prev) => {
      if (state.agents === prev.agents) return;

      // Skip the first real change (initial API hydration via setAgents)
      if (firstAgentChange) {
        firstAgentChange = false;
        return;
      }

      for (const id of Object.keys(state.agents)) {
        const numId = Number(id);
        if (!prev.agents[numId]) {
          const agent = state.agents[numId];
          addNotification({
            type: "agent_spawn",
            title: `Agent baru: ${agent.name}`,
            message: `Tipe: ${agent.type} — Status: ${agent.status}`,
          });
        }
      }
    });

    // --- Task store: notify on completion / failure ---
    const unsubTasks = useTaskStore.subscribe((state, prev) => {
      if (state.tasks === prev.tasks) return;

      for (const id of Object.keys(state.tasks)) {
        const numId = Number(id);
        const task = state.tasks[numId];
        const prevTask = prev.tasks[numId];

        // Only react to status transitions, not initial hydration
        if (!prevTask) continue;

        if (task.status === "completed" && prevTask.status !== "completed") {
          addNotification({
            type: "task_complete",
            title: `Task selesai: ${task.title}`,
            message: task.description ?? undefined,
          });
        }

        if (task.status === "failed" && prevTask.status !== "failed") {
          addNotification({
            type: "error",
            title: `Task gagal: ${task.title}`,
            message: task.description ?? undefined,
          });
        }
      }
    });

    // --- WebSocket connection state ---
    let lastConnState: ConnectionState | null = null;

    const unsubConnection = onConnectionStateChange((connState) => {
      if (
        (connState === "disconnected" || connState === "failed") &&
        lastConnState !== connState
      ) {
        addNotification({
          type: "error",
          title: "Koneksi terputus",
          message: "WebSocket terputus. Mencoba menyambung kembali…",
        });
      } else if (
        connState === "connected" &&
        lastConnState &&
        lastConnState !== "connected" &&
        lastConnState !== "connecting"
      ) {
        addNotification({
          type: "success",
          title: "Koneksi pulih",
          message: "WebSocket tersambung kembali.",
        });
      }

      lastConnState = connState;
    });

    return () => {
      unsubAgents();
      unsubTasks();
      unsubConnection();
    };
  }, []);
}
