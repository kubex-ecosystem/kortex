import React, { createContext, useContext, useState } from 'react';
import { Task, MCPServer, APIProvider, Notification, AppSettings, LogEntry } from '../types';

interface AppContextType {
  tasks: Task[];
  servers: MCPServer[];
  providers: APIProvider[];
  notifications: Notification[];
  settings: AppSettings;
  logs: LogEntry[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1', name: 'Sentiment Analysis - Customer Reviews', status: 'Running',
      estimatedTime: '2m 34s', progress: 0.67, startedAt: '2024-07-10T14:30:00Z',
      server: 'MCP-01', model: 'Claude'
    },
    {
      id: '2', name: 'Generate Q2 Financial Report', status: 'Completed',
      estimatedTime: '45s', startedAt: '2024-07-10T14:15:00Z',
      server: 'MCP-02', model: 'GPT-4'
    },
    {
      id: '3', name: 'Database Backup Process', status: 'Failed',
      estimatedTime: '5m 12s', startedAt: '2024-07-10T14:20:00Z',
      server: 'MCP-01', model: 'Claude'
    },
    {
      id: '4', name: 'PDF Document Indexing', status: 'Pending',
      estimatedTime: '1m 20s', server: 'MCP-03', model: 'Gemini'
    },
    {
      id: '5', name: 'ML Model Training', status: 'Running',
      estimatedTime: '8m 45s', progress: 0.23, startedAt: '2024-07-10T14:35:00Z',
      server: 'MCP-02', model: 'GPT-4'
    }
  ]);

  const [servers] = useState<MCPServer[]>([
    {
      id: '1', name: 'MCP-01', hostname: '192.168.1.100:8080', status: 'Online',
      capacity: 10, currentTasks: 7, avgResponseTime: 1.2, uptime: '15d 8h',
      totalProcessed: 1247, successRate: 94.2
    },
    {
      id: '2', name: 'MCP-02', hostname: '192.168.1.101:8080', status: 'Online',
      capacity: 8, currentTasks: 3, avgResponseTime: 0.9, uptime: '22d 14h',
      totalProcessed: 892, successRate: 97.1
    },
    {
      id: '3', name: 'MCP-03', hostname: '192.168.1.102:8080', status: 'Warning',
      capacity: 12, currentTasks: 11, avgResponseTime: 3.1, uptime: '5d 2h',
      totalProcessed: 456, successRate: 89.3
    }
  ]);

  const [providers] = useState<APIProvider[]>([
    {
      id: '1', name: 'Production OpenAI', provider: 'OpenAI', keyPreview: 'sk-...J9K2',
      status: 'Connected', lastTested: '2 minutes ago', requestsToday: 1247,
      monthlyLimit: 100000, costPerRequest: 0.002
    },
    {
      id: '2', name: 'Anthropic Claude', provider: 'Anthropic', keyPreview: 'sk-ant-...X7Y1',
      status: 'Connected', lastTested: '5 minutes ago', requestsToday: 892,
      monthlyLimit: 50000, costPerRequest: 0.008
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1', type: 'error', title: 'Task Failed', 
      message: 'Database Backup Process failed after 30s', 
      timestamp: new Date().toISOString(), read: false
    },
    {
      id: '2', type: 'success', title: 'Task Completed',
      message: 'Q2 Financial Report generated successfully',
      timestamp: new Date(Date.now() - 300000).toISOString(), read: false
    }
  ]);

  const [settings, setSettings] = useState<AppSettings>({
    language: 'en', timezone: 'UTC-3', autoReload: true, defaultTheme: 'system',
    notifications: true, emailReports: false, logRetentionDays: 30, refreshInterval: 5
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider value={{
      tasks, servers, providers, notifications, settings, logs,
      updateTask, addNotification, markNotificationRead, updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};