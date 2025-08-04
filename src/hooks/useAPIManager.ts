/**
 * 🎣 useAPIManager Hook
 * Hook personalizado para gerenciar API providers com state management integrado
 */

import { useCallback, useEffect, useState } from 'react';
import { apiManager, ConnectionTestResult } from '../lib/apiService';
import { APIProvider } from '../types/APITypes';

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

  // Initialize with real data from storage and detect MCP servers
  useEffect(() => {
    if (!isClient) return; // Skip SSR initialization

    const initializeProviders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to load from storage first
        const savedProviders = apiManager.getAllProviders();
        
        // If no saved providers, try to detect MCP servers automatically
        if (savedProviders.length === 0) {
          console.log('🔍 Detecting MCP servers automatically...');
          
          // Test StatusRafa MCP Server
          try {
            const mcpResponse = await fetch('/api/mcp/api/status');
            if (mcpResponse.ok) {
              const statusData = await mcpResponse.json();
              
              const mcpProvider: APIProvider = {
                id: `mcp-${Date.now()}`,
                name: 'StatusRafa MCP Server',
                provider: 'StatusRafa MCP',
                keyPreview: 'auto-detected',
                status: 'Connected',
                lastTested: new Date().toISOString(),
                requestsToday: statusData.metrics?.totalRequests || 0,
                monthlyLimit: 999999,
                costPerRequest: 0,
                mcpEndpoint: 'http://localhost:3001',
                githubToken: '***',
                azureToken: '***',
                azureOrg: 'detected',
                azureProject: 'detected'
              };
              
              apiManager.addProvider(mcpProvider);
              console.log('✅ StatusRafa MCP Server detected and added');
            }
          } catch (err) {
            console.log('❌ StatusRafa MCP Server not available');
          }
          
          // Refresh providers list
          const updatedProviders = apiManager.getAllProviders();
          setProviders(updatedProviders);
          
          // If still no providers after detection, start with empty array
          if (updatedProviders.length === 0) {
            console.log('📋 Starting with empty providers list - user can add manually');
            setProviders([]);
          }
        } else {
          // Load existing providers
          setProviders(savedProviders);
        }
      } catch (err) {
        console.error('❌ Failed to initialize providers:', err);
        setError('Failed to initialize API providers');
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
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
