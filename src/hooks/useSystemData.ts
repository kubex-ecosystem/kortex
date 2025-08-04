/**
 * 🔥 useSystemData Hook
 * Hook baseado no useRealAPIData do kortex
 * Gerencia dados do sistema com fallback resiliente
 */

import { mcpService } from '@/lib/mcpService';
import { useCallback, useEffect, useState } from 'react';

interface SystemData {
  // Métricas do Sistema
  totalServers: number;
  activeServers: number;
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  
  // Performance
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
  
  // Conexões
  totalConnections: number;
  activeConnections: number;
}

interface UseSystemDataReturn {
  // Dados
  data: SystemData | null;
  servers: any[];
  tasks: any[];
  logs: any[];
  
  // Estados
  isLoading: boolean;
  error: string | null;
  
  // Flags de status
  isRealData: boolean;
  isFallbackData: boolean;
  isFromCache: boolean;
  
  // Metadados
  lastUpdated: Date | null;
  source: 'api' | 'cache' | 'mock' | 'fallback';
  
  // Ações
  refreshData: () => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
  
  // Service status
  serviceStatus: any;
}

export function useSystemData(): UseSystemDataReturn {
  const [data, setData] = useState<SystemData | null>(null);
  const [servers, setServers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isRealData, setIsRealData] = useState(false);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [source, setSource] = useState<'api' | 'cache' | 'mock' | 'fallback'>('mock');
  
  const [serviceStatus, setServiceStatus] = useState(mcpService.getStatus());
  
  /**
   * Buscar dados do sistema
   */
  const fetchSystemData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar métricas do sistema
      const metricsResponse = await mcpService.getSystemMetrics();
      
      if (metricsResponse.success && metricsResponse.data) {
        setData(metricsResponse.data as SystemData);
        setIsRealData(metricsResponse.isRealData || false);
        setIsFallbackData(metricsResponse.isFromFallback || false);
        setIsFromCache(metricsResponse.isFromCache || false);
        setSource(metricsResponse.source);
        setLastUpdated(new Date(metricsResponse.timestamp));
      }
      
      // Buscar lista de servidores
      const serversResponse = await mcpService.getServersList();
      if (serversResponse.success && serversResponse.data) {
        setServers(Array.isArray(serversResponse.data) ? serversResponse.data : []);
      }
      
      // Buscar lista de tasks
      const tasksResponse = await mcpService.getTasksList();
      if (tasksResponse.success && tasksResponse.data) {
        setTasks(Array.isArray(tasksResponse.data) ? tasksResponse.data : []);
      }
      
      // Buscar logs do sistema
      const logsResponse = await mcpService.getSystemLogs(30);
      if (logsResponse.success && logsResponse.data) {
        setLogs(Array.isArray(logsResponse.data) ? logsResponse.data : []);
      }
      
      // Atualizar status do service
      setServiceStatus(mcpService.getStatus());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar dados do sistema:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Refresh manual dos dados
   */
  const refreshData = useCallback(async () => {
    await fetchSystemData();
  }, [fetchSystemData]);
  
  /**
   * Ativar/desativar modo demo
   */
  const setDemoMode = useCallback((enabled: boolean) => {
    mcpService.setDemoMode(enabled);
    setServiceStatus(mcpService.getStatus());
    refreshData();
  }, [refreshData]);
  
  /**
   * Setup inicial e atualizações automáticas
   */
  useEffect(() => {
    // Buscar dados iniciais
    fetchSystemData();
    
    // Setup auto-refresh a cada 30 segundos (apenas para dados reais)
    const interval = setInterval(() => {
      if (!isFallbackData) {
        fetchSystemData();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSystemData, isFallbackData]);
  
  /**
   * Setup realtime updates
   */
  useEffect(() => {
    const unsubscribe = mcpService.startRealtimeUpdates((update) => {
      switch (update.type) {
        case 'metric_update':
          if (data && update.data.metric) {
            setData(prev => prev ? {
              ...prev,
              [update.data.metric]: update.data.value
            } : null);
            setLastUpdated(new Date(update.data.timestamp));
          }
          break;
          
        case 'server_status':
          setServers(prev => prev.map(server => 
            server.id === update.data.serverId
              ? { ...server, ...update.data }
              : server
          ));
          break;
          
        case 'task_progress':
          setTasks(prev => prev.map(task =>
            task.id === update.data.taskId
              ? { ...task, progress: update.data.progress }
              : task
          ));
          break;
          
        case 'new_log':
          setLogs(prev => [update.data, ...prev.slice(0, 49)]); // Manter apenas 50 logs
          break;
      }
    });
    
    return unsubscribe;
  }, [data]);
  
  return {
    // Dados
    data,
    servers,
    tasks,
    logs,
    
    // Estados
    isLoading,
    error,
    
    // Flags
    isRealData,
    isFallbackData,
    isFromCache,
    
    // Metadados
    lastUpdated,
    source,
    
    // Ações
    refreshData,
    setDemoMode,
    
    // Service status
    serviceStatus,
  };
}
