import { useState, useEffect, useCallback } from 'react';
import { 
  MCPServerConfig, 
  RateLimitConfig, 
  PollingControl,
  RateLimitStatus,
  ConfigurationEvent
} from '../types';
import mcpConfigService from '../lib/mcpConfigService';

interface UseMCPConfigReturn {
  // Server configuration
  config: MCPServerConfig | null;
  updateConfig: (updates: Partial<MCPServerConfig>) => Promise<boolean>;
  validateConfig: (config: Partial<MCPServerConfig>) => Promise<any>;
  
  // Rate limiting
  rateLimitStatus: Record<string, RateLimitStatus>;
  updateRateLimit: (provider: string, config: RateLimitConfig) => Promise<boolean>;
  
  // Polling control
  pollingStatus: PollingControl | null;
  startPolling: (providers?: string[]) => Promise<boolean>;
  pausePolling: (providers?: string[]) => Promise<boolean>;
  
  // Status and events
  isLoading: boolean;
  error: string | null;
  events: ConfigurationEvent[];
  healthStatus: {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } | null;
  
  // Actions
  refreshStatus: () => Promise<void>;
  clearEvents: () => void;
  calculateOptimalIntervals: (provider: string, currentUsage: number, hourlyLimit: number) => Record<string, number>;
}

export function useMCPConfig(serverId: string): UseMCPConfigReturn {
  const [config, setConfig] = useState<MCPServerConfig | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<Record<string, RateLimitStatus>>({});
  const [pollingStatus, setPollingStatus] = useState<PollingControl | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ConfigurationEvent[]>([]);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!serverId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Load server configuration
      const serverConfig = await mcpConfigService.getServerConfig(serverId);
      setConfig(serverConfig);

      // Load rate limit status for enabled providers
      const rateLimits: Record<string, RateLimitStatus> = {};
      
      if (serverConfig.providers.github?.enabled) {
        try {
          rateLimits.github = await mcpConfigService.getRateLimitStatus(serverId, 'github');
        } catch (error) {
          console.warn('Could not load GitHub rate limit status:', error);
        }
      }
      
      if (serverConfig.providers.azureDevOps?.enabled) {
        try {
          rateLimits.azureDevOps = await mcpConfigService.getRateLimitStatus(serverId, 'azureDevOps');
        } catch (error) {
          console.warn('Could not load Azure DevOps rate limit status:', error);
        }
      }
      
      setRateLimitStatus(rateLimits);

      // Load polling status
      try {
        const polling = await mcpConfigService.getPollingStatus(serverId);
        setPollingStatus(polling);
      } catch (error) {
        console.warn('Could not load polling status:', error);
      }

      // Load health status
      try {
        const health = await mcpConfigService.healthCheck(serverId);
        setHealthStatus(health);
      } catch (error) {
        console.warn('Could not load health status:', error);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      console.error('Error loading MCP configuration:', err);
    } finally {
      setIsLoading(false);
    }
  }, [serverId]);

  // Event listener for configuration events
  useEffect(() => {
    const handleEvent = (event: ConfigurationEvent) => {
      if (event.serverId === serverId) {
        setEvents(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
        
        // Refresh data on relevant events
        if (['config_updated', 'polling_paused', 'rate_limit_warning'].includes(event.type)) {
          loadData();
        }
      }
    };

    mcpConfigService.addEventListener(handleEvent);
    
    return () => {
      mcpConfigService.removeEventListener(handleEvent);
    };
  }, [serverId, loadData]);

  // Initial load and periodic refresh
  useEffect(() => {
    loadData();
    
    // Refresh rate limit status every 5 minutes
    const refreshInterval = setInterval(() => {
      if (config) {
        // Refresh rate limits for enabled providers
        Object.entries(config.providers).forEach(async ([provider, providerConfig]) => {
          if (providerConfig?.enabled) {
            try {
              const status = await mcpConfigService.getRateLimitStatus(serverId, provider);
              setRateLimitStatus(prev => ({
                ...prev,
                [provider]: status
              }));
            } catch (error) {
              console.warn(`Could not refresh ${provider} rate limit status:`, error);
            }
          }
        });
      }
    }, 300000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [serverId, loadData, config]);

  // Update server configuration
  const updateConfig = useCallback(async (updates: Partial<MCPServerConfig>): Promise<boolean> => {
    if (!serverId) return false;
    
    try {
      setIsLoading(true);
      const success = await mcpConfigService.updateServerConfig(serverId, updates);
      
      if (success) {
        // Reload configuration after update
        await loadData();
      }
      
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [serverId, loadData]);

  // Validate configuration
  const validateConfig = useCallback(async (configToValidate: Partial<MCPServerConfig>) => {
    try {
      return await mcpConfigService.validateConfig(configToValidate);
    } catch (error) {
      console.error('Error validating configuration:', error);
      return {
        valid: false,
        errors: ['Validation failed'],
        warnings: [],
        suggestions: []
      };
    }
  }, []);

  // Update rate limit configuration
  const updateRateLimit = useCallback(async (provider: string, rateLimitConfig: RateLimitConfig): Promise<boolean> => {
    if (!serverId) return false;
    
    try {
      const success = await mcpConfigService.updateRateLimitConfig(serverId, provider, rateLimitConfig);
      
      if (success) {
        // Refresh rate limit status
        const status = await mcpConfigService.getRateLimitStatus(serverId, provider);
        setRateLimitStatus(prev => ({
          ...prev,
          [provider]: status
        }));
      }
      
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update rate limit configuration');
      return false;
    }
  }, [serverId]);

  // Start polling
  const startPolling = useCallback(async (providers?: string[]): Promise<boolean> => {
    if (!serverId) return false;
    
    try {
      const success = await mcpConfigService.startPolling(serverId, providers);
      
      if (success) {
        // Refresh polling status
        const status = await mcpConfigService.getPollingStatus(serverId);
        setPollingStatus(status);
      }
      
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start polling');
      return false;
    }
  }, [serverId]);

  // Pause polling
  const pausePolling = useCallback(async (providers?: string[]): Promise<boolean> => {
    if (!serverId) return false;
    
    try {
      const success = await mcpConfigService.pausePolling(serverId, providers);
      
      if (success) {
        // Refresh polling status
        const status = await mcpConfigService.getPollingStatus(serverId);
        setPollingStatus(status);
      }
      
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pause polling');
      return false;
    }
  }, [serverId]);

  // Refresh all status
  const refreshStatus = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Calculate optimal intervals
  const calculateOptimalIntervals = useCallback((provider: string, currentUsage: number, hourlyLimit: number) => {
    return mcpConfigService.calculateOptimalIntervals(provider, currentUsage, hourlyLimit);
  }, []);

  return {
    config,
    updateConfig,
    validateConfig,
    rateLimitStatus,
    updateRateLimit,
    pollingStatus,
    startPolling,
    pausePolling,
    isLoading,
    error,
    events,
    healthStatus,
    refreshStatus,
    clearEvents,
    calculateOptimalIntervals
  };
}
