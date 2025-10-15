import ResilientMCPService from './resilientMcpService';

function defaultGatewayBaseUrl() {
  // if (process.env.VITE_GATEWAY_SERVER_URL && process.env.VITE_GATEWAY_SERVER_URL.trim().length > 0) {
  //   return process.env.VITE_GATEWAY_SERVER_URL;
  // }

  return '/api/v1/gateway';
}

export const resilientGatewayService = new ResilientMCPService(defaultGatewayBaseUrl());

export default resilientGatewayService;

/**
 * Serviço Resiliente para Gateway
 * Gerencia chamadas para o Gateway com cache, retries e fallback
 */
export class ResilientGatewayService {
  private baseUrl: string;
  private isOnline: boolean = true;
  private fallbackMode: boolean = false;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private retryCount: Map<string, number> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 2000; // 2 segundos
  private readonly CACHE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.checkOnlineStatus();
    // Verifica o status online a cada minuto
    setInterval(() => this.checkOnlineStatus(), 60 * 1000);
  }

  /**
   * Verifica se o Gateway está online
   */
  private async checkOnlineStatus(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, { method: 'GET' });
      this.isOnline = response.ok;
      this.fallbackMode = !this.isOnline;
    } catch {
      this.isOnline = false;
      this.fallbackMode = true;
    }
  }

  /**
   * Faz uma chamada ao Gateway com resiliência
   */
  async callGateway(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: any; error?: string; timestamp: number }> {
    const url = `${this.baseUrl}${endpoint}`;

    // 1. Verifica cache_entries
    const cached = this.cache.get(url);
    if (cached) {
      // Se a entrada de cache for válida, retorna os dados em cache
      if (Date.now() - cached.timestamp < this.CACHE_TIMEOUT_MS) {
        return { success: true, data: cached.data, timestamp: cached.timestamp };
      }
      // Se a entrada de cache estiver expirada, remove-a
      this.cache.delete(url);
    }
    // 2. Se estiver em modo fallback, retorna errors
    if (this.fallbackMode) {
      return { success: false, error: 'Gateway offline', timestamp: Date.now() };
    }
    // 3. Tenta fazer a chamada real
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Salva no cache
      this.cache.set(url, { data, timestamp: Date.now() });
      // Reseta contagem de retries
      this.retryCount.delete(url);
      return { success: true, data, timestamp: Date.now() };
    } catch (error) {
      // Incrementa contagem de retries
      const retries = this.retryCount.get(url) || 0;
      if (retries < this.MAX_RETRIES) {
        this.retryCount.set(url, retries + 1);
        // Aguarda antes de tentar novamente
        await new Promise(res => setTimeout(res, this.RETRY_DELAY_MS));
        return this.callGateway(endpoint, options);
      } else {
        // Após exceder retries, entra em modo fallback
        this.fallbackMode = true;
        return { success: false, error: (error as Error).message, timestamp: Date.now() };
      }
    }
  }

  /**
   * Obtém dados do cache se válidos
   */
  private getCachedData(cacheKey: string, timeout: number): any | null {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < timeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Lida com falhas de requests
   */
  private handleFailure<T>(cacheKey: string, config: FallbackConfig, error: Error): ServiceResponse<T> {
    // Se houver dados em cache, retorna-os
    const cached = this.getCachedData(cacheKey, config.cacheTimeout);
    if (cached) {
      return {
        success: true,
        data: cached,
        isFromCache: true,
        timestamp: Date.now()
      };
    }

    // Se não houver dados em cache, entra em modo fallback
    this.fallbackMode = true;
    this.isOnline = false;
    console.warn('🔴 Entering fallback mode due to repeated failures.');

    return {
      success: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isFromCache?: boolean;
  timestamp: number;
}

interface FallbackConfig {
  useCache: boolean;
  cacheTimeout: number; // in milliseconds
}


