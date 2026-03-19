import axios, { AxiosInstance, AxiosResponse } from "axios";
import type { Agent, Session, Task, Message } from "../types";

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could emit event or redirect
      console.error("Unauthorized request");
    }
    return Promise.reject(error);
  },
);

// Types for API responses
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ==================== Agent APIs ====================

export async function fetchAgents(): Promise<Agent[]> {
  const response: AxiosResponse<ApiResponse<Agent[]>> =
    await api.get("/agents");
  return response.data.data;
}

export async function fetchAgent(id: number | string): Promise<Agent> {
  const response: AxiosResponse<ApiResponse<Agent>> = await api.get(
    `/agents/${id}`,
  );
  return response.data.data;
}

export async function updateAgentStatus(
  id: number | string,
  status: Agent["status"],
): Promise<Agent> {
  const response: AxiosResponse<ApiResponse<Agent>> = await api.patch(
    `/agents/${id}/status`,
    { status },
  );
  return response.data.data;
}

// ==================== Session APIs ====================

export async function fetchSessions(
  page: number = 1,
  perPage: number = 15,
): Promise<PaginatedResponse<Session>> {
  const response: AxiosResponse<PaginatedResponse<Session>> = await api.get(
    "/sessions",
    { params: { page, per_page: perPage } },
  );
  return response.data;
}

export async function fetchSession(id: number | string): Promise<Session> {
  const response: AxiosResponse<ApiResponse<Session>> = await api.get(
    `/sessions/${id}`,
  );
  return response.data.data;
}

export async function fetchActiveSession(): Promise<Session | null> {
  const response: AxiosResponse<ApiResponse<Session | null>> =
    await api.get("/sessions/active");
  return response.data.data;
}

export interface CreateSessionPayload {
  command_source: string;
  original_command: string;
  context?: Record<string, unknown>;
}

export async function createSession(
  payload: CreateSessionPayload,
): Promise<Session> {
  const response: AxiosResponse<ApiResponse<Session>> = await api.post(
    "/sessions",
    payload,
  );
  return response.data.data;
}

export async function startSession(id: number | string): Promise<Session> {
  const response: AxiosResponse<ApiResponse<Session>> = await api.post(
    `/sessions/${id}/start`,
  );
  return response.data.data;
}

export async function cancelSession(id: number | string): Promise<Session> {
  const response: AxiosResponse<ApiResponse<Session>> = await api.post(
    `/sessions/${id}/cancel`,
  );
  return response.data.data;
}

// ==================== Task APIs ====================

export async function fetchTasks(sessionId?: number | string): Promise<Task[]> {
  const params = sessionId ? { session_id: sessionId } : {};
  const response: AxiosResponse<ApiResponse<Task[]>> = await api.get("/tasks", {
    params,
  });
  return response.data.data;
}

export async function fetchTask(id: number | string): Promise<Task> {
  const response: AxiosResponse<ApiResponse<Task>> = await api.get(
    `/tasks/${id}`,
  );
  return response.data.data;
}

export interface CreateTaskPayload {
  session_id: number;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  dependencies?: number[];
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response: AxiosResponse<ApiResponse<Task>> = await api.post(
    "/tasks",
    payload,
  );
  return response.data.data;
}

export async function updateTask(
  id: number | string,
  payload: Partial<Task>,
): Promise<Task> {
  const response: AxiosResponse<ApiResponse<Task>> = await api.patch(
    `/tasks/${id}`,
    payload,
  );
  return response.data.data;
}

export async function assignTask(
  taskId: number | string,
  agentId: number | string,
): Promise<Task> {
  const response: AxiosResponse<ApiResponse<Task>> = await api.post(
    `/tasks/${taskId}/assign`,
    { agent_id: agentId },
  );
  return response.data.data;
}

export async function retryTask(id: number | string): Promise<Task> {
  const response: AxiosResponse<ApiResponse<Task>> = await api.post(
    `/tasks/${id}/retry`,
  );
  return response.data.data;
}

export async function cancelTask(id: number | string): Promise<Task> {
  const response: AxiosResponse<ApiResponse<Task>> = await api.post(
    `/tasks/${id}/cancel`,
  );
  return response.data.data;
}

// ==================== Message APIs ====================

export async function fetchMessages(
  sessionId: number | string,
  channel?: string,
): Promise<Message[]> {
  const params: Record<string, unknown> = {};
  if (channel) params.channel = channel;

  const response: AxiosResponse<ApiResponse<Message[]>> = await api.get(
    `/sessions/${sessionId}/messages`,
    { params },
  );
  return response.data.data;
}

export interface SendMessagePayload {
  session_id: number;
  content: string;
  message_type?: Message["message_type"];
  channel?: Message["channel"];
  to_agent_id?: number;
}

export async function sendMessage(
  payload: SendMessagePayload,
): Promise<Message> {
  const response: AxiosResponse<ApiResponse<Message>> = await api.post(
    "/messages",
    payload,
  );
  return response.data.data;
}

// ==================== Command APIs ====================

export interface ExecuteCommandPayload {
  command: string;
  session_id?: number;
}

export async function executeCommand(
  payload: ExecuteCommandPayload,
): Promise<{ result: unknown }> {
  const response: AxiosResponse<ApiResponse<{ result: unknown }>> =
    await api.post("/commands/execute", payload);
  return response.data.data;
}

// ==================== Dashboard APIs ====================

export interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  agentStats: {
    total: number;
    idle: number;
    busy: number;
    offline: number;
  };
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response: AxiosResponse<ApiResponse<DashboardStats>> =
    await api.get("/dashboard/stats");
  return response.data.data;
}

// Export the axios instance for custom requests
export default api;
