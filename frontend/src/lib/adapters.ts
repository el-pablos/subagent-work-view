import type { AgentConnection, Agent as UIAgent } from "../components/agents/types";
import type {
  Message as UIMessage,
  MessageType as UIMessageType,
} from "../components/communication/types";
import type { Task as UITask, TaskHistoryEvent } from "../types/task";
import type {
  Agent as APIAgent,
  Message as APIMessage,
  Task as APITask,
  TaskLog as APITaskLog,
} from "../types";

const AGENT_ROLE_MAP: Record<APIAgent["type"], UIAgent["role"]> = {
  planner: "planner",
  architect: "leader",
  coder: "executor",
  reviewer: "reviewer",
  tester: "worker",
  docs: "worker",
  devops: "worker",
};

const AGENT_STATUS_MAP: Record<APIAgent["status"], UIAgent["status"]> = {
  idle: "idle",
  busy: "busy",
  communicating: "communicating",
  error: "error",
  offline: "idle",
};

const TASK_STATUS_MAP: Record<APITask["status"], UITask["status"]> = {
  pending: "pending",
  assigned: "pending",
  running: "running",
  blocked: "running",
  completed: "completed",
  failed: "failed",
  cancelled: "failed",
};

const MESSAGE_TYPE_MAP: Record<string, UIMessageType> = {
  agent: "agent",
  system: "system",
  user: "user",
  broadcast: "broadcast",
  text: "agent",
  command: "user",
  result: "system",
  error: "system",
  thought: "agent",
};

function getAssignedAgent(task: APITask): APIAgent | undefined {
  return task.assigned_agent ?? task.assignedAgent ?? undefined;
}

function getTaskTimestamp(task: APITask): string {
  return (
    task.updated_at ??
    task.finished_at ??
    task.started_at ??
    task.queued_at ??
    task.created_at ??
    new Date().toISOString()
  );
}

function toDurationSeconds(start?: string | null, end?: string | null): number | undefined {
  if (!start || !end) return undefined;

  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(durationMs) || durationMs <= 0) return undefined;

  return Math.round(durationMs / 1000);
}

function normalizeMessageType(type: APIMessage["message_type"]): UIMessageType {
  return MESSAGE_TYPE_MAP[type] ?? "system";
}

export function mapApiAgentToUI(agent: APIAgent, tasks: APITask[] = []): UIAgent {
  const currentTask = tasks
    .filter((task) => {
      const assignedAgentId = task.assigned_agent_id ?? getAssignedAgent(task)?.id;
      return assignedAgentId === agent.id;
    })
    .sort(
      (left, right) =>
        new Date(getTaskTimestamp(right)).getTime() -
        new Date(getTaskTimestamp(left)).getTime(),
    )[0];

  return {
    id: String(agent.id),
    uuid: agent.external_id || agent.uuid,
    name: agent.name,
    role: AGENT_ROLE_MAP[agent.type] ?? "worker",
    status: AGENT_STATUS_MAP[agent.status] ?? "idle",
    avatar: agent.avatar ?? undefined,
    currentTask: currentTask
      ? {
          id: String(currentTask.id),
          title: currentTask.title,
          progress: currentTask.progress ?? 0,
        }
      : agent.current_task
        ? {
            id: `current-task-${agent.id}`,
            title: agent.current_task,
            progress: 0,
          }
        : undefined,
  };
}

export function mapApiTaskToUI(task: APITask): UITask {
  const assignedAgent = getAssignedAgent(task);
  const createdAt =
    task.created_at ?? task.queued_at ?? task.started_at ?? task.finished_at ?? new Date().toISOString();
  const updatedAt = getTaskTimestamp(task);
  const completedAt = task.finished_at ?? undefined;

  return {
    id: String(task.id),
    title: task.title,
    description: task.description ?? "No description available.",
    status: TASK_STATUS_MAP[task.status] ?? "pending",
    assignedAgent: assignedAgent
      ? {
          id: String(assignedAgent.id),
          name: assignedAgent.name,
          avatar: assignedAgent.avatar ?? undefined,
        }
      : undefined,
    progress: task.progress ?? 0,
    createdAt,
    updatedAt,
    startedAt: task.started_at ?? undefined,
    completedAt,
    duration: toDurationSeconds(task.started_at, completedAt),
  };
}

