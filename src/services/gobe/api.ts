import { MCPServer, Task, LogEntry } from '@types/index';

const base = '/api';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function getHealth(): Promise<{ status: string; version?: string; uptime?: number; responseTime?: number } | null> {
  try {
    return await http(`${base}/health`);
  } catch {
    return null;
  }
}

export async function listServers(): Promise<MCPServer[]> {
  return await http(`${base}/servers`);
}

export async function createServer(payload: Omit<MCPServer, 'id' | 'status' | 'lastSeen'>): Promise<MCPServer> {
  return await http(`${base}/servers`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateServer(id: string, updates: Partial<MCPServer>): Promise<MCPServer> {
  return await http(`${base}/servers/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

export async function deleteServer(id: string): Promise<{ ok: true }> {
  return await http(`${base}/servers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listTasks(): Promise<Task[]> {
  return await http(`${base}/tasks`);
}

export async function createTask(payload: Omit<Task, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  return await http(`${base}/tasks`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function cancelTask(id: string): Promise<Task> {
  return await http(`${base}/tasks/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
}

export async function listLogs(params?: { level?: string; limit?: number; since?: string }): Promise<LogEntry[]> {
  const q = new URLSearchParams();
  if (params?.level) q.set('level', params.level);
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.since) q.set('since', params.since);
  const qs = q.toString();
  return await http(`${base}/logs${qs ? `?${qs}` : ''}`);
}

