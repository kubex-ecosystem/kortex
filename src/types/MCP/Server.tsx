import { LogEntry } from '../';
import { MCPSettingsType } from './Config';
import { MCPStatsType } from './Context';
import { MCPNotificationType } from './Notification';
import { MCPTask } from './Task';

export interface MCPServerType {
  id: string;
  name: string;
  hostname: string;
  status: MCPServerStatus;
  config?: MCPSettingsType;
  lastUpdated?: Date;
  tasks?: MCPTask[];
  logs?: LogEntry[];
  notifications?: MCPNotificationType[];
  stats?: MCPStatsType;
  totalProcessed?: number;
  successRate?: number;
  avgResponseTime?: number;
}

export interface MCPServerConnection {
  id: string;
  serverId: string;
  status: MCPServerStatus;
  lastConnected?: Date;
  lastDisconnected?: Date;
  error?: string;
  reconnectAttempts?: number;
}

export interface MCPServerStatus {
  id: string;
  serverId: string;
  status: "online" | "offline" | "error";
  lastUpdated: Date;
  uptime?: number; // in seconds
  loadAverage?: number; // system load average
  memoryUsage?: {
    total: number; // in bytes
    used: number; // in bytes
    free: number; // in bytes
  };
  diskUsage?: {
    total: number; // in bytes
    used: number; // in bytes
    free: number; // in bytes
  };
}