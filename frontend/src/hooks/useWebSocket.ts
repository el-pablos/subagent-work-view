import { useEffect, useMemo, useRef, useState } from "react";
import {
  echo,
  getConnectionState,
  onConnectionStateChange,
  type ConnectionState,
} from "../services/websocket";
import { useAgentStore, useMessageStore, useSessionStore, useTaskStore } from "../stores";
import type { Agent, Message, Session, Task } from "../types";

type ChannelInstance = ReturnType<typeof echo.channel>;
type EntityRecord = Record<string, unknown>;

type AgentSocketPayload = Partial<Agent> & Pick<Agent, "id">;
type TaskSocketPayload = Partial<Task> &
  Pick<Task, "id" | "session_id"> & {
    assigned_agent?: Partial<Agent>;
  };
type SessionSocketPayload = Partial<Session> & Pick<Session, "id">;
type MessageSocketPayload = Partial<Message> &
  Pick<Message, "id" | "session_id"> & {
    from_agent?: Partial<Agent>;
    to_agent?: Partial<Agent>;
  };

export interface AgentStatusChangedEvent {
  agent: AgentSocketPayload;
  previousStatus?: Agent["status"];
}

export interface AgentCreatedEvent {
  agent: AgentSocketPayload;
}

export interface TaskUpdatedEvent {
  task: TaskSocketPayload;
  previousStatus?: Task["status"];
}

export interface TaskCompletedEvent {
  task: TaskSocketPayload;
}

export interface SessionUpdatedEvent {
  session: SessionSocketPayload;
}

export interface SessionCreatedEvent {
  session: SessionSocketPayload;
}

export interface SessionCompletedEvent {
  session: SessionSocketPayload;
}

export interface MessageCreatedEvent {
  message: MessageSocketPayload;
}

const DASHBOARD_CHANNELS = ["dashboard", "dashboard.global"] as const;
const sessionChannel = (sessionId: number | string) => `session.${sessionId}`;
const agentChannel = (agentId: number | string) => `agent.${agentId}`;

export const WS_EVENTS = {
  AGENT_CREATED: "agent.created",
  AGENT_STATUS_CHANGED: "agent.status_changed",
  MESSAGE_CREATED: "message.created",
  SESSION_COMPLETED: "session.completed",
  SESSION_CREATED: "session.created",
  SESSION_UPDATED: "session.updated",
  TASK_COMPLETED: "task.completed",
  TASK_CREATED: "task.created",
  TASK_UPDATED: "task.updated",
} as const;

function isEntityRecord(value: unknown): value is EntityRecord {
  return typeof value === "object" && value !== null;
}

function extractPayload<T extends EntityRecord>(
  payload: unknown,
  key: string,
): T | null {
  if (!isEntityRecord(payload)) {
    return null;
  }

  const nestedValue = payload[key];
  if (isEntityRecord(nestedValue)) {
    return nestedValue as T;
  }

  return payload as T;
}

function subscribe(channelName: string, register: (channel: ChannelInstance) => void) {
  const channel = echo.channel(channelName);
  register(channel);

  return () => {
    echo.leave(channelName);
  };
}

function mergeAgentPayload(payload: AgentSocketPayload): Agent {
  const existing = useAgentStore.getState().agents[payload.id];
  const fallbackTimestamp = existing?.updated_at ?? new Date().toISOString();

  return {
    id: payload.id,
    uuid: payload.uuid ?? existing?.uuid ?? "",
    name: payload.name ?? existing?.name ?? "",
    type: payload.type ?? existing?.type ?? "coder",
    status: payload.status ?? existing?.status ?? "offline",
    current_task: payload.current_task ?? existing?.current_task ?? null,
    avatar: payload.avatar ?? existing?.avatar ?? null,
    capacity: payload.capacity ?? existing?.capacity ?? 0,
    priority: payload.priority ?? existing?.priority ?? 0,
    capabilities: payload.capabilities ?? existing?.capabilities,
    last_seen_at: payload.last_seen_at ?? existing?.last_seen_at ?? null,
    created_at: payload.created_at ?? existing?.created_at ?? fallbackTimestamp,
    updated_at: payload.updated_at ?? existing?.updated_at ?? fallbackTimestamp,
    deleted_at: payload.deleted_at ?? existing?.deleted_at ?? null,
  };
}

