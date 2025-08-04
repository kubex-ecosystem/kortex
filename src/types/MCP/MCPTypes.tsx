import { Task, TaskState } from '../TaskTypes';
import { LogEntry } from '../LogTypes';
import { NotificationType } from '../NotificationTypes';
import { MCPNotificationType } from './Notification';
import { ServerStatus } from '../ServerTypes';
import { ConnectionStatus } from '../SettingsTypes';

export type MCPPlaceType = 'local' | 'remote' | 'cloud';
export type MCPConnectionType = 'WebSocket' | 'HTTP' | 'HTTPS' | 'REST';
export type MCPLogEntryType = 'task' | 'server' | 'error' | 'info';

export type MCPAPIProvider = 'OpenAI' | 'Google' | 'Azure' | 'Local';
export type MCPStatisticType = 'tasks' | 'servers' | 'logs' | 'notifications';
export type MCPStatusType = 'idle' | 'active' | 'error' | 'maintenance';

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

export interface MCPModelType {
  id: string;
  name: string;
  version?: string;
  maxTokens: number;
  description: string;
  costPerRequest?: number;
  monthlyLimit?: number;
}

export interface MCPAPIProviderConfigType {
  id: string;
  name: string;
  description?: string;
  provider: MCPAPIProvider;
  enabled: boolean;
  status?: ConnectionStatus;
  models?: MCPModelType[];
  activeModel: MCPModelType | null;
  apiKey?: string;
  apiUrl?: string;
  wsUrl?: string;
  lastTested?: string;
  connectionSettings?: MCPConnectionConfigType;
  keyPreview?: string;
  requestsToday?: number;
  monthlyLimit?: number;
  costPerRequest?: number;
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

export interface MCPRequestType {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: Record<string, any>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  retryInterval?: number;
  timeout?: number;
  retryOnFailure?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  retryBackoff?: boolean;
  retryBackoffFactor?: number;
  retryBackoffMaxDelay?: number;
}

export interface MCPConnectionConfigType {
  id: string;
  name?: string;
  type: MCPConnectionType;
  baseURL: string;
  wsUrl: string;
  apiKey: string;
  enableWebSocket: boolean;
  autoReconnect: boolean;
  connectionTimeout?: number;
  keepAlive?: boolean;
  pingInterval?: number;
  pingTimeout?: number;
  retryOnFailure: boolean;
  retryDelay?: number;
  maxRetries?: number;
  retryBackoff: boolean;
  retryBackoffFactor?: number;
  retryBackoffMaxDelay?: number;
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

export interface MCPSettingsType {
  id?: string;
  place: MCPPlaceType;
  connectionType: MCPConnectionType;
  connectionConfig: MCPConnectionConfigType;
  apiProvider: MCPAPIProviderConfigType;
}

export interface MCPServerType {
  id: string;
  name: string;
  hostname: string;
  status: ServerStatus;
  config: MCPSettingsType;
  lastUpdated: Date;
  tasks: Task[];
  logs: LogEntry[];
  notifications: MCPNotificationType[];
  stats: MCPStatsType;
}

