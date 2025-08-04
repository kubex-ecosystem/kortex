/**
 * 🔥 useServersAndTasks Hook
 * Hook separado para buscar dados de servers e tasks
 * Evita re-renders desnecessários no dashboard principal
 */

import { mcpService } from '@/lib/mcpService';
import { useCallback, useEffect, useState } from 'react';

interface UseServersAndTasksReturn {
  servers: any[];
  tasks: any[];
  logs: any[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useServersAndTasks(): UseServersAndTasksReturn {
  const [servers, setServers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Buscar dados de servers, tasks e logs
   */
  const fetchData = useCallback(async () => {
    if (isLoading) return; // Evitar chamadas simultâneas
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Buscar servers, tasks e logs em paralelo (mas apenas quando necessário)
      const [serversResponse, tasksResponse, logsResponse] = await Promise.allSettled([
        mcpService.getServersList(),
        mcpService.getTasksList(),
        mcpService.getSystemLogs(30)
      ]);
      
      // Processar servers
      if (serversResponse.status === 'fulfilled' && serversResponse.value.success) {
        setServers(Array.isArray(serversResponse.value.data) ? serversResponse.value.data : []);
      }
      
      // Processar tasks
      if (tasksResponse.status === 'fulfilled' && tasksResponse.value.success) {
        setTasks(Array.isArray(tasksResponse.value.data) ? tasksResponse.value.data : []);
      }
      
      // Processar logs
      if (logsResponse.status === 'fulfilled' && logsResponse.value.success) {
        setLogs(Array.isArray(logsResponse.value.data) ? logsResponse.value.data : []);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      console.error('Erro em useServersAndTasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  /**
   * Refresh manual
   */
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);
  
  /**
   * Setup inicial (sem auto-refresh para reduzir piscadas)
   */
  useEffect(() => {
    // Delay para não competir com useSystemData
    const timer = setTimeout(() => {
      fetchData();
    }, 2000); // 2 segundos de delay
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    servers,
    tasks,
    logs,
    isLoading,
    error,
    refreshData
  };
}
