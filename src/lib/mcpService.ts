/**
 * MCP Server Integration Service
 * Conecta o Kortex frontend com o StatusRafa MCP Server
 */

export interface MCPServerResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
}

export interface MCPStatus {
  server: string;
  status: string;
  github_configured: boolean;
  azure_configured: boolean;
  azure_org: string;
  azure_project: string;
  memory_entries: number;
  endpoints: string[];
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
  private baseURL: string;

  constructor(baseURL: string = '/api/mcp') {
    this.baseURL = baseURL;
  }

  /**
   * Testa conectividade com o MCP Server
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/status`);
      const data: MCPServerResponse<MCPStatus> = await response.json();
      return data.success && response.ok;
    } catch (error) {
      console.error('Erro ao conectar com MCP Server:', error);
      return false;
    }
  }

  /**
   * Obtém status do MCP Server
   */
  async getStatus(): Promise<MCPStatus | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/status`);
      const data = await response.json();
      
      if (data.success && response.ok) {
        return {
          server: data.server || 'StatusRafa MCP Server',
          status: data.status || 'running',
          github_configured: data.github_configured || false,
          azure_configured: data.azure_configured || false,
          azure_org: data.azure_org || '',
          azure_project: data.azure_project || '',
          memory_entries: data.memory_entries || 0,
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
   * Lista repositórios GitHub
   */
  async getRepositories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/repos`);
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

      const response = await fetch(url, options);
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

      const response = await fetch(url, options);
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
      const response = await fetch(`${this.baseURL}/api/memory?limit=${limit}`);
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
      const response = await fetch(`${this.baseURL}/api/memory`, {
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
      const response = await fetch(`${this.baseURL}/api/suggest`);
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
      const response = await fetch(`${this.baseURL}/api/session`);
      const data = await response.json();
      return data.success ? data.session_id || data.data?.session_id || null : null;
    } catch (error) {
      console.error('Erro ao gerar session_id:', error);
      return null;
    }
  }
}

// Instância singleton
export const mcpService = new MCPServerService();
export default mcpService;
