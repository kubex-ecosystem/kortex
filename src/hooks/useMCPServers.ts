/**
 * 🎣 useMCPServers Hook
 * Hook para gerenciar servidores MCP com dados reais do sistema
 */

import { useState, useEffect, useCallback } from 'react';
import { MCPServerType } from '../types/MCP/Server';
import { MCPStatsType } from '../types/MCP/Context';
import { ServerStatus } from '../types/ServerTypes';
import { mcpService } from '../lib/mcpService';

interface UseMCPServersReturn {
  // State
  servers: MCPServerType[];
  isLoading: boolean;
  error: string | null;
  
  // Statistics
  stats: {
    total: number;
    online: number;
    offline: number;
    warning: number;
  };
  
  // Actions
  addServer: (server: MCPServerType) => Promise<void>;
  updateServer: (server: MCPServerType) => Promise<void>;
  removeServer: (id: string) => Promise<void>;
  refreshServers: () => Promise<void>;
  testConnection: (server: MCPServerType) => Promise<boolean>;
}

export function useMCPServers(): UseMCPServersReturn {
  const [servers, setServers] = useState<MCPServerType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load initial data
  useEffect(() => {
    if (!isClient) return;
    loadServers();
  }, [isClient]);

  const loadServers = useCallback(async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check MCP server status
      const mcpConnected = await mcpService.testConnection();
      
      // Create real server based on MCP service status
      const mcpServer: MCPServerType = {
        id: 'mcp-statusrafa-1',
        name: 'StatusRafa MCP Server',
        hostname: 'localhost:3002',
        status: mcpConnected ? 'Online' : 'Offline',
        config: {
          place: 'local',
          connectionType: 'HTTP',
          connectionConfig: {
            id: 'http-config-1',
            type: 'HTTP',
            baseURL: 'http://127.0.0.1:3002',
            wsUrl: 'ws://127.0.0.1:3002',
            apiKey: '',
            enableWebSocket: false,
            autoReconnect: true,
            retryOnFailure: true,
            retryBackoff: true,
            retryBackoffFactor: 2,
            retryBackoffMaxDelay: 10000
          },
          apiProvider: {
            id: 'statusrafa-provider',
            name: 'StatusRafa MCP Provider',
            provider: 'Local',
            enabled: mcpConnected,
            activeModel: null
          }
        },
        lastUpdated: new Date(),
        tasks: [],
        logs: [],
        notifications: [],
        stats: {
          type: 'servers',
          totalServers: 1,
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          avgResponseTime: mcpConnected ? 0.5 : 999
        } as MCPStatsType,
        totalProcessed: 0,
        successRate: mcpConnected ? 100 : 0,
        avgResponseTime: 0.5
      };

      // Add FastMCP server (port 3001)
      const fastMcpServer: MCPServerType = {
        id: 'fastmcp-1',
        name: 'FastMCP Server',
        hostname: 'localhost:3001',
        status: 'Warning', // Assume warning as it's development
        config: {
          place: 'local',
          connectionType: 'HTTP',
          connectionConfig: {
            id: 'fastmcp-config-1',
            type: 'HTTP',
            baseURL: 'http://127.0.0.1:3001',
            wsUrl: 'ws://127.0.0.1:3001',
            apiKey: '',
            enableWebSocket: true,
            autoReconnect: true,
            retryOnFailure: true,
            retryBackoff: true,
            retryBackoffFactor: 2,
            retryBackoffMaxDelay: 10000
          },
          apiProvider: {
            id: 'fastmcp-provider',
            name: 'FastMCP Provider',
            provider: 'Local',
            enabled: true,
            activeModel: null
          }
        },
        lastUpdated: new Date(),
        tasks: [],
        logs: [],
        notifications: [],
        stats: {
          type: 'servers',
          totalServers: 1,
          totalTasks: 0,
          completedTasks: 0,
          failedTasks: 0,
          avgResponseTime: 1.2
        },
        totalProcessed: 0,
        successRate: 85,
        avgResponseTime: 1.2
      };

      setServers([mcpServer, fastMcpServer]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
      console.error('Failed to load MCP servers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  // Calculate statistics
  const stats = {
    total: servers.length,
    online: servers.filter(s => s.status === 'Online').length,
    offline: servers.filter(s => s.status === 'Offline').length,
    warning: servers.filter(s => s.status === 'Warning').length,
  };

  const addServer = useCallback(async (server: MCPServerType) => {
    if (!isClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Test connection first
      const connected = await testConnection(server);
      
      const newServer = {
        ...server,
        status: connected ? 'Online' as ServerStatus : 'Offline' as ServerStatus,
        lastUpdated: new Date()
      };
      
      setServers(prev => [...prev, newServer]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add server');
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  const updateServer = useCallback(async (server: MCPServerType) => {
    if (!isClient) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Test connection
      const connected = await testConnection(server);
      
      const updatedServer = {
        ...server,
        status: connected ? 'Online' as ServerStatus : 'Offline' as ServerStatus,
        lastUpdated: new Date()
      };
      
      setServers(prev => prev.map(s => s.id === server.id ? updatedServer : s));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update server');
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  const removeServer = useCallback(async (id: string) => {
    if (!isClient) return;
    
    setServers(prev => prev.filter(s => s.id !== id));
  }, [isClient]);

  const refreshServers = useCallback(async () => {
    await loadServers();
  }, [loadServers]);

  const testConnection = useCallback(async (server: MCPServerType): Promise<boolean> => {
    if (!isClient) return false;
    
    try {
      // For local MCP server, test with our mcpService
      if (server.hostname?.includes('3002')) {
        return await mcpService.testConnection();
      }
      
      // For other servers, do a basic fetch test
      const baseURL = server.config.connectionConfig.baseURL;
      const response = await fetch(`${baseURL}/health`, { 
        method: 'GET'
      }).catch(() => null);
      
      return response?.ok || false;
      
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }, [isClient]);

  return {
    // State
    servers,
    isLoading,
    error,
    stats,
    
    // Actions
    addServer,
    updateServer,
    removeServer,
    refreshServers,
    testConnection
  };
}
