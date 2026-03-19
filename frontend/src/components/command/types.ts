// Command console types

export type CommandStatus = "pending" | "running" | "success" | "error";

export interface CommandEntry {
  id: string;
  command: string;
  timestamp: string;
  status: CommandStatus;
  output?: string;
  sessionId?: string;
}

export interface CommandSuggestion {
  command: string;
  description: string;
  usage?: string;
}
