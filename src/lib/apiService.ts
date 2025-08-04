/**
 * 🚀 Kortex API Service Layer - Enhanced with Auth & Cache
 * Camada de abstração para integrações com MCP Servers e APIs externas
 * 
 * Esta camada centraliza toda a lógica de consumo de APIs, proporcionando:
 * - Interface unificada para diferentes provedores
 * - Gerenciamento de estado centralizado
 * - Cache inteligente com IndexedDB
 * - Autenticação integrada
 * - Retry logic
 * - Error handling padronizado
 * - Type safety completa
 */

import { MCPStatus } from '@/hooks/useMCPData';
import { APIProvider } from '../types/APITypes';
import { authService } from './authService';
import { cacheService } from './cacheService';

// ============================================================================
// INTERFACES BASE
// ============================================================================

export interface ServiceConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  headers?: Record<string, string>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  source?: string;
  cached?: boolean;
  retries?: number;
}

export interface ConnectionTestResult {
  connected: boolean;
  latency?: number;
  status?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// ABSTRACT BASE SERVICE
// ============================================================================

abstract class BaseAPIService {
  protected config: ServiceConfig;
  protected readonly CACHE_TTL = 30 * 1000; // 30 seconds
  protected providerId: string;

  constructor(config: ServiceConfig, providerId: string) {
    this.config = {
      timeout: 5000,
      retries: 3,
      cache: true,
      ...config,
    };
    this.providerId = providerId;
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ServiceResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const cacheKey = `${this.providerId}:${options.method || 'GET'}:${url}`;
    
    // Check cache first (IndexedDB)
    if (this.config.cache && options.method !== 'POST' && options.method !== 'PUT') {
      try {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            cached: true,
            timestamp: new Date().toISOString(),
            source: 'cache'
          };
        }
      } catch (error) {
        console.warn('Cache retrieval failed:', error);
      }
    }

    // Get authentication headers
    const authHeaders = await this.getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    };

    let lastError: Error | null = null;
    const retries = this.config.retries || 3;
    
    // Retry logic
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 5000);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: T = await response.json();

        // Store in cache (IndexedDB) for successful responses
        if (this.config.cache) {
          try {
            await cacheService.set(cacheKey, data, { 
              ttl: this.CACHE_TTL,
              encrypt: this.shouldEncryptCache()
            });
          } catch (error) {
            console.warn('Cache storage failed:', error);
          }
        }

        return {
          success: true,
          data,
          cached: false,
          timestamp: new Date().toISOString(),
          source: 'api'
        };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof Error && error.message.includes('401')) {
          break;
        }
        
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed',
      retries: retries,
      timestamp: new Date().toISOString(),
      source: 'api'
    };
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const credentials = await authService.getAPICredentials(this.providerId);
      if (!credentials) {
        return {};
      }

      return this.buildAuthHeaders(credentials);
    } catch (error) {
      console.warn('Failed to get auth headers:', error);
      return {};
    }
  }

  protected abstract buildAuthHeaders(credentials: any): Record<string, string>;
  
  protected shouldEncryptCache(): boolean {
    return true; // Default to encrypting cache data
  }

  abstract testConnection(): Promise<ConnectionTestResult>;
  abstract getStatus(): Promise<ServiceResponse<any>>;
}

// ============================================================================
// MCP SERVER SERVICE
// ============================================================================

export class MCPServerService extends BaseAPIService {
  constructor(config: ServiceConfig, providerId: string) {
    super(config, providerId);
  }

  protected buildAuthHeaders(credentials: any): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // MCP servers typically don't need authentication headers for basic endpoints
    // but may need tokens for GitHub/Azure integration
    if (credentials.githubToken) {
      headers['X-GitHub-Token'] = credentials.githubToken;
    }
    
    if (credentials.azureToken) {
      headers['X-Azure-Token'] = credentials.azureToken;
    }
    
    return headers;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/api/status');
      const latency = Date.now() - startTime;
      let version = 'unknown';
      if (response.data && typeof response.data === 'object' && 'version' in response.data) {
        version = (response.data as { version: string }).version;
      }

      return {
        connected: response.success,
        latency,
        status: response.success ? 'Connected' : 'Disconnected',
        error: response.error,
        metadata: {
          timestamp: new Date().toISOString(),
          version: version
        }
      };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        status: 'Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStatus(): Promise<ServiceResponse<MCPStatus>> {
    return this.makeRequest<MCPStatus>('/api/status');
  }

  async getRepos(query?: string): Promise<ServiceResponse<any[]>> {
    const endpoint = query ? `/api/repos?q=${encodeURIComponent(query)}` : '/api/repos';
    return this.makeRequest<any[]>(endpoint);
  }

  async getPullRequests(query?: string): Promise<ServiceResponse<any[]>> {
    const endpoint = query ? `/api/prs?q=${encodeURIComponent(query)}` : '/api/prs';
    return this.makeRequest<any[]>(endpoint);
  }

  async getPipelines(query?: string): Promise<ServiceResponse<any[]>> {
    const endpoint = query ? `/api/pipelines?q=${encodeURIComponent(query)}` : '/api/pipelines';
    return this.makeRequest<any[]>(endpoint);
  }

  async getMemory(query?: string): Promise<ServiceResponse<any[]>> {
    const endpoint = query ? `/api/memory?q=${encodeURIComponent(query)}` : '/api/memory';
    return this.makeRequest<any[]>(endpoint);
  }
}

