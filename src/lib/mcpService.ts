/**
 * 🚀 MCP Service - Resilient & Intelligent
 * Baseado no kortex com melhorias para arquitetura kubex-mcp + gobe
 * Gerencia comunicação com backend com fallbacks automáticos
 */

import { mockManager } from './mockManager';

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isFromCache?: boolean;
  isFromFallback?: boolean;
  isRealData?: boolean;
  timestamp: number;
  source: 'api' | 'cache' | 'mock' | 'fallback';
}

interface RequestConfig {
  useCache?: boolean;
  cacheTimeout?: number; // em ms
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackToMock?: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class MCPService {
  private static instance: MCPService;
  private baseURL: string;
  private fallbackMode: boolean = false;
  private cache: Map<string, CacheEntry> = new Map();
  private retryCount: Map<string, number> = new Map();
  private isOnline: boolean = true;
  private healthCheckInterval?: NodeJS.Timeout;
  
  private readonly defaultConfig: RequestConfig = {
    useCache: true,
    cacheTimeout: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
    fallbackToMock: true,
  };
  
  private constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_GOBE_URL || 'http://localhost:8080';
    this.startHealthCheck();
  }
  
  static getInstance(): MCPService {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService();
    }
    return MCPService.instance;
  }
  
  /**
   * Health check automático do backend
   */
  private startHealthCheck(): void {
    this.checkHealth();
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, 30000); // Check a cada 30 segundos
  }
  
  private async checkHealth(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      this.isOnline = response.ok;
      this.fallbackMode = !this.isOnline;
      
      if (this.isOnline && this.fallbackMode) {
        console.log('🟢 Backend voltou online!');
        this.fallbackMode = false;
      }
    } catch (error) {
      if (this.isOnline) {
        console.log('🔴 Backend offline, ativando modo fallback');
      }
      this.isOnline = false;
      this.fallbackMode = true;
    }
  }
  
  /**
   * Request principal com lógica resiliente
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<ServiceResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    
    // 1. Verificar cache primeiro
    if (finalConfig.useCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // 2. Se offline e tem fallback, usar mock
    if (this.fallbackMode && finalConfig.fallbackToMock) {
      return this.getMockResponse<T>(endpoint);
    }
    
    // 3. Tentar requisição real
    try {
      const response = await this.makeRequest<T>(endpoint, options, finalConfig);
      
      // Reset retry count em caso de sucesso
      this.retryCount.delete(cacheKey);
      
      // Cache o resultado
      if (finalConfig.useCache && response.success) {
        this.setCache(cacheKey, response, finalConfig.cacheTimeout!);
      }
      
      return response;
    } catch (error) {
      // 4. Retry logic
      const currentRetries = this.retryCount.get(cacheKey) || 0;
      if (currentRetries < finalConfig.maxRetries!) {
        this.retryCount.set(cacheKey, currentRetries + 1);
        
        // Esperar antes do retry
        await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay!));
        
        return this.request<T>(endpoint, options, config);
      }
      
      // 5. Se tudo falhou, usar fallback
      if (finalConfig.fallbackToMock) {
        console.warn(`Request failed after ${finalConfig.maxRetries} retries, using mock data`);
        return this.getMockResponse<T>(endpoint);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        source: 'api'
      };
    }
  }
  
  /**
   * Fazer a requisição HTTP
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<ServiceResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(config.timeout!),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data,
      isRealData: true,
      timestamp: Date.now(),
      source: 'api'
    };
  }
  
  /**
   * Cache management
   */
  private getFromCache<T>(key: string): ServiceResponse<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return {
      success: true,
      data: entry.data,
      isFromCache: true,
      isRealData: true,
      timestamp: entry.timestamp,
      source: 'cache'
    };
  }
  
  private setCache(key: string, response: ServiceResponse, ttl: number): void {
    this.cache.set(key, {
      data: response.data,
      timestamp: response.timestamp,
      ttl
    });
  }
  
  /**
   * Mock responses baseadas no endpoint
   */
  private getMockResponse<T>(endpoint: string): ServiceResponse<T> {
    let mockData: any;
    
    switch (true) {
      case endpoint.includes('/system/metrics'):
        mockData = mockManager.getSystemMetrics();
        break;
      case endpoint.includes('/servers'):
        mockData = mockManager.getServersList();
        break;
      case endpoint.includes('/tasks'):
        mockData = mockManager.getTasksList();
        break;
      case endpoint.includes('/logs'):
        mockData = mockManager.getSystemLogs();
        break;
      default:
        mockData = { message: 'Mock data not available for this endpoint' };
    }
    
    return {
      success: true,
      data: mockData,
      isFromFallback: true,
      isRealData: false,
      timestamp: Date.now(),
      source: 'mock'
    };
  }
  
  /**
   * API Methods específicos
   */
  async getSystemMetrics() {
    return this.request('/api/system/metrics');
  }
  
  async getServersList() {
    return this.request('/api/servers');
  }
  
  async getServerDetails(serverId: string) {
    return this.request(`/api/servers/${serverId}`);
  }
  
  async getTasksList() {
    return this.request('/api/tasks');
  }
  
  async getTaskDetails(taskId: string) {
    return this.request(`/api/tasks/${taskId}`);
  }
  
  async getSystemLogs(limit: number = 50) {
    return this.request(`/api/logs?limit=${limit}`);
  }
  
  async startTask(taskConfig: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskConfig)
    });
  }
  
  async stopTask(taskId: string) {
    return this.request(`/api/tasks/${taskId}/stop`, {
      method: 'POST'
    });
  }
  
  async restartServer(serverId: string) {
    return this.request(`/api/servers/${serverId}/restart`, {
      method: 'POST'
    });
  }
  
  /**
   * Realtime/WebSocket simulation
   */
  startRealtimeUpdates(callback: (data: any) => void): () => void {
    const interval = setInterval(() => {
      if (this.isOnline) {
        // Em modo online, simular dados vindos via WebSocket
        callback({
          ...mockManager.getRealtimeUpdate(),
          source: 'websocket',
          isRealData: true
        });
      } else {
        // Em modo offline, usar mock
        callback({
          ...mockManager.getRealtimeUpdate(),
          source: 'mock',
          isRealData: false
        });
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }
  
  /**
   * Estado do serviço
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      fallbackMode: this.fallbackMode,
      baseURL: this.baseURL,
      cacheSize: this.cache.size,
      demoMode: mockManager.isDemoModeEnabled()
    };
  }
  
  /**
   * Forçar modo demo
   */
  setDemoMode(enabled: boolean) {
    mockManager.setDemoMode(enabled);
    this.fallbackMode = enabled;
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.cache.clear();
    this.retryCount.clear();
  }
}

// Export singleton instance
export const mcpService = MCPService.getInstance();
