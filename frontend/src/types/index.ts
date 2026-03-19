// Enums matching backend
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
export type MessageType = "agent" | "system" | "user" | "broadcast";
export type MessageChannel = "general" | "handoff" | "alert" | "debug";

// Agent Interface
export interface Agent {
  id: number;
  uuid: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  current_task?: string | null;
  avatar?: string | null;
  capacity: number;
  priority: number;
  capabilities?: string[];
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Task Interface
export interface Task {
  id: number;
  uuid: string;
  session_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  assigned_agent_id?: number | null;
  progress: number;
  attempt: number;
  max_attempt: number;
  payload?: Record<string, any>;
  result?: Record<string, any>;
  dependencies?: number[];
  queued_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  assignedAgent?: Agent;
}

// Session Interface
export interface Session {
  id: number;
  uuid: string;
  command_source: string;
  original_command: string;
  status: SessionStatus;
  context?: Record<string, any>;
  created_by?: number | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  tasks?: Task[];
  messages?: Message[];
}

// Message Interface
export interface Message {
  id: number;
  session_id: number;
  from_agent_id?: number | null;
  to_agent_id?: number | null;
  content: string;
  message_type: MessageType;
  channel: MessageChannel;
  timestamp: string;
  created_at: string;
  updated_at: string;
  // Relations
  fromAgent?: Agent;
  toAgent?: Agent;
}

// TaskLog Interface (for reference)
export interface TaskLog {
  id: number;
  task_id: number;
  agent_id?: number | null;
  action: string;
  details?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
