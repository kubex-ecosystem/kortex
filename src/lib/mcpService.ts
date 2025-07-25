/**
 * MCP Server Integration Service v2.0
 * Conecta o Kortex frontend com o StatusRafa MCP Server v2.0
 * Suporta configuração dinâmica, comandos do sistema e secrets criptografados
 */

export interface MCPServerResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
  timestamp?: string;
  stats?: any;
}

export interface MCPStatus {
  server: string;
  status: string;
  version: string;
  config_loaded: boolean;
  config_stats: ConfigStats;
  github_configured: boolean;
  azure_configured: boolean;
  azure_org: string;
  azure_project: string;
  memory_entries: number;
  features: {
    dynamic_config: boolean;
    encrypted_secrets: boolean;
    system_commands: boolean;
    available_commands: number;
    command_categories: string[];
    websockets?: boolean;
    hot_reload?: boolean;
  };
  endpoints: string[];
}

export interface ConfigStats {
  config_file_size: number;
  secrets_file_exists: boolean;
  total_backups: number;
  config_sections: number;
  enabled_providers: number;
  last_updated: string;
  cache_age_seconds: number;
  config_version: string;
}

export interface DynamicConfig {
  server: ServerConfig;
  providers: {
    github: ProviderConfig;
    azure_devops: ProviderConfig;
  };
  features: FeatureConfig;
  integrations: IntegrationConfig;
  meta: MetaConfig;
}

export interface ServerConfig {
  id: string;
  name: string;
  port: number;
  host: string;
  log_level: string;
  max_connections: number;
  timeout: number;
  cors_origins: string[];
  ssl_enabled: boolean;
}

export interface ProviderConfig {
  enabled: boolean;
  org?: string;
  project?: string;
  api_version?: string;
  base_url?: string;
  rate_limits: {
    requests_per_hour: number;
    requests_per_minute: number;
    concurrent: number;
    retry_after: number;
    backoff_factor: number;
  };
  polling: {
    enabled: boolean;
    intervals: Record<string, number>;
  };
  secrets?: Record<string, string>;
}

export interface FeatureConfig {
  websockets: {
    enabled: boolean;
    max_connections: number;
    ping_interval: number;
    ping_timeout: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
    max_entries: number;
  };
  metrics: {
    enabled: boolean;
    retention_days: number;
    detailed_logging: boolean;
  };
  security: {
    api_key_required: boolean;
    rate_limiting: boolean;
    cors_strict: boolean;
    encrypt_secrets: boolean;
  };
}

export interface IntegrationConfig {
  system_commands: {
    enabled: boolean;
    allowed_commands: string[];
    command_timeout: number;
    require_confirmation: boolean;
  };
  database: {
    enabled: boolean;
    type: string;
    connection_string: string;
    pool_size: number;
  };
}

export interface MetaConfig {
  version: string;
  created_at: string;
  updated_at: string;
  update_count: number;
}

export interface SystemCommand {
  name: string;
  path: string;
  description: string;
  category: string;
  requires_confirmation: boolean;
  dangerous?: boolean;
  requires_sudo?: boolean;
  timeout: number;
  available: boolean;
  full_path?: string;
  file_exists?: boolean;
  file_header?: string[];
}

export interface CommandResult {
  success: boolean;
  command: string;
  return_code?: number;
  stdout?: string;
  stderr?: string;
  execution_time?: number;
  started_at?: string;
  finished_at?: string;
  args?: string[];
  timeout?: number;
  error?: string;
  requires_confirmation?: boolean;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  updated_at: string;
}

export interface PullRequest {
  repo: string;
  title: string;
  number: number;
  author: string;
  updated_at: string;
  url: string;
  draft: boolean;
}

export interface Pipeline {
  id: number;
  definition: string;
  status: string;
  result: string;
  start_time?: string;
  finish_time?: string;
  url: string;
}

export interface MemoryEntry {
  timestamp: string;
  entry: string;
}

export class MCPServerService {
  private baseURL = 'http://127.0.0.1:3001'; // MCP Server v2.0 endpoint
  private wsURL = 'ws://127.0.0.1:3001/ws'; // WebSocket endpoint

