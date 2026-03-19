// Agent visualization component types

export type AgentStatus = "idle" | "busy" | "communicating" | "error";

export type AgentRole =
  | "leader"
  | "worker"
  | "reviewer"
  | "planner"
  | "executor";

export interface Agent {
  id: string;
  uuid: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  avatar?: string;
  source?: 'claude' | 'openclaw' | 'copilot-cli' | 'unknown';
  currentTask?: {
    id: string;
    title: string;
    progress: number;
  };
  connections?: string[]; // IDs of agents this agent is communicating with
}

export interface AgentConnection {
  fromId: string;
  toId: string;
  active: boolean;
}

export interface AgentNodePosition {
  id: string;
  x: number;
  y: number;
}
