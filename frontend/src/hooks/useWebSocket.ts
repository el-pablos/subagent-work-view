import { useEffect, useCallback, useRef, useState } from "react";
import {
  echo,
  getConnectionState,
  onConnectionStateChange,
  type ConnectionState,
} from "../services/websocket";
import type { Agent, Task, Session, Message } from "../types";

// Event payload types
export interface AgentSpawnedEvent {
  agent: Agent;
  session_id?: number;
}

export interface AgentStatusChangedEvent {
  agent: Agent;
  previousStatus: Agent["status"];
}

export interface AgentTerminatedEvent {
  agent: Agent;
  reason?: string;
  session_id?: number;
}

export interface TaskUpdatedEvent {
  task: Task;
  previousStatus?: Task["status"];
}

export interface TaskProgressUpdatedEvent {
  task: Task;
  progress: number;
  previousProgress: number;
}

export interface SessionUpdatedEvent {
  session: Session;
}

export interface MessageCreatedEvent {
  message: Message;
}

// Channel names
const DASHBOARD_CHANNEL = "dashboard.global";
const sessionChannel = (sessionId: number | string) => `session.${sessionId}`;

// Event names
export const WS_EVENTS = {
  AGENT_SPAWNED: "agent.spawned",
  AGENT_STATUS_CHANGED: "agent.status_changed",
  AGENT_TERMINATED: "agent.terminated",
  TASK_UPDATED: "task.updated",
  TASK_CREATED: "task.created",
  TASK_PROGRESS_UPDATED: "task.progress_updated",
  SESSION_UPDATED: "session.updated",
  MESSAGE_CREATED: "message.created",
} as const;

// ==================== Connection State Hook ====================

export function useWebSocketConnection() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(getConnectionState);

  useEffect(() => {
    const unsubscribe = onConnectionStateChange(setConnectionState);
    return unsubscribe;
  }, []);

  return connectionState;
}

// ==================== Dashboard Channel Hook ====================

export interface UseDashboardWebSocketOptions {
  onAgentSpawned?: (event: AgentSpawnedEvent) => void;
  onAgentStatusChanged?: (event: AgentStatusChangedEvent) => void;
  onAgentTerminated?: (event: AgentTerminatedEvent) => void;
  onTaskUpdated?: (event: TaskUpdatedEvent) => void;
  onTaskCreated?: (event: TaskUpdatedEvent) => void;
  onTaskProgressUpdated?: (event: TaskProgressUpdatedEvent) => void;
  onSessionUpdated?: (event: SessionUpdatedEvent) => void;
}

export function useDashboardWebSocket(options: UseDashboardWebSocketOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const channel = echo.channel(DASHBOARD_CHANNEL);

    // Subscribe to agent spawned
    channel.listen(
      `.${WS_EVENTS.AGENT_SPAWNED}`,
      (event: AgentSpawnedEvent) => {
        console.log("[WS] Agent spawned:", event);
        optionsRef.current.onAgentSpawned?.(event);
      },
    );

    // Subscribe to agent status changes
    channel.listen(
      `.${WS_EVENTS.AGENT_STATUS_CHANGED}`,
      (event: AgentStatusChangedEvent) => {
        console.log("[WS] Agent status changed:", event);
        optionsRef.current.onAgentStatusChanged?.(event);
      },
    );

    // Subscribe to agent terminated
    channel.listen(
      `.${WS_EVENTS.AGENT_TERMINATED}`,
      (event: AgentTerminatedEvent) => {
        console.log("[WS] Agent terminated:", event);
        optionsRef.current.onAgentTerminated?.(event);
      },
    );

    // Subscribe to task updates
    channel.listen(`.${WS_EVENTS.TASK_UPDATED}`, (event: TaskUpdatedEvent) => {
      console.log("[WS] Task updated:", event);
      optionsRef.current.onTaskUpdated?.(event);
    });

    // Subscribe to task creation
    channel.listen(`.${WS_EVENTS.TASK_CREATED}`, (event: TaskUpdatedEvent) => {
      console.log("[WS] Task created:", event);
      optionsRef.current.onTaskCreated?.(event);
    });

    // Subscribe to task progress updates
    channel.listen(
      `.${WS_EVENTS.TASK_PROGRESS_UPDATED}`,
      (event: TaskProgressUpdatedEvent) => {
        console.log("[WS] Task progress updated:", event);
        optionsRef.current.onTaskProgressUpdated?.(event);
      },
    );

    // Subscribe to session updates
    channel.listen(
      `.${WS_EVENTS.SESSION_UPDATED}`,
      (event: SessionUpdatedEvent) => {
        console.log("[WS] Session updated:", event);
        optionsRef.current.onSessionUpdated?.(event);
      },
    );

    // Cleanup on unmount
    return () => {
      echo.leave(DASHBOARD_CHANNEL);
    };
  }, []);
}

