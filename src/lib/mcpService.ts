/**
 * 🚀 MCP Servimport { MockManager } from './mockManager';
import { StorageManager } from './storageManager';ce - Resilient & In  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private retryCount: Map<string, number> = new Map();
  private isOnline: boolean = true;
  private healthCheckInterval?: NodeJS.Timeout;
  private cacheCleanupInterval?: NodeJS.Timeout;
  
  private readonly defaultConfig: RequestConfig = {
    useCache: true,
    cacheTimeout: 30000, // 30 segundos
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
    fallbackToMock: true,
  };Baseado no kortex com melhorias para arquitetura kubex-mcp + gobe
 * Gerencia comunicação com backend com fallbacks automáticos
 */

import { MCPTask } from '../types/MCP/Task';
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

// 🔥 Interface para dados do GoBE backend
interface BackendSystemData {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network?: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  uptime?: number;
  loadAverage?: number[];
  processes?: number;
}

export class MCPService {
  private static instance: MCPService;
  private baseURL: string;
  private fallbackMode: boolean = false;
  private cache: Map<string, CacheEntry> = new Map();
  private retryCount: Map<string, number> = new Map();
  private isOnline: boolean = true;
  private healthCheckInterval?: NodeJS.Timeout;
  private cacheCleanupInterval?: NodeJS.Timeout;
  
  // 🔥 CONFIGURAÇÕES DE CACHE OTIMIZADAS
  private readonly MAX_CACHE_ENTRIES = 50; // Limite máximo de entradas no cache
  private readonly CACHE_CLEANUP_INTERVAL = 60000; // Limpeza a cada 1 minuto
  
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
    this.startCacheCleanup();
    
