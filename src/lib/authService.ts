/**
 * 🔐 AuthService - Sistema de Autenticação Unificado
 * Gerencia autenticação da aplicação e tokens de API providers
 */

import CacheService, {cacheService} from "./cacheService";

export interface AuthToken {
  token: string;
  expiresAt: Date;
  refreshToken?: string;
  scope?: string[];
  metadata?: Record<string, any>;
}

export interface UserSession {
  userId: string;
  username: string;
  email?: string;
  roles: string[];
  permissions: string[];
  sessionToken: string;
  expiresAt: Date;
  lastActivity: Date;
}

export interface APICredentials {
  providerId: string;
  providerType: 'OpenAI' | 'Anthropic' | 'Azure' | 'StatusRafa MCP' | 'Custom';
  apiKey?: string;
  authToken?: AuthToken;
  endpoint?: string;
  additionalParams?: Record<string, any>;
  // MCP specific
  githubToken?: string;
  azureToken?: string;
  azureOrg?: string;
  azureProject?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentSession: UserSession | null = null;
  private apiCredentials: Map<string, APICredentials> = new Map();
  private readonly SESSION_KEY = 'kortex_user_session';
  private readonly API_CREDS_KEY = 'kortex_api_credentials';

  private constructor() {
    this.initializeFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 🚀 Frontend Authentication
   */
  async login(username: string, password: string): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      // TODO: Implementar chamada real para API de autenticação
      // Por enquanto, mock authentication
      if (username === 'admin' && password === 'admin') {
        const session: UserSession = {
          userId: '1',
          username,
          email: 'admin@kortex.dev',
          roles: ['admin'],
          permissions: ['*'],
          sessionToken: this.generateSessionToken(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          lastActivity: new Date()
        };

        this.currentSession = session;
        await this.saveSessionToStorage(session);
        
        return { success: true, session };
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    } catch (error) {
      return { success: false, error: 'Erro interno de autenticação' };
    }
  }

  async logout(): Promise<void> {
    this.currentSession = null;
    await cacheService.remove(this.SESSION_KEY);
    // Clear sensitive API credentials from memory
    this.apiCredentials.clear();
  }

  async refreshSession(): Promise<boolean> {
    if (!this.currentSession) return false;

    try {
      // Check if session is still valid
      if (this.currentSession.expiresAt < new Date()) {
        await this.logout();
        return false;
      }

      // Update last activity
      this.currentSession.lastActivity = new Date();
      await this.saveSessionToStorage(this.currentSession);
      
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return this.currentSession !== null && this.currentSession.expiresAt > new Date();
  }

  hasPermission(permission: string): boolean {
    if (!this.currentSession) return false;
    
    return this.currentSession.permissions.includes('*') || 
           this.currentSession.permissions.includes(permission);
  }

  /**
   * 🔑 API Provider Credentials Management
   */
  async storeAPICredentials(credentials: APICredentials): Promise<void> {
    // Encrypt sensitive data before storage
    const encryptedCredentials = await this.encryptCredentials(credentials);
    
    this.apiCredentials.set(credentials.providerId, encryptedCredentials);
    
    // Store in IndexedDB with encryption
    const allCredentials = Array.from(this.apiCredentials.values());
    await cacheService.set(this.API_CREDS_KEY, allCredentials, { 
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      encrypt: true 
    });
  }

  async getAPICredentials(providerId: string): Promise<APICredentials | null> {
    const credentials = this.apiCredentials.get(providerId);
    if (!credentials) return null;

    // Decrypt credentials
    return await this.decryptCredentials(credentials);
  }

  async removeAPICredentials(providerId: string): Promise<void> {
    this.apiCredentials.delete(providerId);
    
    const allCredentials = Array.from(this.apiCredentials.values());
    await cacheService.set(this.API_CREDS_KEY, allCredentials, { encrypt: true });
  }

  async listAPICredentials(): Promise<APICredentials[]> {
    const credentials = Array.from(this.apiCredentials.values());
    
    // Decrypt all credentials
    return await Promise.all(
      credentials.map(cred => this.decryptCredentials(cred))
    );
  }

  /**
   * 🔄 Token Management
   */
  async validateAPIToken(providerId: string): Promise<{ valid: boolean; needsRefresh?: boolean; error?: string }> {
    const credentials = await this.getAPICredentials(providerId);
    if (!credentials) {
      return { valid: false, error: 'Credentials not found' };
    }

    try {
      // Provider-specific validation
      switch (credentials.providerType) {
        case 'OpenAI':
          return await this.validateOpenAIToken(credentials.apiKey!);
        
        case 'Anthropic':
          return await this.validateAnthropicToken(credentials.apiKey!);
          
        case 'StatusRafa MCP':
          return await this.validateMCPConnection(credentials);
          
        default:
          return { valid: false, error: 'Unknown provider type' };
      }
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }
  }

  private async validateOpenAIToken(apiKey: string): Promise<{ valid: boolean; needsRefresh?: boolean }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return { valid: response.ok };
    } catch (error) {
      return { valid: false };
    }
  }

  private async validateAnthropicToken(apiKey: string): Promise<{ valid: boolean; needsRefresh?: boolean }> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      
      return { valid: response.status !== 401 };
    } catch (error) {
      return { valid: false };
    }
  }

  private async validateMCPConnection(credentials: APICredentials): Promise<{ valid: boolean; needsRefresh?: boolean }> {
    try {
      const response = await fetch(`${credentials.endpoint}/status`);
      return { valid: response.ok };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * 🔐 Encryption/Decryption Helpers
   */
  private async encryptCredentials(credentials: APICredentials): Promise<APICredentials> {
    // TODO: Implementar criptografia real com Web Crypto API
    // Por enquanto, retorna as credenciais como estão (development only)
    return { ...credentials };
  }

  private async decryptCredentials(encryptedCredentials: APICredentials): Promise<APICredentials> {
    // TODO: Implementar descriptografia real
    return { ...encryptedCredentials };
  }

  /**
   * 💾 Storage Management
   */
  private async initializeFromStorage(): Promise<void> {
    // Skip initialization in SSR environment
    if (typeof window === 'undefined') {
      console.warn('Storage initialization skipped in SSR environment');
      return;
    }

    try {
      // Load user session
      const sessionData = await cacheService.get(this.SESSION_KEY);
      if (sessionData && typeof sessionData === 'object') {
        this.currentSession = {
          ...sessionData as UserSession,
          expiresAt: new Date((sessionData as UserSession).expiresAt),
          lastActivity: new Date((sessionData as UserSession).lastActivity)
        };
      }

      // Load API credentials
      const credentialsData = await cacheService.get(this.API_CREDS_KEY);
      if (Array.isArray(credentialsData)) {
        for (const cred of credentialsData) {
          this.apiCredentials.set(cred.providerId, cred);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
    }
  }

  private async saveSessionToStorage(session: UserSession): Promise<void> {
    await cacheService.set(this.SESSION_KEY, session, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      encrypt: true
    });
  }

  private generateSessionToken(): string {
    return `kortex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton export
export const authService = AuthService.getInstance();