function mergeTaskPayload(payload: TaskSocketPayload): Task {
  const existing = useTaskStore.getState().tasks[payload.id];
  const assignedAgentFromPayload =
    (isEntityRecord(payload) && isEntityRecord(payload.assigned_agent)
      ? payload.assigned_agent
      : undefined) ??
    payload.assignedAgent;
  const assignedAgentId =
    payload.assigned_agent_id ??
    (isEntityRecord(assignedAgentFromPayload) &&
    typeof assignedAgentFromPayload.id === "number"
      ? assignedAgentFromPayload.id
      : existing?.assigned_agent_id ??
        null);
  const fallbackTimestamp = existing?.updated_at ?? new Date().toISOString();

  return {
    id: payload.id,
    uuid: payload.uuid ?? existing?.uuid ?? "",
    session_id: payload.session_id,
    title: payload.title ?? existing?.title ?? "",
    description: payload.description ?? existing?.description ?? "",
    status: payload.status ?? existing?.status ?? "pending",
    assigned_agent_id: assignedAgentId,
    progress: payload.progress ?? existing?.progress ?? 0,
    attempt: payload.attempt ?? existing?.attempt ?? 0,
    max_attempt: payload.max_attempt ?? existing?.max_attempt ?? 0,
    payload: payload.payload ?? existing?.payload,
    result: payload.result ?? existing?.result,
    dependencies: payload.dependencies ?? existing?.dependencies,
    queued_at: payload.queued_at ?? existing?.queued_at ?? null,
    started_at: payload.started_at ?? existing?.started_at ?? null,
    finished_at: payload.finished_at ?? existing?.finished_at ?? null,
    created_at: payload.created_at ?? existing?.created_at ?? fallbackTimestamp,
    updated_at: payload.updated_at ?? existing?.updated_at ?? fallbackTimestamp,
    assignedAgent:
      (isEntityRecord(assignedAgentFromPayload)
        ? mergeAgentPayload(assignedAgentFromPayload as AgentSocketPayload)
        : undefined) ??
      (existing?.assignedAgent ? mergeAgentPayload(existing.assignedAgent) : undefined),
  };
}

function mergeSessionPayload(payload: SessionSocketPayload): Session {
  const existing = useSessionStore.getState().sessions[payload.id];
  const fallbackTimestamp = existing?.updated_at ?? new Date().toISOString();

  return {
    id: payload.id,
    uuid: payload.uuid ?? existing?.uuid ?? "",
    command_source: payload.command_source ?? existing?.command_source ?? "",
    original_command: payload.original_command ?? existing?.original_command ?? "",
    status: payload.status ?? existing?.status ?? "queued",
    context: payload.context ?? existing?.context,
    created_by: payload.created_by ?? existing?.created_by ?? null,
    started_at: payload.started_at ?? existing?.started_at ?? null,
    ended_at: payload.ended_at ?? existing?.ended_at ?? null,
    created_at: payload.created_at ?? existing?.created_at ?? fallbackTimestamp,
    updated_at: payload.updated_at ?? existing?.updated_at ?? fallbackTimestamp,
    tasks: payload.tasks ?? existing?.tasks,
    messages: payload.messages ?? existing?.messages,
  };
}

function mergeMessagePayload(payload: MessageSocketPayload): Message {
  const fromAgent =
    (isEntityRecord(payload) && isEntityRecord(payload.from_agent)
      ? payload.from_agent
      : undefined) ??
    payload.fromAgent;
  const toAgent =
    (isEntityRecord(payload) && isEntityRecord(payload.to_agent)
      ? payload.to_agent
      : undefined) ??
    payload.toAgent;
  const fallbackTimestamp = payload.timestamp ?? new Date().toISOString();

  return {
    id: payload.id,
    session_id: payload.session_id,
    from_agent_id:
      payload.from_agent_id ??
      (isEntityRecord(fromAgent) && typeof fromAgent.id === "number"
        ? fromAgent.id
        : null),
    to_agent_id:
      payload.to_agent_id ??
      (isEntityRecord(toAgent) && typeof toAgent.id === "number" ? toAgent.id : null),
    content: payload.content ?? "",
    message_type: payload.message_type ?? "system",
    channel: payload.channel ?? "general",
    timestamp: payload.timestamp ?? fallbackTimestamp,
    created_at: payload.created_at ?? fallbackTimestamp,
    updated_at: payload.updated_at ?? fallbackTimestamp,
    fromAgent: isEntityRecord(fromAgent)
      ? mergeAgentPayload(fromAgent as AgentSocketPayload)
      : undefined,
    toAgent: isEntityRecord(toAgent)
      ? mergeAgentPayload(toAgent as AgentSocketPayload)
      : undefined,
  };
}

