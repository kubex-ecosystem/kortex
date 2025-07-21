import {
  ConfigurationEvent,
  ConfigValidationResult,
  MCPServerConfig,
  PollingControl,
  RateLimitConfig,
  RateLimitStatus
} from '../types';

// MCP Configuration Service
class MCPConfigurationService {
  private baseUrl = 'http://localhost:3002/api';
  private eventListeners: ((event: ConfigurationEvent) => void)[] = [];
  
  // Default rate limit configurations
  private defaultRateLimits: Record<string, RateLimitConfig> = {
    github: {
      enabled: true,
      intervals: {
        repositories: 300,    // 5 minutes
        pullRequests: 180,    // 3 minutes
        pipelines: 120,       // 2 minutes (N/A for GitHub)
        general: 60           // 1 minute
      },
      limits: {
        requestsPerHour: 5000,    // GitHub authenticated limit
        requestsPerMinute: 100,   // Burst protection
        concurrent: 5
      },
      autoPause: true,
      pauseThreshold: 80,
      status: 'active'
    },
    azureDevOps: {
      enabled: true,
      intervals: {
        repositories: 240,    // 4 minutes
        pullRequests: 150,    // 2.5 minutes
        pipelines: 90,        // 1.5 minutes
        general: 45           // 45 seconds
      },
      limits: {
        requestsPerHour: 3600,    // Conservative estimate
        requestsPerMinute: 60,    // Burst protection
        concurrent: 3
      },
      autoPause: true,
      pauseThreshold: 85,
      status: 'active'
    }
  };