  /**
   * Testa conectividade com o MCP Server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/status`);
      const data: MCPServerResponse<MCPStatus> = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao conectar com MCP Server:', error);
      return false;
    }
  }

  /**
   * Obtém status completo do MCP Server v2.0
   */
  async getStatus(): Promise<MCPStatus | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/status`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return {
          server: data.server || 'StatusRafa MCP Server',
          status: data.status || 'running',
          version: data.version || '2.0.0',
          config_loaded: data.config_loaded || false,
          config_stats: data.config_stats || {},
          github_configured: data.github_configured || false,
          azure_configured: data.azure_configured || false,
          azure_org: data.azure_org || '',
          azure_project: data.azure_project || '',
          memory_entries: data.memory_entries || 0,
          features: data.features || {
            dynamic_config: false,
            encrypted_secrets: false,
            system_commands: false,
            available_commands: 0,
            command_categories: []
          },
          endpoints: data.endpoints || []
        } as MCPStatus;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return null;
    }
  }

  /**
   * ===== DYNAMIC CONFIGURATION METHODS =====
   */

  /**
   * Obter configuração dinâmica completa
   */
  async getDynamicConfig(): Promise<DynamicConfig | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return data.config;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter configuração dinâmica:', error);
      return null;
    }
  }

  /**
   * Atualizar configuração dinâmica
   */
  async updateDynamicConfig(
    config: Partial<DynamicConfig>, 
    secrets?: Record<string, string>,
    applyImmediately: boolean = true
  ): Promise<boolean> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          secrets,
          apply_immediately: applyImmediately
        }),
      });

      const data = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao atualizar configuração dinâmica:', error);
      return false;
    }
  }

  /**
   * Validar configuração sem salvar
   */
  async validateConfig(config: Partial<DynamicConfig>): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          valid: data.success,
          errors: data.errors || []
        };
      }
      
      return { valid: false, errors: [data.error || 'Erro desconhecido'] };
    } catch (error) {
      console.error('Erro ao validar configuração:', error);
      return { valid: false, errors: ['Erro de conexão'] };
    }
  }

  /**
   * Resetar configuração para padrões
   */
  async resetConfig(section: 'all' | 'server' | 'providers' | 'features' = 'all'): Promise<boolean> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          confirm: true
        }),
      });

      const data = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao resetar configuração:', error);
      return false;
    }
  }

  /**
   * Obter estatísticas da configuração
   */
  async getConfigStats(): Promise<ConfigStats | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config/stats`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return data.stats;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter estatísticas da configuração:', error);
      return null;
    }
  }

  /**
   * ===== SYSTEM COMMANDS METHODS =====
   */

  /**
   * Listar comandos disponíveis
   */
  async getAvailableCommands(): Promise<{ commands: Record<string, SystemCommand[]>; categories: string[]; stats: any } | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/commands`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return {
          commands: data.commands || {},
          categories: data.categories || [],
          stats: data.stats || {}
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter comandos disponíveis:', error);
      return null;
    }
  }

  /**
   * Obter ajuda sobre um comando específico
   */
  async getCommandHelp(command: string): Promise<SystemCommand | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/commands/${command}`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return data.command;
      }
      return null;
    } catch (error) {
      console.error(`Erro ao obter ajuda do comando ${command}:`, error);
      return null;
    }
  }

  /**
   * Executar comando do sistema
   */
  async executeCommand(
    command: string, 
    args: string[] = [], 
    confirm: boolean = false, 
    timeout?: number
  ): Promise<CommandResult> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/commands/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          args,
          confirm,
          timeout
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao executar comando ${command}:`, error);
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Validar comando sem executar
   */
  async validateCommand(command: string, args: string[] = []): Promise<CommandResult> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/commands/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          args
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Erro ao validar comando ${command}:`, error);
      return {
        success: false,
        command,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * ===== SECRETS MANAGEMENT METHODS =====
   */

  /**
   * Obter status dos secrets (valores mascarados)
   */
  async getSecretsStatus(): Promise<Record<string, { exists: boolean; masked_value?: string }> | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/secrets`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return data.secrets;
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter status dos secrets:', error);
      return null;
    }
  }

  /**
   * Definir/atualizar secrets
   */
  async updateSecrets(
    secrets: Record<string, string>, 
    applyImmediately: boolean = true
  ): Promise<boolean> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/secrets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secrets,
          apply_immediately: applyImmediately
        }),
      });

      const data = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao atualizar secrets:', error);
      return false;
    }
  }

  /**
   * ===== BACKUP & RESTORE METHODS =====
   */

  /**
   * Criar backup da configuração
   */
  async createConfigBackup(): Promise<{ backup_path: string } | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config/backup`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success && response.ok) {
        return { backup_path: data.backup_path };
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar backup da configuração:', error);
      return null;
    }
  }

  /**
   * Listar backups disponíveis
   */
  async listConfigBackups(): Promise<Array<{ filename: string; created_at: string; size_kb: number }> | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config/backups`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return data.backups;
      }
      return null;
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return null;
    }
  }

  /**
   * Restaurar configuração de backup
   */
  async restoreConfigBackup(backupFilename: string): Promise<boolean> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/config/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backup_filename: backupFilename
        }),
      });

      const data = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  /**
   * ===== LEGACY METHODS (MAINTAINED FOR COMPATIBILITY) =====
   */

  /**
   * Lista repositórios GitHub
   */
  async getRepositories(): Promise<string[]> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/repos`);
      const data: MCPServerResponse<string[]> = await response.json();
      return data.success ? data.data || [] : [];
    } catch (error) {
      console.error('Erro ao buscar repositórios:', error);
      return [];
    }
  }

  /**
   * Lista Pull Requests
   */
  async getPullRequests(repos?: string[]): Promise<PullRequest[]> {
    try {
      let url = `${this.baseURL}/api/prs`;
      let options: RequestInit = { method: 'GET' };

      if (repos && repos.length > 0) {
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repos: repos.join(',') })
        };
      }

      const response: Response | undefined = await fetch(url, options);
      const data = await response.json();
      return data.success ? data.prs || data.data || [] : [];
    } catch (error) {
      console.error('Erro ao buscar PRs:', error);
      return [];
    }
  }

  /**
   * Lista Pipelines Azure
   */
  async getPipelines(project?: string): Promise<Pipeline[]> {
    try {
      let url = `${this.baseURL}/api/pipelines`;
      let options: RequestInit = { method: 'GET' };

      if (project) {
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project })
        };
      }

      const response: Response | undefined = await fetch(url, options);
      const data = await response.json();
      return data.success ? data.pipelines || data.data || [] : [];
    } catch (error) {
      console.error('Erro ao buscar pipelines:', error);
      return [];
    }
  }

  /**
   * Obtém entradas da memória
   */
  async getMemory(limit: number = 10): Promise<MemoryEntry[]> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/memory?limit=${limit}`);
      const data: MCPServerResponse<MemoryEntry[]> = await response.json();
      return data.success ? data.data || [] : [];
    } catch (error) {
      console.error('Erro ao buscar memória:', error);
      return [];
    }
  }

  /**
   * Adiciona entrada na memória
   */
  async addMemoryEntry(note: string): Promise<boolean> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      const data: MCPServerResponse = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao adicionar à memória:', error);
      return false;
    }
  }

  /**
   * Obtém sugestão do próximo passo
   */
  async getSuggestion(): Promise<string | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/suggest`);
      const data = await response.json();
      return data.success ? data.suggestion || data.data || null : null;
    } catch (error) {
      console.error('Erro ao obter sugestão:', error);
      return null;
    }
  }

  /**
   * Gera session_id para tracking
   */
  async generateSessionId(): Promise<string | null> {
    try {
      const response: Response | undefined = await fetch(`${this.baseURL}/api/session`);
      const data = await response.json();
      return data.success ? data.session_id || data.data?.session_id || null : null;
    } catch (error) {
      console.error('Erro ao gerar session_id:', error);
      return null;
    }
  }

  /**
   * ===== WEBSOCKET METHODS =====
   */

  /**
   * Conectar ao WebSocket para atualizações em tempo real
   */
  connectWebSocket(): WebSocket | null {
    try {
      const ws = new WebSocket(this.wsURL);
      
      ws.onopen = () => {
        console.log('🔌 WebSocket conectado ao MCP Server');
      };

      ws.onerror = (error) => {
        console.error('❌ Erro no WebSocket:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
      };

      return ws;
    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      return null;
    }
  }
}

// Instância singleton para o MCP Server v2.0
export const mcpService = new MCPServerService();
export default mcpService;