export function useWebSocketConnection() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(getConnectionState);

  useEffect(() => {
    const unsubscribe = onConnectionStateChange(setConnectionState);
    return unsubscribe;
  }, []);

  return connectionState;
}

export interface UseDashboardWebSocketOptions {
  onAgentCreated?: (event: AgentCreatedEvent) => void;
  onAgentStatusChanged?: (event: AgentStatusChangedEvent) => void;
  onSessionCreated?: (event: SessionCreatedEvent) => void;
  onSessionCompleted?: (event: SessionCompletedEvent) => void;
  onSessionUpdated?: (event: SessionUpdatedEvent) => void;
  onTaskCompleted?: (event: TaskCompletedEvent) => void;
  onTaskCreated?: (event: TaskUpdatedEvent) => void;
  onTaskUpdated?: (event: TaskUpdatedEvent) => void;
}

export function useDashboardWebSocket(options: UseDashboardWebSocketOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const unsubscribers = DASHBOARD_CHANNELS.map((channelName) =>
      subscribe(channelName, (channel) => {
        channel.listen(`.${WS_EVENTS.SESSION_CREATED}`, (payload: unknown) => {
          const session = extractPayload<SessionSocketPayload>(payload, "session");
          if (session) {
            optionsRef.current.onSessionCreated?.({ session });
          }
        });

        channel.listen(`.${WS_EVENTS.SESSION_COMPLETED}`, (payload: unknown) => {
          const session = extractPayload<SessionSocketPayload>(payload, "session");
          if (session) {
            optionsRef.current.onSessionCompleted?.({ session });
          }
        });

        channel.listen(`.${WS_EVENTS.SESSION_UPDATED}`, (payload: unknown) => {
          const session = extractPayload<SessionSocketPayload>(payload, "session");
          if (session) {
            optionsRef.current.onSessionUpdated?.({ session });
          }
        });

        channel.listen(`.${WS_EVENTS.AGENT_CREATED}`, (payload: unknown) => {
          const agent = extractPayload<AgentSocketPayload>(payload, "agent");
          if (agent) {
            optionsRef.current.onAgentCreated?.({ agent });
          }
        });

        channel.listen(`.${WS_EVENTS.AGENT_STATUS_CHANGED}`, (payload: unknown) => {
          const agent = extractPayload<AgentSocketPayload>(payload, "agent");
          if (agent) {
            optionsRef.current.onAgentStatusChanged?.({ agent });
          }
        });

        channel.listen(`.${WS_EVENTS.TASK_CREATED}`, (payload: unknown) => {
          const task = extractPayload<TaskSocketPayload>(payload, "task");
          if (task) {
            optionsRef.current.onTaskCreated?.({ task });
          }
        });

        channel.listen(`.${WS_EVENTS.TASK_UPDATED}`, (payload: unknown) => {
          const task = extractPayload<TaskSocketPayload>(payload, "task");
          if (task) {
            optionsRef.current.onTaskUpdated?.({ task });
          }
        });

        channel.listen(`.${WS_EVENTS.TASK_COMPLETED}`, (payload: unknown) => {
          const task = extractPayload<TaskSocketPayload>(payload, "task");
          if (task) {
            optionsRef.current.onTaskCompleted?.({ task });
          }
        });
      }),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
}

export interface UseSessionWebSocketOptions {
  sessionId: number | string | null;
  onMessageCreated?: (event: MessageCreatedEvent) => void;
  onTaskCompleted?: (event: TaskCompletedEvent) => void;
  onTaskCreated?: (event: TaskUpdatedEvent) => void;
  onTaskUpdated?: (event: TaskUpdatedEvent) => void;
}

export function useSessionWebSocket(options: UseSessionWebSocketOptions) {
  const { sessionId } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const unsubscribe = subscribe(sessionChannel(sessionId), (channel) => {
      channel.listen(`.${WS_EVENTS.TASK_UPDATED}`, (payload: unknown) => {
        const task = extractPayload<TaskSocketPayload>(payload, "task");
        if (task) {
          optionsRef.current.onTaskUpdated?.({ task });
        }
      });

      channel.listen(`.${WS_EVENTS.TASK_COMPLETED}`, (payload: unknown) => {
        const task = extractPayload<TaskSocketPayload>(payload, "task");
        if (task) {
          optionsRef.current.onTaskCompleted?.({ task });
        }
      });

      channel.listen(`.${WS_EVENTS.TASK_CREATED}`, (payload: unknown) => {
        const task = extractPayload<TaskSocketPayload>(payload, "task");
        if (task) {
          optionsRef.current.onTaskCreated?.({ task });
        }
      });

      channel.listen(`.${WS_EVENTS.MESSAGE_CREATED}`, (payload: unknown) => {
        const message = extractPayload<MessageSocketPayload>(payload, "message");
        if (message) {
          optionsRef.current.onMessageCreated?.({ message });
        }
      });
    });

    return unsubscribe;
  }, [sessionId]);
}

