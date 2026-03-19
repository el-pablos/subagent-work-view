const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Domain endpoints ──────────────────────────────────────────
export const fetchAgents = () => api.get<{ data: unknown[] }>("/agents");
export const fetchAgent = (id: number | string) => api.get<{ data: unknown }>(`/agents/${id}`);
export const updateAgentStatus = (id: number | string, status: string) =>
  api.patch<{ data: unknown }>(`/agents/${id}/status`, { status });
export const heartbeatAgent = (id: number | string, payload: Record<string, unknown>) =>
  api.post<{ data: unknown }>(`/agents/${id}/heartbeat`, payload);

export const fetchSessions = () => api.get<{ data: unknown[] }>("/sessions");
export const fetchActiveSessions = () => api.get<{ data: unknown[] }>("/sessions/active");
export const fetchSession = (id: number | string) => api.get<{ data: unknown }>(`/sessions/${id}`);
export const startSession = (id: number | string) => api.post<{ data: unknown }>(`/sessions/${id}/start`);

export const fetchTasks = () => api.get<{ data: unknown[] }>("/tasks");
export const fetchTask = (id: number | string) => api.get<{ data: unknown }>(`/tasks/${id}`);
export const createTask = (data: Record<string, unknown>) => api.post<{ data: unknown }>("/tasks", data);

export const fetchMessages = (sessionId: number | string) =>
  api.get<{ data: unknown[] }>(`/sessions/${sessionId}/messages`);

export const fetchDashboardOverview = () => api.get<{ data: unknown }>("/dashboard/overview");

export default api;
