/**
 * Hook para gerenciar dados reais do MCP Server - RESILIENT VERSION
 * Substitui dados mock por dados reais das APIs MCP
 * Funciona com ou sem MCP Server online - NUNCA QUEBRA!
 */

import { useCallback, useEffect, useState } from 'react';

// Tipos locais para compatibilidade
export interface MCPStatus {
  connected: boolean;
  lastCheck: Date;
  services: string[];
}

export interface GitHubRepo {
  name: string;
  url: string;
  stars: number;
  lastUpdate: Date;
}

export interface PullRequest {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'draft' | 'merged';
  author: string;
  url: string;
  createdAt: Date;
}

export interface Pipeline {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  branch: string;
  startedAt: Date;
  duration?: number;
}

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: Date;
  type: 'note' | 'activity' | 'error';
}

export interface MCPStats {
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

export interface UseMCPDataReturn {
  // Connection Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Raw MCP Data
  status: MCPStatus | null;
  repositories: string[];
  pullRequests: PullRequest[];
  pipelines: Pipeline[];
  memory: MemoryEntry[];

  // Calculated Statistics  
  stats: MCPStats;

  // Actions
  refresh: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  addMemoryNote: (note: string) => Promise<boolean>;
  getSuggestion: () => Promise<string | null>;
}

export function useMCPData(): UseMCPDataReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Raw Data States
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);

  // Calculate Statistics
  const stats: MCPStats = {
    totalRepositories: repositories.length,
    totalPullRequests: pullRequests.length,
    totalPipelines: pipelines.length,
    memoryEntries: memory.length,
    connectedSources: (status?.github_configured ? 1 : 0) + (status?.azure_configured ? 1 : 0),
    successfulPipelines: pipelines.filter(p => p.result === 'succeeded').length,
    failedPipelines: pipelines.filter(p => p.result === 'failed').length,
    openPRs: pullRequests.filter(pr => !pr.draft).length,
    draftPRs: pullRequests.filter(pr => pr.draft).length,
  };

  // Test Connection
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const connected = await mcpService.testConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setError('Não foi possível conectar com o MCP Server');
      }
      
      return connected;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro de conexão: ${errorMsg}`);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh All Data
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Test connection first
      const connected = await testConnection();
      if (!connected) return;

      // Fetch all data in parallel
      const [
        statusData,
        reposData,
        prsData,
        pipelinesData,
        memoryData
      ] = await Promise.all([
        mcpService.getStatus(),
        mcpService.getRepositories(),
        mcpService.getPullRequests(),
        mcpService.getPipelines(),
        mcpService.getMemory(20) // Get last 20 memory entries
      ]);

      // Update states
      setStatus(statusData);
      setRepositories(reposData);
      setPullRequests(prsData);
      setPipelines(pipelinesData);
      setMemory(memoryData);
      setLastUpdated(new Date());

      console.log('📊 MCP Data refreshed:', {
        repositories: reposData.length,
        pullRequests: prsData.length,
        pipelines: pipelinesData.length,
        memory: memoryData.length
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar dados';
      setError(`Erro ao atualizar: ${errorMsg}`);
      console.error('❌ MCP Data refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [testConnection]);

  // Add Memory Note
  const addMemoryNote = useCallback(async (note: string): Promise<boolean> => {
    try {
      const success = await mcpService.addMemoryEntry(note);
      if (success) {
        // Refresh memory data
        const memoryData = await mcpService.getMemory(20);
        setMemory(memoryData);
      }
      return success;
    } catch (err) {
      console.error('❌ Error adding memory note:', err);
      return false;
    }
  }, []);

  // Get Suggestion
  const getSuggestion = useCallback(async (): Promise<string | null> => {
    try {
      return await mcpService.getSuggestion();
    } catch (err) {
      console.error('❌ Error getting suggestion:', err);
      return null;
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) return;
      
      await refresh();
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    // Connection Status
    isConnected,
    isLoading,
    error,
    lastUpdated,

    // Raw Data
    status,
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
    getSuggestion
  };
}

export default useMCPData;
