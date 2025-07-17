import { Task, TaskState } from './TaskTypes';
import { LogEntry } from './LogTypes';
import { NotificationType } from './NotificationTypes';
import { ServerStatus } from './ServerTypes';
import { ConnectionStatus } from './SettingsTypes';

export type MCPPlaceType = 'local' | 'remote' | 'cloud';
export type MCPConnectionType = 'WebSocket' | 'HTTP' | 'REST';
export type MCPLogEntryType = 'task' | 'server' | 'error' | 'info';
export type MCPTaskType = 'analysis' | 'processing' | 'training' | 'inference';
export type MCPAPIProvider = 'OpenAI' | 'Google' | 'Azure' | 'Local';
export type MCPStatisticType = 'tasks' | 'servers' | 'logs' | 'notifications';
export type MCPStatusType = 'idle' | 'active' | 'error' | 'maintenance';

export interface MCPServerType {
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

export interface MCPStateType {
  tasks: TaskState[];
  servers: MCPServerType[];
  logs: LogEntry[];
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date;
}

export interface MCPStatsType {
  type: MCPStatisticType;
  totalServers: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgResponseTime: number;
}

export interface MCPServiceConfigType {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
}

export interface MCPAPIProviderConfigType {
  id: string;
  name: string;
  provider: MCPAPIProvider;
  keyPreview: string;
  status: ConnectionStatus;
  lastTested: string;
  requestsToday: number;
  monthlyLimit: number;
  costPerRequest: number;
}

export interface MCPNotificationType {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MCPSettingsType {
  language: string;
  timezone: string;
  autoReload: boolean;
  defaultTheme: string;
  notifications: boolean;
  emailReports: boolean;
  logRetentionDays: number;
  refreshInterval: number;
}

export interface MCPContextType {
  servers: MCPServerType[];
  tasks: Task[];
  logs: LogEntry[];
  notifications: MCPNotificationType[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshData: () => Promise<void>;
  addTask: (task: Task) => void;
  addServer: (server: MCPServerType) => void;
  addLog: (log: LogEntry) => void;
  removeTask: (taskId: string) => void;
  removeServer: (serverId: string) => void;
  removeLog: (logId: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateServer: (server: MCPServerType) => void;
  updateTask: (task: Task) => void;
  updateLog: (log: LogEntry) => void;
  updateNotification: (notification: MCPNotificationType) => void;
  addNotification: (notification: MCPNotificationType) => void;
}

export interface MCPProviderConfigType {
  id: string;
  name: string;
  provider: MCPAPIProvider;
  keyPreview: string;
  status: ConnectionStatus;
  lastTested: string;
  requestsToday: number;
  monthlyLimit: number;
  costPerRequest: number;
}

export interface MCPConnectionConfigType {
  type: MCPConnectionType;
  url: string;
  headers?: Record<string, string>;
  retryInterval?: number;
  maxRetries?: number;
  timeout?: number;
  autoReconnect?: boolean;
  connectionTimeout?: number;
  keepAlive?: boolean;
  pingInterval?: number;
  pingTimeout?: number;
}

export interface MCPLogType {
  id: string;
  timestamp: string;
  type: MCPLogEntryType;
  message: string;
  taskId?: string;
  serverId?: string;
  details?: Record<string, any>;
}