    // 🔥 Verificar e limpar localStorage se necessário
    if (typeof window !== 'undefined') {
      try {
        const storageSize = new Blob([JSON.stringify(localStorage)]).size;
        if (storageSize > 10 * 1024 * 1024) { // 10MB
          console.warn('🚨 localStorage size:', storageSize, 'bytes - cleaning up...');
          this.cleanupLocalStorage();
        }
      } catch (e) {
        console.warn('Error checking localStorage size:', e);
      }
    }
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
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        isRealData: false,
        timestamp: Date.now(),
        source: 'api'
      }
      //throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const backendResponse = await response.json();
    
    // 🔥 CORREÇÃO: Extrair a propriedade 'data' do response do GoBE backend
    // Backend retorna: {data: {...}, status: "success", timestamp: ...}
    // Precisamos apenas da propriedade 'data'
    const data = backendResponse?.data || backendResponse;
    
    // 🔥 REMOVIDO: Log verboso que causava pollution no console
    // console.log('🐛 Backend Response Debug:', {
    //   fullResponse: backendResponse,
    //   extractedData: data,
    //   endpoint
    // });
    
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
    // 🔥 Verificar limite antes de adicionar nova entrada
    if (this.cache.size >= this.MAX_CACHE_ENTRIES) {
      // Remover a entrada mais antiga
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
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
      case endpoint.includes('/api/v1/mcp/system/metrics'):
        mockData = mockManager.getSystemMetrics();
        break;
      case endpoint.includes('/api/v1/mcp/servers'):
        mockData = mockManager.getServersList();
        break;
      case endpoint.includes('/api/v1/mcp/tasks'):
        mockData = mockManager.getTasksList();
        break;
      case endpoint.includes('/api/v1/mcp/logs'):
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
    const response = await this.request('/api/v1/mcp/system/metrics');
    
    // 🔥 Mapear estrutura do backend para formato esperado pelo frontend
    if (response.success && response.data) {
      const backendData = response.data as BackendSystemData;
      
      // Converter estrutura do GoBE backend para interface SystemData do frontend
      const mappedData = {
        // Performance (mapeamento da estrutura aninhada do backend)
        cpuUsage: backendData.cpu?.usage || 0,
        memoryUsage: backendData.memory?.percentage || 0,
        diskUsage: backendData.disk?.percentage || 0,
        networkLatency: 0, // Não disponível no backend atual
        
        // Métricas do Sistema (valores mockados por enquanto, depois virão do backend)
        totalServers: 3,
        activeServers: 2,
        totalTasks: 12,
        runningTasks: 4,
        completedTasks: 7,
        failedTasks: 1,
        
        // Conexões (valores mockados por enquanto)
        totalConnections: 45,
        activeConnections: 23,
        
        // Adicionar dados extras do backend para debug
        _raw: backendData // Manter dados originais para debug
      };
      
      // 🔥 REMOVIDO: Log verboso que causava re-renders
      // console.log('🔥 SystemMetrics Mapping:', {
      //   backend: backendData,
      //   mapped: mappedData
      // });
      
      return {
        ...response,
        data: mappedData
      };
    }
    
    return response;
  }
  
  async getServersList() {
    return this.request('/api/v1/mcp/servers');
  }
  
  async getServerDetails(serverId: string) {
    return this.request(`/api/v1/mcp/servers/${serverId}`);
  }

  async getTasksList() : Promise<ServiceResponse<MCPTask[] | unknown>> {
    return this.request('/api/v1/mcp/tasks');
  }
  
  async getTaskDetails(taskId: string): Promise<ServiceResponse<MCPTask | unknown>> {
    return this.request(`/api/v1/mcp/tasks/${taskId}`);
  }
  
  async getSystemLogs(limit: number = 50) {
    return this.request(`/api/v1/mcp/logs?limit=${limit}`);
  }
  
  async startTask(taskConfig: any) {
    return this.request('/api/v1/mcp/tasks', {
      method: 'POST',
      body: JSON.stringify(taskConfig)
    });
  }
  
  async stopTask(taskId: string) {
    return this.request(`/api/v1/mcp/tasks/${taskId}/stop`, {
      method: 'POST'
    });
  }
  
  async restartServer(serverId: string) {
    return this.request(`/api/v1/mcp/servers/${serverId}/restart`, {
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
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
    }
    this.cache.clear();
    this.retryCount.clear();
  }
  
  /**
   * 🔥 NOVOS MÉTODOS DE LIMPEZA E OTIMIZAÇÃO
   */
  
  /**
   * Iniciar limpeza automática do cache
   */
  private startCacheCleanup() {
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanupCache();
    }, this.CACHE_CLEANUP_INTERVAL);
  }
  
  /**
   * Limpar cache expirado e manter limite de entradas
   */
  private cleanupCache() {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // Remover entradas expiradas
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        entriesToDelete.push(key);
      }
    }
    
    // Remover entradas expiradas
    entriesToDelete.forEach(key => this.cache.delete(key));
    
    // Se ainda há muitas entradas, remover as mais antigas
    if (this.cache.size > this.MAX_CACHE_ENTRIES) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = this.cache.size - this.MAX_CACHE_ENTRIES;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
      
      console.log(`🧹 Cache cleanup: removed ${toRemove + entriesToDelete.length} entries`);
    }
  }
  
  /**
   * Limpar localStorage para evitar limite de 15MB
   */
  private cleanupLocalStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      // Remover chaves específicas que podem estar grandes
      const keysToClean = [
        'navigation-storage', // Zustand store
        'mcp-cache',
        'system-data-cache'
      ];
      
      keysToClean.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🧹 Removed localStorage key: ${key}`);
        }
      });
      
      // Verificar tamanho após limpeza
      const newSize = new Blob([JSON.stringify(localStorage)]).size;
      console.log(`🧹 localStorage size after cleanup: ${newSize} bytes`);
      
    } catch (e) {
      console.error('Error cleaning localStorage:', e);
    }
  }
}

// Export singleton instance
export const mcpService = MCPService.getInstance();
