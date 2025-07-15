export type TaskStatus = 'Running' | 'Completed' | 'Failed' | 'Pending';
export type ServerStatus = 'Online' | 'Offline' | 'Warning';
export type ConnectionStatus = 'Connected' | 'Disconnected' | 'Testing';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  estimatedTime: string;
  progress?: number;
  startedAt?: string;
  server?: string;
  model?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  taskId: string;
  model: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  duration?: string;
  server?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  hostname: string;
  status: ServerStatus;
  capacity: number;
  currentTasks: number;
  avgResponseTime: number;
  uptime: string;
  totalProcessed: number;
  successRate: number;
}

export interface APIProvider {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  status: ConnectionStatus;
  lastTested: string;
  requestsToday: number;
  monthlyLimit: number;
  costPerRequest: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppSettings {
  language: string;
  timezone: string;
  autoReload: boolean;
  defaultTheme: string;
  notifications: boolean;
  emailReports: boolean;
  logRetentionDays: number;
  refreshInterval: number;
}