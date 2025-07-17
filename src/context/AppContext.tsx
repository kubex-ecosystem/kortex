// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LogEntry } from '../../types';

interface Server {
  name: string;
  totalProcessed: number;
  successRate: number;
  avgResponseTime: string;
}

interface Task {
  id: string;
  status: 'Running' | 'Completed' | 'Failed';
  model: string;
  duration?: string;
}

interface Notification {
  type: 'info' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
}

interface AppContextType {
  servers: Server[];
  tasks: Task[];
  logs?: LogEntry[];
  notifications: Notification[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshData: () => Promise<void>;
  addTask: (task: Task) => void;
  addServer: (server: Server) => void;
  addLog: (log: LogEntry) => void;
  removeTask: (taskId: string) => void;
  removeServer: (serverId: string) => void;
  removeLog: (logId: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateServer: (server: Server) => void;
  updateTask: (task: Task) => void;
  updateLog: (log: LogEntry) => void;
  updateNotification: (notification: Notification) => void;
  // Método para adicionar uma nova notificação
  addNotification: (n: Notification) => void;
}

const AppContext = createContext<AppContextType | unknown>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // MOCK data só pra dev, substitui por fetchs reais depois
  const [servers] = useState<Server[]>([
    { name: 'MCP-01', totalProcessed: 1234, successRate: 98.2, avgResponseTime: '1.8s' },
    { name: 'MCP-02', totalProcessed: 892, successRate: 94.7, avgResponseTime: '2.1s' },
    { name: 'MCP-03', totalProcessed: 457, successRate: 90.5, avgResponseTime: '2.9s' }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '001', status: 'Running', model: 'GPT-4' },
    { id: '002', status: 'Completed', model: 'Claude', duration: '2s' },
    { id: '003', status: 'Failed', model: 'Gemini' }
  ]);

  const addNotification = (notification: Notification) => {
    console.log('[📣 Notification]', notification);
  };

  return (
    <AppContext.Provider value={{ servers, tasks, addNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx: AppContextType | unknown = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx as AppContextType;
};