export interface UseAgentWebSocketOptions {
  agents?: Array<Pick<Agent, "id">>;
  onAgentStatusChanged?: (event: AgentStatusChangedEvent) => void;
}

export function useAgentWebSocket(options: UseAgentWebSocketOptions) {
  const agentIds = useMemo(
    () =>
      Array.from(
        new Set((options.agents ?? []).map((agent) => agent.id).filter(Boolean)),
      ),
    [options.agents],
  );
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (agentIds.length === 0) {
      return undefined;
    }

    const unsubscribers = agentIds.map((agentId) =>
      subscribe(agentChannel(agentId), (channel) => {
        channel.listen(`.${WS_EVENTS.AGENT_STATUS_CHANGED}`, (payload: unknown) => {
          const agent = extractPayload<AgentSocketPayload>(payload, "agent");
          if (agent) {
            optionsRef.current.onAgentStatusChanged?.({ agent });
          }
        });
      }),
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [agentIds]);
}

export interface UseWebSocketWithStoreOptions {
  agents?: Array<Pick<Agent, "id">>;
  sessionId?: number | string | null;
  addMessage?: (message: Message) => void;
  addSession?: (session: Session) => void;
  addTask?: (task: Task) => void;
  updateAgent?: (agent: Agent) => void;
  updateSession?: (session: Session) => void;
  updateTask?: (task: Task) => void;
}

export function useWebSocketWithStore(options: UseWebSocketWithStoreOptions) {
  const storeAgents = useAgentStore((state) => Object.values(state.agents));
  const storeUpdateAgent = useAgentStore((state) => state.updateAgent);
  const storeAddTask = useTaskStore((state) => state.addTask);
  const storeUpdateTask = useTaskStore((state) => state.updateTask);
  const storeAddSession = useSessionStore((state) => state.addSession);
  const storeUpdateSession = useSessionStore((state) => state.updateSession);
  const storeAddMessage = useMessageStore((state) => state.addMessage);

  const updateAgent = options.updateAgent ?? storeUpdateAgent;
  const addTask = options.addTask ?? storeAddTask;
  const updateTask = options.updateTask ?? storeUpdateTask;
  const addSession = options.addSession ?? storeAddSession;
  const updateSession = options.updateSession ?? storeUpdateSession;
  const addMessage = options.addMessage ?? storeAddMessage;

  useDashboardWebSocket({
    onAgentCreated: ({ agent }) => {
      updateAgent(mergeAgentPayload(agent));
    },
    onAgentStatusChanged: ({ agent }) => {
      updateAgent(mergeAgentPayload(agent));
    },
    onSessionCreated: ({ session }) => {
      addSession(mergeSessionPayload(session));
    },
    onSessionCompleted: ({ session }) => {
      updateSession(mergeSessionPayload(session));
    },
    onSessionUpdated: ({ session }) => {
      updateSession(mergeSessionPayload(session));
    },
    onTaskCompleted: ({ task }) => {
      updateTask(mergeTaskPayload(task));
    },
    onTaskCreated: ({ task }) => {
      addTask(mergeTaskPayload(task));
    },
    onTaskUpdated: ({ task }) => {
      updateTask(mergeTaskPayload(task));
    },
  });

  useSessionWebSocket({
    sessionId: options.sessionId ?? null,
    onMessageCreated: ({ message }) => {
      addMessage(mergeMessagePayload(message));
    },
    onTaskCompleted: ({ task }) => {
      updateTask(mergeTaskPayload(task));
    },
    onTaskCreated: ({ task }) => {
      addTask(mergeTaskPayload(task));
    },
    onTaskUpdated: ({ task }) => {
      updateTask(mergeTaskPayload(task));
    },
  });

  useAgentWebSocket({
    agents: options.agents ?? storeAgents,
    onAgentStatusChanged: ({ agent }) => {
      updateAgent(mergeAgentPayload(agent));
    },
  });

  return useWebSocketConnection();
}

export default useWebSocketWithStore;
