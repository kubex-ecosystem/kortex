/**
 * 🎣 useAppData Hook
 * Hook centralizado para gerenciar todos os dados da aplicação com integração real
 */

import { useState, useEffect, useCallback } from 'react';
import { LogEntry, Task } from '../types';
import { MCPServerType } from '../types/MCP/Server';
import { APIProvider } from '../types/APITypes';
import { useMCPData } from './useMCPData';
import { useMCPServers } from './useMCPServers';
import { useAPIManager } from './useAPIManager';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface UseAppDataReturn {
  // MCP Data
  mcpStats: any;
  isLoadingMCP: boolean;
  mcpError: string | null;
  
  // Servers
  servers: MCPServerType[];
  serverStats: {
    total: number;
    online: number;
    offline: number;
    warning: number;
  };
  
  // API Providers
  providers: APIProvider[];
  providerStats: {
    total: number;
    connected: number;
    totalRequests: number;
    totalCost: number;
  };
  
  // Tasks & Logs (integrated from real data)
  tasks: Task[];
  logs: LogEntry[];
  notifications: Notification[];
  
  // Actions
  addServer: (server: MCPServerType) => Promise<void>;
  updateServer: (server: MCPServerType) => Promise<void>;
  removeServer: (id: string) => Promise<void>;
  
  addProvider: (provider: APIProvider) => Promise<void>;
  updateProvider: (provider: APIProvider) => Promise<void>;
  removeProvider: (id: string) => Promise<void>;
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  
  addLog: (log: LogEntry) => void;
  removeLog: (id: string) => void;
  
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshData: () => Promise<void>;
}

export function useAppData(): UseAppDataReturn {
  const [isClient, setIsClient] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Initialize hooks
  const { stats: mcpStats, isLoading: isLoadingMCP, error: mcpError } = useMCPData();
  const { servers, stats: serverStats, addServer, updateServer, removeServer, refreshServers } = useMCPServers();
  const { providers, stats: providerStats, addProvider, updateProvider, removeProvider, refreshProviders } = useAPIManager();

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize with real data from services
  useEffect(() => {
    if (!isClient) return;
    
    // Initialize notifications based on server and provider status
    initializeNotifications();
  }, [isClient, servers, providers]);

  const initializeNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];
    
    // Check for offline servers
    const offlineServers = servers.filter(s => s.status === 'Offline');
    if (offlineServers.length > 0) {
      newNotifications.push({
        id: `offline-servers-${Date.now()}`,
        title: 'Servidores Offline',
        message: `${offlineServers.length} servidor(es) estão offline: ${offlineServers.map(s => s.name).join(', ')}`,
        type: 'warning',
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Verificar Servidores',
          href: '/servers'
        }
      });
    }
    
    // Check for disconnected providers
    const disconnectedProviders = providers.filter(p => p.status === 'Disconnected');
    if (disconnectedProviders.length > 0) {
      newNotifications.push({
        id: `disconnected-providers-${Date.now()}`,
        title: 'Providers Desconectados',
        message: `${disconnectedProviders.length} provider(s) estão desconectados: ${disconnectedProviders.map(p => p.name).join(', ')}`,
        type: 'error',
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Configurar APIs',
          href: '/api-config'
        }
      });
    }
    
    // Success notification if everything is connected
    if (servers.length > 0 && servers.every(s => s.status === 'Online') && 
        providers.length > 0 && providers.every(p => p.status === 'Connected')) {
      newNotifications.push({
        id: `all-connected-${Date.now()}`,
        title: 'Sistema Operacional',
        message: `Todos os ${servers.length} servidores e ${providers.length} providers estão conectados!`,
        type: 'success',
        timestamp: new Date(),
        read: false
      });
    }
    
    setNotifications(prev => {
      // Only add notifications that don't already exist (by type)
      const existingTypes = prev.map(n => n.title);
      return [
        ...prev,
        ...newNotifications.filter(n => !existingTypes.includes(n.title))
      ];
    });
  }, [servers, providers]);

  // Notification management
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Task management
  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback((task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Log management
  const addLog = useCallback((log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  }, []);

  const removeLog = useCallback((id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  // Connection management
  const connect = useCallback(async () => {
    try {
      await Promise.all([
        refreshServers(),
        refreshProviders()
      ]);
      
      addNotification({
        title: 'Conectado',
        message: 'Sistema conectado com sucesso a todos os serviços!',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Erro de Conexão',
        message: 'Falha ao conectar com alguns serviços. Verifique a configuração.',
        type: 'error'
      });
    }
  }, [refreshServers, refreshProviders, addNotification]);

  const disconnect = useCallback(() => {
    addNotification({
      title: 'Desconectado',
      message: 'Sistema desconectado dos serviços.',
      type: 'info'
    });
  }, [addNotification]);

  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        refreshServers(),
        refreshProviders()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [refreshServers, refreshProviders]);

  return {
    // MCP Data
    mcpStats,
    isLoadingMCP,
    mcpError,
    
    // Servers
    servers,
    serverStats,
    
    // API Providers
    providers,
    providerStats,
    
    // Tasks & Logs
    tasks,
    logs,
    notifications,
    
    // Actions
    addServer,
    updateServer,
    removeServer,
    
    addProvider,
    updateProvider,
    removeProvider,
    
    addNotification,
    markNotificationRead,
    removeNotification,
    clearNotifications,
    
    addTask,
    updateTask,
    removeTask,
    
    addLog,
    removeLog,
    
    connect,
    disconnect,
    refreshData
  };
}
