export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedAgent?: {
    id: string;
    name: string;
    avatar?: string;
  };
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // in seconds
}

export interface TaskHistoryEvent {
  id: string;
  taskId: string;
  type:
    | "created"
    | "assigned"
    | "started"
    | "progress"
    | "completed"
    | "failed"
    | "status_change";
  timestamp: string;
  data?: {
    status?: TaskStatus;
    progress?: number;
    agent?: {
      id: string;
      name: string;
    };
    message?: string;
  };
}
