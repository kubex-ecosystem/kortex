/**
 * 🔥 useSystemMetrics Hook - Versão simplificada e otimizada
 * Foca apenas nas métricas essenciais, sem deadlocks
 */

import { mcpService } from '@/lib/mcpService';
import { useCallback, useEffect, useState } from 'react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface UseSystemMetricsReturn {
  data: SystemMetrics | null;
  isLoading: boolean;
  error: string | null;
  isRealData: boolean;
  source: 'api' | 'cache' | 'mock' | 'fallback';
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

export function useSystemMetrics(): UseSystemMetricsReturn {
  const [data, setData] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  const [source, setSource] = useState<'api' | 'cache' | 'mock' | 'fallback'>('mock');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  /**
   * Buscar métricas do sistema - SEM GUARDS que causam deadlock
   */
  const fetchMetrics = useCallback(async () => {
    console.log('🚀 fetchMetrics called');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mcpService.getSystemMetrics();
      console.log('📊 Metrics response:', response);
      
      if (response.success && response.data) {
        const responseData = response.data as any; // Tipagem temporária
        const metrics: SystemMetrics = {
          cpuUsage: responseData.cpuUsage || 0,
          memoryUsage: responseData.memoryUsage || 0,
          diskUsage: responseData.diskUsage || 0,
          networkLatency: responseData.networkLatency || 0,
        };
        
        setData(metrics);
        setIsRealData(response.isRealData || false);
        setSource(response.source);
        setLastUpdated(new Date(response.timestamp));
        
        console.log('✅ Metrics updated:', metrics);
      } else {
        console.warn('❌ Failed to get metrics:', response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching metrics');
      console.error('❌ Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
      console.log('✅ fetchMetrics finished');
    }
  }, []);
  
  /**
   * Refresh manual
   */
  const refreshData = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);
  
  /**
   * Setup inicial e auto-refresh
   */
  useEffect(() => {
    console.log('🔄 useSystemMetrics useEffect triggered');
    
    // Buscar dados iniciais
    fetchMetrics();
    
    // Auto-refresh a cada 60 segundos
    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh triggered');
      fetchMetrics();
    }, 60000);
    
    return () => {
      console.log('🧹 Cleanup useSystemMetrics');
      clearInterval(interval);
    };
  }, []); // Sem dependências para evitar loops
  
  return {
    data,
    isLoading,
    error,
    isRealData,
    source,
    lastUpdated,
    refreshData
  };
}