export function mapApiMessageToUI(message: APIMessage): UIMessage {
  const sender = message.from_agent ?? message.fromAgent;
  const recipient = message.to_agent ?? message.toAgent;

  return {
    id: String(message.id),
    sessionId: String(message.session_id),
    channel:
      message.channel === "general" ||
      message.channel === "handoff" ||
      message.channel === "alert" ||
      message.channel === "debug"
        ? message.channel
        : "general",
    type: normalizeMessageType(message.message_type),
    content: message.content,
    timestamp: message.timestamp ?? message.created_at ?? new Date().toISOString(),
    sender: sender
      ? {
          id: String(sender.id),
          uuid: sender.external_id || sender.uuid,
          name: sender.name,
          type: sender.type,
          avatar: sender.avatar ?? undefined,
        }
      : undefined,
    recipient: recipient
      ? {
          id: String(recipient.id),
          uuid: recipient.external_id || recipient.uuid,
          name: recipient.name,
          type: recipient.type,
          avatar: recipient.avatar ?? undefined,
        }
      : undefined,
  };
}

function mapTaskLogType(action: string): TaskHistoryEvent["type"] {
  switch (action) {
    case "created":
      return "created";
    case "assigned":
      return "assigned";
    case "started":
      return "started";
    case "progress":
      return "progress";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "status_change";
  }
}

export function mapApiTaskLogToUIEvent(log: APITaskLog): TaskHistoryEvent {
  const details = log.meta ?? log.details ?? {};
  const rawStatus = typeof details.status === "string" ? details.status : undefined;
  const status =
    rawStatus === "pending" ||
    rawStatus === "running" ||
    rawStatus === "completed" ||
    rawStatus === "failed"
      ? rawStatus
      : undefined;

  return {
    id: String(log.id),
    taskId: String(log.task_id),
    type: mapTaskLogType(log.action),
    timestamp: log.timestamp,
    data: {
      progress: typeof details.progress === "number" ? details.progress : undefined,
      status,
      agent: log.agent
        ? {
            id: String(log.agent.id),
            name: log.agent.name,
          }
        : undefined,
      message: log.notes ?? undefined,
    },
  };
}

export function buildFallbackTaskHistory(tasks: APITask[]): TaskHistoryEvent[] {
  const events: TaskHistoryEvent[] = [];

  tasks.forEach((task) => {
    const createdAt = task.created_at ?? task.queued_at;
    const assignedAgent = getAssignedAgent(task);

    if (createdAt) {
      events.push({
        id: `task-${task.id}-created`,
        taskId: String(task.id),
        type: "created",
        timestamp: createdAt,
      });
    }

    if (assignedAgent) {
      events.push({
        id: `task-${task.id}-assigned`,
        taskId: String(task.id),
        type: "assigned",
        timestamp: task.started_at ?? task.updated_at ?? createdAt ?? new Date().toISOString(),
        data: {
          agent: {
            id: String(assignedAgent.id),
            name: assignedAgent.name,
          },
        },
      });
    }

    if (task.started_at) {
      events.push({
        id: `task-${task.id}-started`,
        taskId: String(task.id),
        type: "started",
        timestamp: task.started_at,
      });
    }

    if (task.progress > 0 && task.progress < 100) {
      events.push({
        id: `task-${task.id}-progress`,
        taskId: String(task.id),
        type: "progress",
        timestamp: task.updated_at ?? task.started_at ?? createdAt ?? new Date().toISOString(),
        data: {
          progress: task.progress,
        },
      });
    }

    if (task.status === "completed" && task.finished_at) {
      events.push({
        id: `task-${task.id}-completed`,
        taskId: String(task.id),
        type: "completed",
        timestamp: task.finished_at,
      });
    }

    if ((task.status === "failed" || task.status === "cancelled") && task.finished_at) {
      events.push({
        id: `task-${task.id}-failed`,
        taskId: String(task.id),
        type: "failed",
        timestamp: task.finished_at,
      });
    }
  });

  return events.sort(
    (left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  );
}

export function buildAgentConnections(messages: UIMessage[]): AgentConnection[] {
  const connectionMap = new Map<string, AgentConnection>();
  const activeThreshold = Date.now() - 5 * 60 * 1000;

  messages.forEach((message) => {
    if (!message.sender || !message.recipient) return;

    const key = `${message.sender.id}:${message.recipient.id}`;
    connectionMap.set(key, {
      fromId: message.sender.id,
      toId: message.recipient.id,
      active:
        new Date(message.timestamp).getTime() >= activeThreshold ||
        message.channel === "handoff",
    });
  });

  return Array.from(connectionMap.values());
}
