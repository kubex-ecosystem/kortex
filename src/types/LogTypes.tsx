export type LogStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled' | 'skipped' | 'error';

export interface LogEntry {
  id: string;
  serverId?: string;
  taskId?: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  model?: string;
  status: LogStatus;
  duration?: number; // in milliseconds
}