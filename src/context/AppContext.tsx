// src/context/AppContext.tsx
import { Context, createContext, ReactNode, useContext, useState } from 'react';
import { LogEntry, Notification, Task } from '../types';
import { MCPServerType } from '../types/MCP/Server';

export interface AppNotification extends Partial<Notification> {
  id: string;
  type: 'info' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
}

export interface AppContextType {
  connectionStatus?: 'connected' | 'disconnected';
  servers?: MCPServerType[];
  tasks?: Task[];
  logs?: LogEntry[];
  notifications?: AppNotification[];
  isConnected: boolean;
  isLoading: boolean;
  error?: string | null;
  lastUpdate?: Date | null;
  isDark?: boolean;
  setIsDark?: (isDark: boolean) => void;
  toggleTheme?: () => void;
  connect?: () => Promise<void>;
  disconnect?: () => void;
  refreshData?: () => Promise<void>;
  addTask?: (task: Task) => void;
  addServer?: (server: MCPServerType) => void;
  addLog?: (log: LogEntry) => void;
  removeTask?: (taskId: string) => void;
  removeServer?: (serverId: string) => void;
  removeLog?: (logId: string) => void;
  markNotificationRead?: (id: string) => void;
  removeNotification?: (id: string) => void;
  clearNotifications?: () => void;
  updateServer?: (server: MCPServerType) => void;
  updateTask?: (task: Task) => void;
  updateLog?: (log: LogEntry) => void;
  updateNotification?: (notification: AppNotification) => void;
  addNotification?: (n: AppNotification) => void;
}

const AppContext: Context<AppContextType | undefined> = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [servers, setServers] = useState<MCPServerType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const toggleTheme = () => {
    if (!document) 
      return;

    setIsDark(prev => !prev);
    document.documentElement.classList.toggle('dark', !isDark);
    document.hasStorageAccess().then(granted => {
      if (granted) {
        localStorage.setItem('isDark', JSON.stringify(!isDark));
      }
    });
  };
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const mockRemoveNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (notification: AppNotification) => {
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

  const updateNotification = (notification: AppNotification) => {
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

  const appContextValue: Context<AppContextType | undefined> = AppContext || createContext({
    servers: servers,
    tasks: tasks,
    isConnected: isConnected,
    isLoading: isLoading,
    error: error,
    logs: logs,
    notifications: notifications,
    connectionStatus: connectionStatus,
    lastUpdate: lastUpdate,
    isDark: isDark,
    setIsDark: setIsDark,
    toggleTheme: toggleTheme,
    addTask: addTask,
    addNotification: addNotification,
    addServer: addServer,
    updateServer: updateServer,
    removeServer: removeServer,
    removeTask: removeTask,
    updateTask: updateTask,
    addLog: addLog,
    removeLog: removeLog,
    updateLog: updateLog,
    markNotificationRead: markNotificationRead,
    removeNotification: removeNotification,
    clearNotifications: clearNotifications,
    updateNotification: updateNotification,
    connect: connect,
    disconnect: disconnect,
    refreshData: refreshData
  } as AppContextType) as Context<AppContextType | undefined>;

  return (
    <AppContext.Provider value={{
        ...appContextValue,
        servers,
        tasks,
        isConnected,
        isLoading,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  // Use the context to get the app state
  if (!useContext) {
    throw new Error('React.useContext is not available. Ensure you are using React 16.8 or later.');
  }
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
};

// type AppContextProps = AppContextType & {
//   isDark?: boolean;
//   setIsDark?: (isDark: boolean) => void;
//   toggleTheme?: () => void;
// };

export default { AppProvider, useApp, AppContext, createMockAppContext: (overrides: Partial<AppContextType> = {}) => ({
  ...overrides,
}) };