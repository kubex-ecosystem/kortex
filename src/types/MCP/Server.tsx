import { ServerStatus } from '../ServerTypes';
import { Task } from '../TaskTypes';
import { LogEntry } from '../LogTypes';
import { MCPNotificationType } from './Notification';
import { MCPSettingsType } from './Config';
import { MCPStatsType } from './Context';

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
  totalProcessed: number;
  successRate: number;
  avgResponseTime: number;
}
