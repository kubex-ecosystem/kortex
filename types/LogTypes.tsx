export type LogStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface LogEntry {
  id: string;
  timestamp: string;
  taskId: string;
  model: string;
  status: LogStatus;
  duration?: string;
  serverId?: string;
}