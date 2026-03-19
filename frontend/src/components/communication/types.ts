// Communication component types

export type MessageChannel = "general" | "handoff" | "alert" | "debug";

export type MessageType = "agent" | "system" | "user" | "broadcast";

export interface Agent {
  id: string;
  uuid: string;
  name: string;
  type: string;
  avatar?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  channel: MessageChannel;
  type: MessageType;
  content: string;
  timestamp: string;
  sender?: Agent;
  recipient?: Agent;
  metadata?: Record<string, unknown>;
}

export interface MessageFilterState {
  channels: MessageChannel[];
  agentIds: string[];
  searchQuery: string;
}

export interface Command {
  id: string;
  text: string;
  timestamp: string;
}

export interface CommandSuggestion {
  command: string;
  description: string;
  usage?: string;
}
