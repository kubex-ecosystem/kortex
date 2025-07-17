// Imports necessários
import { Task, TaskState } from '../TaskTypes';
import { LogEntry } from '../LogTypes';
import { MCPNotificationType } from './Notification';
import { ServerStatus } from '../ServerTypes';
import { ConnectionStatus } from '../SettingsTypes';
import { ModelType as MCPModelType } from './Model';

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

export interface MCPLogType {
  id: string;
  timestamp: string;
  type: MCPLogEntryType;
  message: string;
  taskId?: string;
  serverId?: string;
  details?: Record<string, any>;
}

// Tipos auxiliares
export type MCPPlaceType = 'local' | 'remote' | 'cloud';
export type MCPConnectionType = 'WebSocket' | 'HTTP' | 'HTTPS' | 'REST';
export type MCPLogEntryType = 'task' | 'server' | 'error' | 'info';
export type MCPAPIProvider = 'OpenAI' | 'Google' | 'Azure' | 'Local';
export type MCPStatisticType = 'tasks' | 'servers' | 'logs' | 'notifications';
export type MCPStatusType = 'idle' | 'active' | 'error' | 'maintenance';

// Imports para tipos que serão definidos em outros arquivos
import { MCPServerType } from './Server';
