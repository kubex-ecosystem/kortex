// MCP Server Configuration Types
export interface MCPServerConfig {
  id: string;
  name: string;
  url: string;
  type: 'http' | 'fastmcp';
  status: 'online' | 'offline' | 'configuring';
  
  // Provider configurations
  providers: {
    github?: {
      enabled: boolean;
      token: string;
      org: string;
      rateLimitSettings: RateLimitConfig;
    };
    azureDevOps?: {
      enabled: boolean;
      token: string;
      org: string;
      project: string;
      rateLimitSettings: RateLimitConfig;
    };
  };
  
  // Server settings
  settings: {
    port: number;
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    maxConnections?: number;
    timeout?: number;
  };
  
  lastConfigUpdate: string;
  configVersion: string;
}

// Rate Limit Configuration
export interface RateLimitConfig {
  enabled: boolean;
  
  // Polling intervals (in seconds)
  intervals: {
    repositories: number;      // Default: 300s (5min)
    pullRequests: number;     // Default: 180s (3min)  
    pipelines: number;        // Default: 120s (2min)
    general: number;          // Default: 60s (1min)
  };
  
  // API Limits
  limits: {
    requestsPerHour: number;  // GitHub: 5000/hour, Azure: varies
    requestsPerMinute: number; // Burst protection
    concurrent: number;       // Max concurrent requests
  };
  
  // Control flags
  autoPause: boolean;         // Auto pause when approaching limits
  pauseThreshold: number;     // % of limit to trigger pause (e.g., 80%)
  
  // Current status
  status: 'active' | 'paused' | 'limited';
  remainingRequests?: number;
  resetTime?: string;
}

// Polling Control
export interface PollingControl {
  isActive: boolean;
  activeProviders: string[];  // ['github', 'azureDevOps']
  
  // Scheduling
  schedule: {
    [provider: string]: {
      lastRun: string;
      nextRun: string;
      frequency: number; // seconds
      isRunning: boolean;
    };
  };
  
  // Statistics
  stats: {
    totalRequests: number;
    requestsToday: number;
    errorsToday: number;
    averageResponseTime: number;
    lastError?: string;
  };
}

// Configuration Management
export interface ConfigurationManager {
  // Server config
  getServerConfig(serverId: string): Promise<MCPServerConfig>;
  updateServerConfig(serverId: string, config: Partial<MCPServerConfig>): Promise<boolean>;
  validateConfig(config: Partial<MCPServerConfig>): Promise<ConfigValidationResult>;
  
  // Rate limiting
  getRateLimitStatus(serverId: string, provider: string): Promise<RateLimitStatus>;
  updateRateLimitConfig(serverId: string, provider: string, config: RateLimitConfig): Promise<boolean>;
  
  // Polling control
  startPolling(serverId: string, providers?: string[]): Promise<boolean>;
  pausePolling(serverId: string, providers?: string[]): Promise<boolean>;
  getPollingStatus(serverId: string): Promise<PollingControl>;
}

// Validation and Status
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface RateLimitStatus {
  provider: string;
  current: {
    requestsUsed: number;
    requestsRemaining: number;
    resetTime: string;
    percentage: number;
  };
  projected: {
    hourlyUsage: number;
    willExceedLimit: boolean;
    suggestedInterval?: number;
  };
}

// Events and Notifications
export interface ConfigurationEvent {
  type: 'config_updated' | 'rate_limit_warning' | 'polling_paused' | 'connection_lost';
  serverId: string;
  provider?: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
  data?: any;
}
