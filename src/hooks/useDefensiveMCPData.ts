/**
 * Defensive MCP Data Hook v2.0
 * Hook resiliente que funciona com ou sem MCP Server
 * Substitui o useMCPData original com fallbacks inteligentes
 */

import { useCallback, useEffect, useState } from 'react';
import { useResilientApp } from '../context/ResilientAppContext';
import { FALLBACK_DATA, resilientMCPService } from '../lib/resilientMcpService';

export interface DefensiveMCPStats {
  totalRepositories: number;
  totalPullRequests: number;
  totalPipelines: number;
  memoryEntries: number;
  connectedSources: number;
  successfulPipelines: number;
  failedPipelines: number;
  openPRs: number;
  draftPRs: number;
}

export interface DefensiveRepository {
  id: string;
  name: string;
  url: string;
  status?: string;
}

export interface DefensivePullRequest {
  id: string;
  title: string;
  status: string;
  author: string;
  createdAt: string;
}

export interface DefensivePipeline {
  id: string;
  name: string;
  status: string;
  lastRun: string;
}

export interface DefensiveMemoryEntry {
  id: string;
  content: string;
  timestamp: string;
}

export interface UseDefensiveMCPDataReturn {
  // Connection Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isUsingFallback: boolean;
  
  // Raw Data
  repositories: DefensiveRepository[];
  pullRequests: DefensivePullRequest[];
  pipelines: DefensivePipeline[];
  memory: DefensiveMemoryEntry[];

  // Calculated Statistics  
  stats: DefensiveMCPStats;

  // Actions
  refresh: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  addMemoryNote: (note: string) => Promise<boolean>;
  getSuggestion: () => Promise<string | null>;
  
  // Status Helpers
  getDataSource: () => 'live' | 'cached' | 'fallback';
  getDataAge: () => number; // in minutes
}

export function useDefensiveMCPData(): UseDefensiveMCPDataReturn {
  const { connectionStatus, serviceStatus, isUsingFallback } = useResilientApp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Data states with fallbacks
  const [repositories, setRepositories] = useState<DefensiveRepository[]>(FALLBACK_DATA.repositories);
  const [pullRequests, setPullRequests] = useState<DefensivePullRequest[]>(FALLBACK_DATA.pullRequests);
  const [pipelines, setPipelines] = useState<DefensivePipeline[]>([]);
  const [memory, setMemory] = useState<DefensiveMemoryEntry[]>([]);
  
  // Data source tracking
  const [dataSource, setDataSource] = useState<'live' | 'cached' | 'fallback'>('fallback');

  // Calculate stats from current data
  const stats: DefensiveMCPStats = {
    totalRepositories: repositories.length,
    totalPullRequests: pullRequests.length,
    totalPipelines: pipelines.length,
    memoryEntries: memory.length,
    connectedSources: isUsingFallback ? 0 : 1,
    successfulPipelines: pipelines.filter(p => p.status === 'success').length,
    failedPipelines: pipelines.filter(p => p.status === 'failed').length,
    openPRs: pullRequests.filter(pr => pr.status === 'open').length,
    draftPRs: pullRequests.filter(pr => pr.status === 'draft').length,
  };

  // Refresh data with resilient service
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch repositories
      const reposResponse = await resilientMCPService.safeRequest('/github/repositories', {}, {
        fallbackData: FALLBACK_DATA.repositories,
        useCache: true,
        maxRetries: 2
      });

      if (reposResponse.success) {
        setRepositories(reposResponse.data);
        setDataSource(reposResponse.isFromFallback ? 'fallback' : reposResponse.isFromCache ? 'cached' : 'live');
      }

      // Fetch pull requests
      const prsResponse = await resilientMCPService.safeRequest('/github/pull-requests', {}, {
        fallbackData: FALLBACK_DATA.pullRequests,
        useCache: true
      });

      if (prsResponse.success) {
        setPullRequests(prsResponse.data);
      }

      // Fetch pipelines (optional)
      try {
        const pipelinesResponse = await resilientMCPService.safeRequest('/pipelines', {}, {
          fallbackData: [],
          useCache: true,
          maxRetries: 1
        });

        if (pipelinesResponse.success) {
          setPipelines(pipelinesResponse.data);
        }
      } catch (pipelineError) {
        // Pipelines are optional, don't fail the whole refresh
        console.warn('Pipelines data not available:', pipelineError);
      }

      setLastUpdated(new Date());
      
    } catch (refreshError) {
      const errorMessage = refreshError instanceof Error ? refreshError.message : 'Failed to refresh data';
      setError(errorMessage);
      console.warn('Data refresh failed, using fallback:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await resilientMCPService.safeRequest('/health', {}, {
        maxRetries: 1,
        useCache: false
      });
      return response.success && !response.isFromFallback;
    } catch {
      return false;
    }
  }, []);

  // Add memory note
  const addMemoryNote = useCallback(async (note: string): Promise<boolean> => {
    try {
      const response = await resilientMCPService.safeRequest('/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note })
      }, {
        fallbackData: { success: false },
        maxRetries: 1
      });

      if (response.success && !response.isFromFallback) {
        // Add to local memory if successful
        const newEntry: DefensiveMemoryEntry = {
          id: `memory_${Date.now()}`,
          content: note,
          timestamp: new Date().toISOString()
        };
        setMemory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }, []);

  // Get AI suggestion
  const getSuggestion = useCallback(async (): Promise<string | null> => {
    try {
      const response = await resilientMCPService.safeRequest('/ai/suggestion', {}, {
        fallbackData: 'Consider reviewing recent pull requests and monitoring pipeline health.',
        maxRetries: 1
      });

      return response.success ? response.data : null;
    } catch {
      return 'System operating in offline mode. Consider checking connection settings.';
    }
  }, []);

  // Get data source helper
  const getDataSource = useCallback(() => dataSource, [dataSource]);

  // Get data age in minutes
  const getDataAge = useCallback(() => {
    if (!lastUpdated) return Infinity;
    return Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
  }, [lastUpdated]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh when connection comes back online
  useEffect(() => {
    if (connectionStatus === 'online' && dataSource === 'fallback') {
      refresh();
    }
  }, [connectionStatus, dataSource, refresh]);

  return {
    // Connection Status
    isConnected: connectionStatus === 'online',
    isLoading,
    error,
    lastUpdated,
    isUsingFallback,

    // Raw Data
    repositories,
    pullRequests,
    pipelines,
    memory,

    // Calculated Statistics
    stats,

    // Actions
    refresh,
    testConnection,
    addMemoryNote,
    getSuggestion,

    // Status Helpers
    getDataSource,
    getDataAge
  };
}

// Hook para usar apenas estatísticas básicas (mais leve)
export function useDefensiveMCPStats() {
  const { stats, isLoading, error, isUsingFallback } = useDefensiveMCPData();
  
  return {
    stats,
    isLoading,
    error,
    isUsingFallback
  };
}

export default useDefensiveMCPData;
