/**
 * 🎣 useAPIManager Hook
 * Hook personalizado para gerenciar API providers com state management integrado
 */

import { useState, useEffect, useCallback } from 'react';
import { APIProvider } from '../types/APITypes';
import { apiManager, ConnectionTestResult, ServiceResponse } from '../lib/apiService';

interface UseAPIManagerReturn {
  // State
  providers: APIProvider[];
  isLoading: boolean;
  error: string | null;
  
  // Statistics
  stats: {
    total: number;
    connected: number;
    totalRequests: number;
    totalCost: number;
  };
  
  // Actions
  addProvider: (provider: APIProvider) => Promise<void>;
  updateProvider: (provider: APIProvider) => Promise<void>;
  removeProvider: (id: string) => Promise<void>;
  testProvider: (provider: APIProvider) => Promise<ConnectionTestResult>;
  refreshProviders: () => Promise<void>;
  
  // MCP specific
  mcpData: {
    repos: any[] | null;
    prs: any[] | null;
    pipelines: any[] | null;
    memory: any[] | null;
  };
  fetchMCPData: (operation: 'repos' | 'prs' | 'pipelines' | 'memory', query?: string) => Promise<void>;
}

export function useAPIManager(): UseAPIManagerReturn {
  const [providers, setProviders] = useState<APIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // MCP Data state
  const [mcpData, setMcpData] = useState({
    repos: null as any[] | null,
    prs: null as any[] | null,
    pipelines: null as any[] | null,
    memory: null as any[] | null,
  });

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize with mock data - will be replaced with real API calls
  useEffect(() => {
    if (!isClient) return; // Skip SSR initialization

    const initializeProviders = () => {
      const mockProviders: APIProvider[] = [
        {
          id: '1',
          name: 'OpenAI Production',
          provider: 'OpenAI',
          keyPreview: 'sk-...J3K',
          status: 'Connected',
          lastTested: '2025-01-18T10:30:00Z',
          requestsToday: 245,
          monthlyLimit: 10000,
          costPerRequest: 0.002,
        },
        {
          id: '2', 
          name: 'StatusRafa MCP Local',
          provider: 'StatusRafa MCP',
          keyPreview: 'mcp-local',
          status: 'Disconnected',
          lastTested: '2025-01-18T09:15:00Z',
          requestsToday: 0,
          monthlyLimit: 999999,
          costPerRequest: 0,
          mcpEndpoint: 'http://127.0.0.1:3002',
          githubToken: 'ghp_...ABC',
          azureToken: 'pat_...XYZ',
          azureOrg: 'rafa-mori',
          azureProject: 'kubex'
        },
        {
          id: '3',
          name: 'Anthropic Claude',
          provider: 'Anthropic', 
          keyPreview: 'sk-ant...9XY',
          status: 'Connected',
          lastTested: '2025-01-18T11:45:00Z',
          requestsToday: 89,
          monthlyLimit: 5000,
          costPerRequest: 0.008,
        }
      ];

      // Initialize API manager with mock data (client-side only)
      mockProviders.forEach(provider => apiManager.addProvider(provider));
      setProviders(mockProviders);
    };

    initializeProviders();
  }, [isClient]);

  // Calculate statistics
  const stats = {
    total: providers.length,
    connected: providers.filter(p => p.status === 'Connected').length,
    totalRequests: providers.reduce((sum, p) => sum + p.requestsToday, 0),
    totalCost: providers.reduce((sum, p) => sum + (p.requestsToday * p.costPerRequest), 0)
  };

  // Actions
  const addProvider = useCallback(async (provider: APIProvider) => {
    if (!isClient) return; // Skip SSR
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Test connection first
      const testResult = await apiManager.testProvider(provider);
      
      // Update provider status based on test result
      const updatedProvider = {
        ...provider,
        status: testResult.connected ? 'Connected' as const : 'Disconnected' as const,
        lastTested: new Date().toISOString()
      };
      
      apiManager.addProvider(updatedProvider);
      setProviders(prev => [...prev, updatedProvider]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add provider');
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  const updateProvider = useCallback(async (provider: APIProvider) => {
    if (!isClient) return; // Skip SSR
    
    setIsLoading(true);
    setError(null);
    
    try {
      apiManager.updateProvider(provider);
      setProviders(prev => prev.map(p => p.id === provider.id ? provider : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider');
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  const removeProvider = useCallback(async (id: string) => {
    if (!isClient) return; // Skip SSR
    
    setIsLoading(true);
    setError(null);
    
    try {
      apiManager.removeProvider(id);
      setProviders(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove provider');
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  const testProvider = useCallback(async (provider: APIProvider): Promise<ConnectionTestResult> => {
    if (!isClient) {
      return { connected: false, error: 'Not available in SSR' };
    }
    
    setError(null);
    
    try {
      // Update provider status to testing
      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, status: 'Testing' as const } : p
      ));

      const result = await apiManager.testProvider(provider);
      
      // Update provider with test result
      const updatedProvider = {
        ...provider,
        status: result.connected ? 'Connected' as const : 'Disconnected' as const,
        lastTested: new Date().toISOString()
      };
      
      setProviders(prev => prev.map(p => 
        p.id === provider.id ? updatedProvider : p
      ));
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      
      // Update provider status to disconnected on error
      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, status: 'Disconnected' as const } : p
      ));
      
      return {
        connected: false,
        error: err instanceof Error ? err.message : 'Connection test failed'
      };
    }
  }, [isClient]);

  const refreshProviders = useCallback(async () => {
    if (!isClient) return; // Skip SSR
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Test all providers concurrently
      const testPromises = providers.map(async (provider) => {
        try {
          const result = await apiManager.testProvider(provider);
          return {
            ...provider,
            status: result.connected ? 'Connected' as const : 'Disconnected' as const,
            lastTested: new Date().toISOString()
          };
        } catch {
          return {
            ...provider,
            status: 'Disconnected' as const,
            lastTested: new Date().toISOString()
          };
        }
      });
      
      const updatedProviders = await Promise.all(testPromises);
      setProviders(updatedProviders);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh providers');
    } finally {
      setIsLoading(false);
    }
  }, [providers, isClient]);

  const fetchMCPData = useCallback(async (
    operation: 'repos' | 'prs' | 'pipelines' | 'memory', 
    query?: string
  ) => {
    if (!isClient) return; // Skip SSR
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiManager.getMCPData(operation, query);
      
      if (result.success) {
        setMcpData(prev => ({
          ...prev,
          [operation]: result.data
        }));
      } else {
        setError(`Failed to fetch ${operation}: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch ${operation}`);
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  return {
    // State
    providers,
    isLoading,
    error,
    stats,
    
    // Actions
    addProvider,
    updateProvider,
    removeProvider,
    testProvider,
    refreshProviders,
    
    // MCP specific
    mcpData,
    fetchMCPData,
  };
}