// ==================== Session-Specific Channel Hook ====================

export interface UseSessionWebSocketOptions {
  sessionId: number | string | null;
  onTaskUpdated?: (event: TaskUpdatedEvent) => void;
  onTaskCreated?: (event: TaskUpdatedEvent) => void;
  onTaskProgressUpdated?: (event: TaskProgressUpdatedEvent) => void;
  onMessageCreated?: (event: MessageCreatedEvent) => void;
  onSessionUpdated?: (event: SessionUpdatedEvent) => void;
}

export function useSessionWebSocket(options: UseSessionWebSocketOptions) {
  const { sessionId } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!sessionId) return;

    const channelName = sessionChannel(sessionId);
    const channel = echo.channel(channelName);

    // Subscribe to task updates for this session
    channel.listen(`.${WS_EVENTS.TASK_UPDATED}`, (event: TaskUpdatedEvent) => {
      console.log(`[WS] Session ${sessionId} - Task updated:`, event);
      optionsRef.current.onTaskUpdated?.(event);
    });

    // Subscribe to task creation for this session
    channel.listen(`.${WS_EVENTS.TASK_CREATED}`, (event: TaskUpdatedEvent) => {
      console.log(`[WS] Session ${sessionId} - Task created:`, event);
      optionsRef.current.onTaskCreated?.(event);
    });

    // Subscribe to task progress updates for this session
    channel.listen(
      `.${WS_EVENTS.TASK_PROGRESS_UPDATED}`,
      (event: TaskProgressUpdatedEvent) => {
        console.log(
          `[WS] Session ${sessionId} - Task progress updated:`,
          event,
        );
        optionsRef.current.onTaskProgressUpdated?.(event);
      },
    );

    // Subscribe to messages for this session
    channel.listen(
      `.${WS_EVENTS.MESSAGE_CREATED}`,
      (event: MessageCreatedEvent) => {
        console.log(`[WS] Session ${sessionId} - Message created:`, event);
        optionsRef.current.onMessageCreated?.(event);
      },
    );

    // Subscribe to session updates
    channel.listen(
      `.${WS_EVENTS.SESSION_UPDATED}`,
      (event: SessionUpdatedEvent) => {
        console.log(`[WS] Session ${sessionId} - Session updated:`, event);
        optionsRef.current.onSessionUpdated?.(event);
      },
    );

    // Cleanup on unmount or session change
    return () => {
      echo.leave(channelName);
    };
  }, [sessionId]);
}

// ==================== Combined Hook with Store Integration ====================

export interface UseWebSocketWithStoreOptions {
  sessionId?: number | string | null;
  // Store update functions
  updateAgent?: (agent: Agent) => void;
  updateTask?: (task: Task) => void;
  addTask?: (task: Task) => void;
  updateSession?: (session: Session) => void;
  addMessage?: (message: Message) => void;
}

export function useWebSocketWithStore(options: UseWebSocketWithStoreOptions) {
  const {
    sessionId,
    updateAgent,
    updateTask,
    addTask,
    updateSession,
    addMessage,
  } = options;

  // Dashboard-level subscriptions (always active)
  useDashboardWebSocket({
    onAgentStatusChanged: useCallback(
      (event: AgentStatusChangedEvent) => {
        updateAgent?.(event.agent);
      },
      [updateAgent],
    ),
    onTaskUpdated: useCallback(
      (event: TaskUpdatedEvent) => {
        updateTask?.(event.task);
      },
      [updateTask],
    ),
    onTaskCreated: useCallback(
      (event: TaskUpdatedEvent) => {
        addTask?.(event.task);
      },
      [addTask],
    ),
    onSessionUpdated: useCallback(
      (event: SessionUpdatedEvent) => {
        updateSession?.(event.session);
      },
      [updateSession],
    ),
  });

  // Session-specific subscriptions (when viewing a session)
  useSessionWebSocket({
    sessionId: sessionId ?? null,
    onTaskUpdated: useCallback(
      (event: TaskUpdatedEvent) => {
        updateTask?.(event.task);
      },
      [updateTask],
    ),
    onTaskCreated: useCallback(
      (event: TaskUpdatedEvent) => {
        addTask?.(event.task);
      },
      [addTask],
    ),
    onMessageCreated: useCallback(
      (event: MessageCreatedEvent) => {
        addMessage?.(event.message);
      },
      [addMessage],
    ),
    onSessionUpdated: useCallback(
      (event: SessionUpdatedEvent) => {
        updateSession?.(event.session);
      },
      [updateSession],
    ),
  });

  // Return connection state
  return useWebSocketConnection();
}

export default useWebSocketWithStore;