// ============================================================================
// OPENAI SERVICE
// ============================================================================

export class OpenAIService extends BaseAPIService {
  constructor(config: ServiceConfig, providerId: string) {
    super(config, providerId);
  }

  protected buildAuthHeaders(credentials: any): Record<string, string> {
    return {
      'Authorization': `Bearer ${credentials.apiKey}`,
      'OpenAI-Organization': credentials.organization || ''
    };
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/api/models');
      const latency = Date.now() - startTime;
      let rData = response.data || {};
      let data = rData as { data: any[] } | any[];
      
      return {
        connected: response.success,
        latency,
        status: response.success ? 'Connected' : 'Disconnected',
        error: response.error,
        metadata: {
          modelsCount: data instanceof Array ? data.length : Object.keys(data).length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getStatus(): Promise<ServiceResponse<any>> {
    return this.makeRequest('/api/models');
  }
}

// ============================================================================
// ANTHROPIC SERVICE
// ============================================================================

export class AnthropicService extends BaseAPIService {
  constructor(config: ServiceConfig, providerId: string) {
    super(config, providerId);
  }

  protected buildAuthHeaders(credentials: any): Record<string, string> {
    return {
      'x-api-key': credentials.apiKey,
      'anthropic-version': '2023-06-01'
    };
  }

  async testConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Test with a minimal message request
      const response = await this.makeRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      
      const latency = Date.now() - startTime;
      
      return {
        connected: response.success,
        latency,
        status: response.success ? 'Connected' : 'Disconnected',
        error: response.error
      };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getStatus(): Promise<ServiceResponse<any>> {
    // Anthropic doesn't have a direct status endpoint, so we test with a minimal request
    return this.makeRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'status' }]
      })
    });
  }
}

// ============================================================================
// SERVICE FACTORY
// ============================================================================

export class APIServiceFactory {
  private static services = new Map<string, BaseAPIService>();

  static createService(provider: APIProvider): BaseAPIService {
    const key = `${provider.provider}-${provider.id}`;
    
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }

    let service: BaseAPIService;
    
    switch (provider.provider) {
      case 'StatusRafa MCP':
        service = new MCPServerService({
          baseURL: provider.mcpEndpoint || 'http://localhost:3001',
          timeout: 10000,
          cache: true
        }, provider.id);
        break;
        
      case 'OpenAI':
        service = new OpenAIService({
          baseURL: 'https://api.openai.com/v1',
          timeout: 30000,
          cache: true
        }, provider.id);
        break;
        
      case 'Anthropic':
        service = new AnthropicService({
          baseURL: 'https://api.anthropic.com/v1',
          timeout: 30000,
          cache: true
        }, provider.id);
        break;
        
      default:
        throw new Error(`Unsupported provider: ${provider.provider}`);
    }
    
    this.services.set(key, service);
    return service;
  }

  static clearCache(): void {
    this.services.clear();
  }
}

// ============================================================================
// UNIFIED API MANAGER
// ============================================================================

export class APIManager {
  private static instance: APIManager;
  private providers = new Map<string, APIProvider>();

  private constructor() {}

  static getInstance(): APIManager {
    if (!APIManager.instance) {
      APIManager.instance = new APIManager();
    }
    return APIManager.instance;
  }

  addProvider(provider: APIProvider): void {
    this.providers.set(provider.id, provider);
  }

  updateProvider(provider: APIProvider): void {
    if (this.providers.has(provider.id)) {
      this.providers.set(provider.id, provider);
    }
  }

  removeProvider(id: string): void {
    this.providers.delete(id);
    // Clear service cache for this provider
    APIServiceFactory.clearCache();
  }

  getProvider(id: string): APIProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): APIProvider[] {
    return Array.from(this.providers.values());
  }

  async testProvider(provider: APIProvider): Promise<ConnectionTestResult> {
    try {
      const service = APIServiceFactory.createService(provider);
      return await service.testConnection();
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Service creation failed'
      };
    }
  }

  async getMCPData(operation: 'repos' | 'prs' | 'pipelines' | 'memory', query?: string): Promise<ServiceResponse<any[]>> {
    // Find MCP provider
    const mcpProvider = Array.from(this.providers.values()).find(p => p.provider === 'StatusRafa MCP');
    
    if (!mcpProvider) {
      return {
        success: false,
        error: 'No MCP provider configured'
      };
    }

    try {
      const service = APIServiceFactory.createService(mcpProvider) as MCPServerService;
      
      switch (operation) {
        case 'repos':
          return await service.getRepos(query);
        case 'prs':
          return await service.getPullRequests(query);
        case 'pipelines':
          return await service.getPipelines(query);
        case 'memory':
          return await service.getMemory(query);
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MCP operation failed'
      };
    }
  }
}

// Singleton export
export const apiManager = APIManager.getInstance();
