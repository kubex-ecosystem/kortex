// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LogEntry, MCPServerType, Task } from '../types';

interface Server extends MCPServerType {
  name: string;
  totalProcessed: number;
  successRate: number;
  avgResponseTime: string;
  processed?: number;
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
  notifications?: Notification[];
  isConnected?: boolean;
  isLoading?: boolean;
  error?: string | null;
  lastUpdate?: Date | null;
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
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateServer: (server: Server) => void;
  updateTask: (task: Task) => void;
  updateLog: (log: LogEntry) => void;
  updateNotification: (notification: Notification) => void;
  addNotification: (n: Notification) => void;
}

const AppContext = createContext<AppContextType | unknown | undefined>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // MOCK data só pra dev, substitui por fetchs reais depois
  const [servers] = useState<Server[]>([
    { id: '1', name: 'MCP-01', totalProcessed: 1234, successRate: 98.2, avgResponseTime: '1.8s' },
    { id: '2', name: 'MCP-02', totalProcessed: 892, successRate: 94.7, avgResponseTime: '2.1s' },
    { id: '3', name: 'MCP-03', totalProcessed: 457, successRate: 90.5, avgResponseTime: '2.9s' }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '001', status: 'Running', model: { id: '001', name: 'GPT-4', version: '1.0', maxTokens: 4096, description: 'A powerful model', costPerRequest: 0.01, monthlyLimit: 10000, usage: 5000, requests: 100 } },
    { id: '002', status: 'Completed', model: { id: '002', name: 'Claude', version: '1.0', maxTokens: 1024, description: 'A powerful model', costPerRequest: 0.01, monthlyLimit: 10000, usage: 5000, requests: 100 } },
    { id: '003', status: 'Failed', model: { id: '003', name: 'Gemini', version: '1.0', maxTokens: 1024, description: 'A powerful model', costPerRequest: 0.01, monthlyLimit: 10000, usage: 5000, requests: 100 } }
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
