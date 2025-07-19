// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LogEntry, Task } from '../types';
import { MCPServerType } from '../types/MCP/Server';

interface Notification {
  type: 'info' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
}

interface AppContextType {
  servers: MCPServerType[];
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
  addServer: (server: MCPServerType) => void;
  addLog: (log: LogEntry) => void;
  removeTask: (taskId: string) => void;
  removeServer: (serverId: string) => void;
  removeLog: (logId: string) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateServer: (server: MCPServerType) => void;
  updateTask: (task: Task) => void;
  updateLog: (log: LogEntry) => void;
  updateNotification: (notification: Notification) => void;
  addNotification: (n: Notification) => void;
}

const AppContext = createContext<AppContextType | unknown | undefined>({});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // MOCK data só pra dev, substitui por fetchs reais depois
  const [servers] = useState<MCPServerType[]>([
    { 
      id: '1', 
      name: 'MCP-01', 
      hostname: 'mcp-01.local',
      status: 'Online',
      config: {
        place: 'local',
        connectionType: 'HTTP',
        connectionConfig: {
          id: '1',
          type: 'HTTP',
          baseURL: 'http://localhost:3000',
          wsUrl: 'ws://localhost:3000',
          apiKey: 'test-key',
          enableWebSocket: true,
          autoReconnect: true,
          retryOnFailure: true,
          retryBackoff: true
        },
        apiProvider: {
          id: '1',
          name: 'OpenAI',
          provider: 'OpenAI',
          enabled: true,
          activeModel: null
        }
      },
      lastUpdated: new Date(),
      tasks: [],
      logs: [],
      notifications: [],
      stats: {
        type: 'servers',
        totalServers: 3,
        totalTasks: 15,
        completedTasks: 12,
        failedTasks: 1,
        avgResponseTime: 1.8
      },
      totalProcessed: 100,
      successRate: 95,
      avgResponseTime: 1.8
    },
    { 
      id: '2', 
      name: 'MCP-02', 
      hostname: 'mcp-02.local',
      status: 'Offline',
      config: {
        place: 'local',
        connectionType: 'HTTP',
        connectionConfig: {
          id: '2',
          type: 'HTTP',
          baseURL: 'http://localhost:3001',
          wsUrl: 'ws://localhost:3001',
          apiKey: 'test-key-2',
          enableWebSocket: true,
          autoReconnect: true,
          retryOnFailure: true,
          retryBackoff: true
        },
        apiProvider: {
          id: '2',
          name: 'Google',
          provider: 'Google',
          enabled: true,
          activeModel: null
        }
      },
      lastUpdated: new Date(),
      tasks: [],
      logs: [],
      notifications: [],
      stats: {
        type: 'servers',
        totalServers: 3,
        totalTasks: 8,
        completedTasks: 7,
        failedTasks: 1,
        avgResponseTime: 2.1
      },
      totalProcessed: 50,
      successRate: 85,
      avgResponseTime: 2.1
    },
    { 
      id: '3', 
      name: 'MCP-03', 
      hostname: 'mcp-03.local',
      status: 'Warning',
      config: {
        place: 'remote',
        connectionType: 'HTTPS',
        connectionConfig: {
          id: '3',
          type: 'HTTPS',
          baseURL: 'https://mcp-03.example.com',
          wsUrl: 'wss://mcp-03.example.com',
          apiKey: 'test-key-3',
          enableWebSocket: true,
          autoReconnect: true,
          retryOnFailure: true,
          retryBackoff: true
        },
        apiProvider: {
          id: '3',
          name: 'Azure',
          provider: 'Azure',
          enabled: true,
          activeModel: null
        }
      },
      lastUpdated: new Date(),
      tasks: [],
      logs: [],
      notifications: [],
      stats: {
        type: 'servers',
        totalServers: 3,
        totalTasks: 5,
        completedTasks: 4,
        failedTasks: 1,
        avgResponseTime: 2.9
      },
      totalProcessed: 30,
      successRate: 80,
      avgResponseTime: 2.9
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '001', status: 'Running', model: { id: '001', name: 'GPT-4', version: '1.0', maxTokens: 4096, description: 'A powerful model', costPerRequest: 0.01, monthlyLimit: 10000, usage: 5000, requests: 100 } },
    { id: '002', status: 'Completed', model: { id: '002', name: 'Claude', version: '1.0', maxTokens: 1024, description: 'A powerful model', costPerRequest: 0.01, monthlyLimit: 10000, usage: 5000, requests: 100 } },
    { id: '003', status: 'Failed', model: { id: '003', name: 'Gemini', version: '1.0', maxTokens: 1024, description: 'A powerful model', costPerRequest: 0.01, monthlyLimit: 10000, usage: 5000, requests: 100 } }
  ]);

  const addNotification = (notification: Notification) => {
    console.log('[📣 Notification]', notification);
  };

  const addServer = (server: MCPServerType) => {
    console.log('[➕ Add Server]', server);
  };

  const updateServer = (server: MCPServerType) => {
    console.log('[✏️ Update Server]', server);
  };

  const removeServer = (serverId: string) => {
    console.log('[🗑️ Remove Server]', serverId);
  };

  const addTask = (task: Task) => {
    console.log('[➕ Add Task]', task);
  };

  const removeTask = (taskId: string) => {
    console.log('[🗑️ Remove Task]', taskId);
  };

  const updateTask = (task: Task) => {
    console.log('[✏️ Update Task]', task);
  };

  const addLog = (log: LogEntry) => {
    console.log('[📝 Add Log]', log);
  };

  const removeLog = (logId: string) => {
    console.log('[🗑️ Remove Log]', logId);
  };

  const updateLog = (log: LogEntry) => {
    console.log('[✏️ Update Log]', log);
  };

  const markNotificationRead = (id: string) => {
    console.log('[👁️ Mark Notification Read]', id);
  };

  const removeNotification = (id: string) => {
    console.log('[🗑️ Remove Notification]', id);
  };

  const clearNotifications = () => {
    console.log('[🧹 Clear Notifications]');
  };

  const updateNotification = (notification: Notification) => {
    console.log('[✏️ Update Notification]', notification);
  };

  const connect = async () => {
    console.log('[🔗 Connect]');
  };

  const disconnect = () => {
    console.log('[🔌 Disconnect]');
  };

  const refreshData = async () => {
    console.log('[🔄 Refresh Data]');
  };

  return (
    <AppContext.Provider value={{ 
      servers, 
      tasks, 
      addNotification,
      addServer,
      updateServer,
      removeServer,
      addTask,
      removeTask,
      updateTask,
      addLog,
      removeLog,
      updateLog,
      markNotificationRead,
      removeNotification,
      clearNotifications,
      updateNotification,
      connect,
      disconnect,
      refreshData
    }}>
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
