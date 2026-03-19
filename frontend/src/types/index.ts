// Backend-facing API types
export type AgentStatus =
  | "idle"
  | "busy"
  | "communicating"
  | "error"
  | "offline";

export type AgentType =
  | "planner"
  | "architect"
  | "coder"
  | "reviewer"
  | "tester"
  | "docs"
  | "devops";

export type TaskStatus =
  | "pending"
  | "assigned"
  | "running"
  | "blocked"
  | "completed"
  | "failed"
  | "cancelled";

export type SessionStatus =
  | "queued"
  | "planning"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type MessageType =
  | "agent"
  | "system"
  | "user"
  | "broadcast"
  | "text"
  | "command"
  | "result"
  | "error"
  | "thought";

export type MessageChannel =
  | "general"
  | "handoff"
  | "alert"
  | "debug"
  | string;

export interface Agent {
  id: number;
  uuid: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  current_task?: string | null;
  avatar?: string | null;
  source?: string;
  external_id?: string | null;
  capacity?: number;
  priority?: number;
  capabilities?: string[];
  last_seen_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Task {
  id: number;
  uuid: string;
  session_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigned_agent_id?: number | null;
  assigned_agent?: Agent | null;
  assignedAgent?: Agent;
  progress: number;
  attempt?: number;
  max_attempt?: number;
  payload?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  dependencies?: number[] | null;
  queued_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Session {
  id: number;
  uuid: string;
  command_source: string;
  original_command: string;
  status: SessionStatus;
  context?: Record<string, unknown> | null;
  created_by?: number | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tasks?: Task[];
  tasks_count?: number;
  messages?: Message[];
}

export interface Message {
  id: number;
  session_id: number;
  from_agent_id?: number | null;
  to_agent_id?: number | null;
  from_agent?: Agent | null;
  to_agent?: Agent | null;
  fromAgent?: Agent;
  toAgent?: Agent;
  content: string;
  message_type: MessageType;
  channel: MessageChannel;
  timestamp?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TaskLog {
  id: number;
  task_id: number;
  action: string;
  notes?: string | null;
  meta?: Record<string, unknown> | null;
  details?: Record<string, unknown> | null;
  agent?: Agent | null;
  agent_id?: number | null;
  timestamp: string;
  created_at?: string | null;
  updated_at?: string | null;
}
