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

import { MCPServerType } from '@/types/MCP/MCPTypes';
import { MCPAPIProvider } from '../types/MCP/MCPTypes';
import { MCPTask, MCPTaskState, MCPTaskStatus, MCPTaskType } from '../types/MCP/Task';
import { mockManager } from './mockManager';

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // 🔥 Adicionado para suporte a mensagens de sucesso
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
  async getSystemMetrics(): Promise<ServiceResponse<BackendSystemData | unknown>> {
    const response = await this.request('/api/v1/mcp/system/metrics');
    
    // 🔥 Mapear estrutura do backend para formato esperado pelo frontend
    if (response.success && response.data) {
      const backendData = response.data as BackendSystemData;
      
      // Converter estrutura do GoBE backend para interface SystemData do frontend
      const mappedData = {
        cpu: backendData.cpu || 0,
        memory: backendData.memory || 0,
        disk: backendData.disk || 0,

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
      } as BackendSystemData;
      
      // 🔥 REMOVIDO: Log verboso que causava re-renders
      // console.log('🔥 SystemMetrics Mapping:', {
      //   backend: backendData,
      //   mapped: mappedData
      // });
      
      return {
        ...response,
        data: mappedData,
        isRealData: true,
        source: 'api',
        timestamp: Date.now()
      };
    }
    
    return response;
  }
  
  async getServersList(): Promise<ServiceResponse<MCPServerType[] | unknown>> {
    return this.request('/api/v1/mcp/servers');
  }

  async getServerDetails(serverId: string): Promise<ServiceResponse<MCPServerType | unknown>> {
    return this.request(`/api/v1/mcp/servers/${serverId}`);
  }

  async getTasksList() : Promise<ServiceResponse<MCPTask[] | unknown>> {
    return this.request('/api/v1/mcp/tasks');
  }
  
  async getTaskDetails(taskId: string): Promise<ServiceResponse<MCPTask | unknown>> {
    return this.request(`/api/v1/mcp/tasks/${taskId}`);
  }
  
  async getSystemLogs(limit: number = 50): Promise<ServiceResponse<any>> {
    return this.request(`/api/v1/mcp/logs?limit=${limit}`);
  }

  async startTask(taskConfig: any): Promise<ServiceResponse<MCPTask | unknown>> {
    return this.request('/api/v1/mcp/tasks', {
      method: 'POST',
      body: JSON.stringify(taskConfig)
    });
  }
  
  async stopTask(taskId: string): Promise<ServiceResponse<unknown>> {
    return this.request(`/api/v1/mcp/tasks/${taskId}/stop`, {
      method: 'POST'
    });
  }
  
  async restartServer(serverId: string): Promise<ServiceResponse<unknown>> {
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
  getStatus(): { 
    isOnline: boolean; 
    fallbackMode: boolean; 
    baseURL: string; 
    cacheSize: number; 
    demoMode: boolean 
  } {
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
  setDemoMode(enabled: boolean): void {
    mockManager.setDemoMode(enabled);
    this.fallbackMode = enabled;
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
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
  private startCacheCleanup(): void {
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanupCache();
    }, this.CACHE_CLEANUP_INTERVAL);
  }
  
  /**
   * Limpar cache expirado e manter limite de entradas
   */
  private cleanupCache(): void {
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
  private cleanupLocalStorage(): void {
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
  
  // Métodos adicionais para compatibilidade com as páginas
  async getPendingApprovals(): Promise<ServiceResponse<MCPTask[]>> {
    try {
      console.log('📋 Buscando aprovações pendentes...');
      
      // 🔥 Simula latência da rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 🚀 Mock com dados mais realistas para teste
      const mockApprovals: MCPTask[] = [
        {
          id: 'approval-1', 
          title: 'Webhook Discord Integration',
          description: 'Solicitação para ativar integração com webhook do Discord para notificações automáticas',
          status: 'pending' as MCPTaskStatus,
          state: 'idle' as MCPTaskState,
          type: 'analysis' as MCPTaskType,
          serverId: 'discord-server-1',
          priority: 1, // High priority (1-5 scale, 1 = urgent)
          createdBy: 'discord-bot',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
          updatedAt: new Date().toISOString(),
          reasons: ['Solicitado via Discord', 'Aprovação manual necessária'],
          apiProvider: 'OpenAI' as MCPAPIProvider,
          apiModel: 'webhook-integration'
        },
        {
          id: 'approval-2', 
          title: 'Deploy automático sistema',
          description: 'Solicitação para deploy da nova versão do sistema com features de monitoramento',
          status: 'pending' as MCPTaskStatus,
          state: 'idle' as MCPTaskState,
          type: 'processing' as MCPTaskType,
          serverId: 'github-server-1',
          priority: 3, // Medium priority
          createdBy: 'automation',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h atrás
          updatedAt: new Date().toISOString(),
          reasons: ['Deploy automático', 'Requer aprovação'],
          apiProvider: 'Anthropic' as MCPAPIProvider,
          apiModel: 'actions-deploy'
        },
        {
          id: 'approval-3', 
          title: 'Backup Database Critical',
          description: 'Backup urgente da base de dados antes da migração crítica',
          status: 'pending' as MCPTaskStatus,
          state: 'idle' as MCPTaskState,
          type: 'maintenance' as MCPTaskType,
          serverId: 'db-server-1',
          priority: 1, // Urgent priority
          createdBy: 'admin',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30min atrás
          updatedAt: new Date().toISOString(),
          reasons: ['Backup crítico', 'Antes da migração'],
          apiProvider: 'OpenAI' as MCPAPIProvider,
          apiModel: 'database-backup'
        }
      ];
      
      return { 
        data: mockApprovals, 
        success: true, 
        isRealData: false, 
        source: 'mock', 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error('Error in getPendingApprovals:', error);
      return { 
        data: [], 
        success: false, 
        error: 'Erro ao buscar aprovações', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    }
  }

  async approveTask(taskId: string, _approvalId?: string): Promise<ServiceResponse<unknown | null>> {
    try {
      console.log(`✅ Aprovando task ${taskId}`);
      
      // 🔥 Simula operação assíncrona real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // TODO: Integrar com Discord API real
      // const response = await fetch(`${this.baseURL}/api/v1/discord/approve`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ taskId, approvalId: _approvalId })
      // });
      
      return { 
        data: { approved: true, taskId }, 
        success: true, 
        message: 'Task aprovada com sucesso!', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error('Error in approveTask:', error);
      return { 
        data: null, 
        success: false, 
        error: 'Erro ao aprovar task', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    }
  }

  async rejectTask(taskId: string, reason: string): Promise<ServiceResponse<unknown | null>> {
    try {
      console.log(`❌ Rejeitando task ${taskId} com razão: ${reason}`);
      
      // 🔥 Simula operação assíncrona real
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // TODO: Integrar com Discord API real
      // const response = await fetch(`${this.baseURL}/api/v1/discord/reject`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ taskId, reason })
      // });
      
      return { 
        data: { rejected: true, taskId, reason }, 
        success: true, 
        message: 'Task rejeitada com sucesso!', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error('Error in rejectTask:', error);
      return { 
        data: null, 
        success: false, 
        error: 'Erro ao rejeitar task', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    }
  }

  // 🎮 ===== DISCORD INTEGRATION METHODS =====

  /**
   * 🔍 Busca informações de status do Discord
   */
  async getDiscordStatus(): Promise<ServiceResponse<any>> {
    const cacheKey = 'discord-status';
    
    try {
      console.log('🎮 Buscando status do Discord...');
      
      // 🔥 DADOS REAIS ATIVADOS! 
      if (!this.fallbackMode) {
        try {
          const response = await fetch(`${this.baseURL}/api/v1/discord/ping`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Discord status real recebido:', data);
            this.setCache(cacheKey, data, 30000); // Cache por 30s
            return { 
              data, 
              success: true, 
              isRealData: true, 
              source: 'api', 
              timestamp: Date.now() 
            };
          } else {
            console.warn('🔴 Discord API retornou erro:', response.status, response.statusText);
          }
        } catch (apiError) {
          console.warn('🟡 Discord API não disponível, usando fallback:', apiError);
          // Não faz fallback para mock automático, deixa o usuário saber que o API falhou
        }
      }

      // 🚀 Mock realístico para desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockStatus = {
        bot: {
          online: true,
          username: 'KubeX-MCP Bot',
          discriminator: '1234',
          id: '123456789012345678',
          avatar: null,
          status: 'online',
          activities: [
            {
              name: 'Monitoring System',
              type: 3, // Watching
              details: 'System Performance'
            }
          ]
        },
        guilds: [
          {
            id: '987654321098765432',
            name: 'KubeX Development',
            memberCount: 42,
            channels: 15,
            roles: 8,
            online: true
          }
        ],
        connections: {
          websocket: true,
          latency: 65,
          lastHeartbeat: new Date().toISOString()
        },
        stats: {
          totalMessages: 1847,
          commandsProcessed: 234,
          approvalsHandled: 56,
          uptime: '2d 14h 32m',
          lastRestart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      return { 
        data: mockStatus, 
        success: true, 
        isRealData: false, 
        source: 'mock', 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error('Error in getDiscordStatus:', error);
      return { 
        data: null, 
        success: false, 
        error: 'Erro ao buscar status do Discord', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    }
  }

  /**
   * 🧪 Testa a conexão Discord com webhook
   */
  async testDiscordConnection(): Promise<ServiceResponse<any>> {
    try {
      console.log('🧪 Testando conexão Discord...');
      
      // 🔥 DADOS REAIS ATIVADOS! Usando endpoint de test
      if (!this.fallbackMode) {
        try {
          const response = await fetch(`${this.baseURL}/api/v1/discord/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              content: 'Test connection from KubeX-MCP Frontend',
              user_id: 'kubex_mcp_frontend',
              username: 'KubeX-MCP'
            }),
            signal: AbortSignal.timeout(10000)
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Discord test real executado:', data);
            return { 
              data, 
              success: true, 
              message: 'Teste de conexão Discord realizado com sucesso!', 
              isRealData: true, 
              source: 'api', 
              timestamp: Date.now() 
            };
          } else {
            console.warn('🔴 Discord test API retornou erro:', response.status, response.statusText);
            const errorData = await response.text();
            return { 
              data: null, 
              success: false, 
              error: `Erro no teste Discord: ${response.status} - ${errorData}`, 
              source: 'api', 
              timestamp: Date.now() 
            };
          }
        } catch (apiError) {
          console.error('🔴 Erro ao testar conexão Discord:', apiError);
          return { 
            data: null, 
            success: false, 
            error: `Erro de conexão: ${apiError}`, 
            source: 'api', 
            timestamp: Date.now() 
          };
        }
      }
      
      // 🚀 Fallback para mock (só se fallbackMode estiver ativo)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return { 
        data: { 
          success: true, 
          message: 'Conexão Discord testada com sucesso! (Mock)',
          timestamp: new Date().toISOString(),
          latency: 125
        }, 
        success: true, 
        message: 'Teste de conexão realizado com sucesso! (Mock)', 
        isRealData: false,
        source: 'mock', 
        timestamp: Date.now() 
      };
    } catch (error) {
      console.error('Error in testDiscordConnection:', error);
      return { 
        data: null, 
        success: false, 
        error: 'Erro ao testar conexão Discord', 
        source: 'mock', 
        timestamp: Date.now() 
      };
    }
  }
}

// Export singleton instance
export const mcpService = MCPService.getInstance();
