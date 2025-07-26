/**
 * Resilient MCP Service v1.0
 * Service layer defensivo que funciona com ou sem MCP Server
 * Implementa fallbacks inteligentes e retry logic
 */

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isFromCache?: boolean;
  isFromFallback?: boolean;
  timestamp: number;
}

interface FallbackConfig {
  useCache: boolean;
  cacheTimeout: number; // em ms
  maxRetries: number;
  retryDelay: number;
  fallbackData: any;
}

class ResilientMCPService {
  private baseURL: string;
  private fallbackMode: boolean = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private retryCount: Map<string, number> = new Map();
  private isOnline: boolean = true;
  
  constructor(baseURL: string = '/api/mcp') {
    this.baseURL = baseURL;
    this.checkOnlineStatus();
  }

  /**
   * Detecção automática de conectividade
   */
  private async checkOnlineStatus(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000
      } as RequestInit);
      
      this.isOnline = response.ok;
      this.fallbackMode = !this.isOnline;
    } catch (error) {
      this.isOnline = false;
      this.fallbackMode = true;
      console.warn('🔴 MCP Service offline, switching to fallback mode');
    }
  }

  /**
   * Request resiliente com fallbacks automáticos
   */
  async safeRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}, 
    config: Partial<FallbackConfig> = {}
  ): Promise<ServiceResponse<T>> {
    const finalConfig: FallbackConfig = {
      useCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutos
      maxRetries: 3,
      retryDelay: 1000,
      fallbackData: null,
      ...config
    };

    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // 1. Verificar cache primeiro (se offline)
    if (this.fallbackMode && finalConfig.useCache) {
      const cached = this.getCachedData(cacheKey, finalConfig.cacheTimeout);
      if (cached) {
        return {
          success: true,
          data: cached,
          isFromCache: true,
          timestamp: Date.now()
        };
      }
    }

    // 2. Tentar request real
    try {
      const response = await this.attemptRequest(endpoint, options, finalConfig);

      if (!response.success || !JSON.stringify(response.data || {}).includes('<!DOCTYPE ')) {
        throw new Error(`Unsupported content type: ${response.data}`);
      }
      
      // Cache successful response
      if (response.success && finalConfig.useCache) {
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        }); 
      }

      // Reset fallback mode on success
      if (this.fallbackMode && response.success) {
        this.fallbackMode = false;
        this.isOnline = true;
        console.info('✅ MCP Service back online');
      }

      return response as ServiceResponse<T>;
    } catch (error) {
      console.warn(`🔴 Request failed for ${endpoint}:`, error);
      
      // 3. Fallback strategy
      return this.handleFailure(cacheKey, finalConfig, error as Error);
    }
  }

  /**
   * Tentativa de request com retry logic
   */
  private async attemptRequest<T>(
    endpoint: string,
    options: RequestInit,
    config: FallbackConfig
  ): Promise<ServiceResponse<T>> {
    const retryKey = endpoint;
    const currentRetries = this.retryCount.get(retryKey) || 0;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        timeout: 10000
      } as RequestInit);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && !contentType.includes('application/json')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }
      if ((await response.text()).includes('<!DOCTYPE ')) {
        throw new Error(`Invalid JSON response: ${await response.text()}`);
      }

      const data = await response.json();
      
      // Reset retry count on success
      this.retryCount.delete(retryKey);
      
      return {
        success: true,
        data: data as T,
        timestamp: Date.now()
      };
    } catch (error) {
      if (currentRetries < config.maxRetries) {
        // Increment retry count
        this.retryCount.set(retryKey, currentRetries + 1);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, config.retryDelay * (currentRetries + 1)));
        
        // Recursive retry
        return this.attemptRequest(endpoint, options, config);
      }
      
      throw error;
    }
  }

  /**
   * Estratégia de fallback quando tudo falha
   */
  private handleFailure<T>(
    cacheKey: string,
    config: FallbackConfig,
    error: Error
  ): ServiceResponse<T> {
    // Enter fallback mode
    this.fallbackMode = true;
    this.isOnline = false;

    // 1. Try cache (even if expired)
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.warn('📦 Using cached data (potentially stale)');
      return {
        success: true,
        data: cached.data,
        isFromCache: true,
        timestamp: cached.timestamp
      };
    }

    // 2. Use provided fallback data
    if (config.fallbackData) {
      console.warn('🔄 Using fallback data');
      return {
        success: true,
        data: config.fallbackData,
        isFromFallback: true,
        timestamp: Date.now()
      };
    }

    // 3. Return error
    return {
      success: false,
      error: error.message,
      timestamp: Date.now()
    };
  }

  /**
   * Recuperar dados do cache (se válidos)
   */
  private getCachedData(key: string, timeout: number): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = (Date.now() - cached.timestamp) > timeout;
    return isExpired ? null : cached.data;
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
    this.retryCount.clear();
  }

  /**
   * Status do serviço
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      fallbackMode: this.fallbackMode,
      cacheSize: this.cache.size,
      activeRetries: this.retryCount.size
    };
  }

  /**
   * Force reconnection attempt
   */
  async reconnect(): Promise<boolean> {
    await this.checkOnlineStatus();
    return this.isOnline;
  }
}

// Singleton instance for the application
// Using localhost:3001 for our mock API server during development
export const resilientMCPService = new ResilientMCPService('http://localhost:3001');

// Fallback data for different endpoints
export const FALLBACK_DATA = {
  servers: [
    { 
      id: 'demo-1', 
      name: 'Demo Server', 
      status: 'Online',
      hostname: 'demo.local',
      config: {
        place: 'demo',
        connectionType: 'Demo',
        connectionConfig: {
          id: 'demo-1',
          type: 'Demo',
          baseURL: 'demo://localhost',
          wsUrl: null,
          apiKey: null,
          enableWebSocket: false
        }
      },
      lastUpdated: new Date(),
      tasks: [],
      logs: []
    }
  ],
  
  stats: {
    totalServers: 1,
    activeServers: 1,
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageResponseTime: 0,
    uptime: 100,
    lastUpdate: new Date().toISOString()
  },

  repositories: [
    { id: 'demo-repo', name: 'Demo Repository', url: 'https://demo.local/repo' }
  ],

  pullRequests: [
    { 
      id: 'demo-pr', 
      title: 'Demo Pull Request', 
      status: 'open',
      author: 'Demo User',
      createdAt: new Date().toISOString()
    }
  ]
};

export default ResilientMCPService;
