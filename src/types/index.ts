// LogEntry, Notification, Task

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  level: 'info' | 'warning' | 'error';
}

export interface Notification {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'error';
  read: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}