  // Get server configuration
  async getServerConfig(serverId: unknown): Promise<MCPServerConfig> {
    if (!fetch) {
      throw new Error('Fetch API is not available');
    }

    try {
      const response: Response | undefined = await fetch(`${this.baseUrl}/config/${serverId}`);
      if (!response.ok) {
        console.error('Failed to get config:', response.statusText);
        throw new Error(`Failed to get config: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting server config:', error);
      throw error;
    }
  }

  // Update server configuration
  async updateServerConfig(
    serverId: string, 
    config: Partial<MCPServerConfig>
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/config/${serverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        this.emitEvent({
          type: 'config_updated',
          serverId,
          message: 'Server configuration updated successfully',
          timestamp: new Date().toISOString(),
          severity: 'info',
          data: config
        });
        return true;
      }
      
      throw new Error(`Config update failed: ${response.statusText}`);
    } catch (error) {
      console.error('Error updating server config:', error);
      return false;
    }
  }

  // Validate configuration before applying
  async validateConfig(config: Partial<MCPServerConfig>): Promise<ConfigValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate GitHub configuration
    if (config.providers?.github?.enabled) {
      const github = config.providers.github;
      
      if (!github.token || github.token.length < 10) {
        errors.push('GitHub token is required and must be valid');
      }
      
      if (!github.org) {
        errors.push('GitHub organization is required');
      }
      
      if (github.rateLimitSettings?.intervals.repositories < 60) {
        warnings.push('GitHub repository polling interval less than 1 minute may hit rate limits');
        suggestions.push('Consider increasing repository polling interval to at least 5 minutes');
      }
    }

    // Validate Azure DevOps configuration
    if (config.providers?.azureDevOps?.enabled) {
      const azure = config.providers.azureDevOps;
      
      if (!azure.token || azure.token.length < 10) {
        errors.push('Azure DevOps token is required and must be valid');
      }
      
      if (!azure.org || !azure.project) {
        errors.push('Azure DevOps organization and project are required');
      }
      
      if (azure.rateLimitSettings?.intervals.pipelines < 30) {
        warnings.push('Azure pipeline polling interval less than 30 seconds may be excessive');
      }
    }

    // Validate server settings
    if (config.settings?.port && (config.settings.port < 1024 || config.settings.port > 65535)) {
      errors.push('Port must be between 1024 and 65535');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // Get current rate limit status
  async getRateLimitStatus(serverId: string, provider: string): Promise<RateLimitStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/rate-limit/${serverId}/${provider}`);
      if (!response.ok) {
        throw new Error(`Failed to get rate limit status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      throw error;
    }
  }

  // Update rate limit configuration
  async updateRateLimitConfig(
    serverId: string, 
    provider: string, 
    config: RateLimitConfig
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rate-limit/${serverId}/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating rate limit config:', error);
      return false;
    }
  }

  // Start polling for specific providers
  async startPolling(serverId: string, providers?: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/polling/${serverId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providers }),
      });

      if (response.ok) {
        this.emitEvent({
          type: 'config_updated',
          serverId,
          message: `Polling started for providers: ${providers?.join(', ') || 'all'}`,
          timestamp: new Date().toISOString(),
          severity: 'info'
        });
      }

      return response.ok;
    } catch (error) {
      console.error('Error starting polling:', error);
      return false;
    }
  }

  // Pause polling for specific providers
  async pausePolling(serverId: string, providers?: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/polling/${serverId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providers }),
      });

      if (response.ok) {
        this.emitEvent({
          type: 'polling_paused',
          serverId,
          message: `Polling paused for providers: ${providers?.join(', ') || 'all'}`,
          timestamp: new Date().toISOString(),
          severity: 'warning'
        });
      }

      return response.ok;
    } catch (error) {
      console.error('Error pausing polling:', error);
      return false;
    }
  }

  // Get current polling status
  async getPollingStatus(serverId: string): Promise<PollingControl> {
    try {
      const response = await fetch(`${this.baseUrl}/polling/${serverId}/status`);
      if (!response.ok) {
        throw new Error(`Failed to get polling status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting polling status:', error);
      throw error;
    }
  }

  // Calculate optimal intervals based on usage patterns
  calculateOptimalIntervals(
    provider: string, 
    currentUsage: number, 
    hourlyLimit: number
  ): Record<string, number> {
    const safetyMargin = 0.8; // Use only 80% of available quota
    const availableRequests = hourlyLimit * safetyMargin;
    const requestsPerSecond = availableRequests / 3600;
    
    // Estimate requests per endpoint
    const endpointWeights = {
      repositories: 0.3,  // 30% of requests
      pullRequests: 0.4,  // 40% of requests  
      pipelines: 0.2,     // 20% of requests
      general: 0.1        // 10% of requests
    };

    const intervals: Record<string, number> = {};
    
    Object.entries(endpointWeights).forEach(([endpoint, weight]) => {
      const endpointRequestsPerSecond = requestsPerSecond * weight;
      const optimalInterval = Math.max(60, 1 / endpointRequestsPerSecond); // Min 1 minute
      intervals[endpoint] = Math.ceil(optimalInterval);
    });

    return intervals;
  }

  // Event management
  addEventListener(listener: (event: ConfigurationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: ConfigurationEvent) => void): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  private emitEvent(event: ConfigurationEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  // Get default configuration for a provider
  getDefaultRateLimitConfig(provider: string): RateLimitConfig {
    return this.defaultRateLimits[provider] || this.defaultRateLimits.github;
  }

  // Health check for configuration
  async healthCheck(serverId: string): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check server connectivity
      const config = await this.getServerConfig(serverId);
      
      // Check rate limit status for each provider
      for (const [provider, providerConfig] of Object.entries(config.providers)) {
        if (providerConfig?.enabled) {
          try {
            const rateLimitStatus = await this.getRateLimitStatus(serverId, provider);
            
            if (rateLimitStatus.current.percentage > 90) {
              issues.push(`${provider} is approaching rate limit (${rateLimitStatus.current.percentage}%)`);
              recommendations.push(`Consider increasing polling intervals for ${provider}`);
            }
          } catch (error) {
            issues.push(`Cannot check rate limit status for ${provider}`);
          }
        }
      }

      return {
        healthy: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      return {
        healthy: false,
        issues: [`Cannot connect to server ${serverId}: ${error}`],
        recommendations: ['Check server connection and configuration']
      };
    }
  }
}

// Export singleton instance
export const mcpConfigService = new MCPConfigurationService();
export default mcpConfigService;
