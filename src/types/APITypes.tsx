import { ConnectionStatus } from ".";

export type APIProviderStatus = 'Active' | 'Inactive' | 'Testing';
export type APIKey = string;
export type APIProviderType = 'internal' | 'external' | 'custom';

// Tipos alinhados com o MCP Server real
export interface MCPServerConnection {
  id: string;
  name: string;
  endpoint: string; // http://localhost:3001
  type: 'StatusRafa' | 'Custom';
  status: 'Connected' | 'Disconnected' | 'Testing';
  lastTested: Date;
  version?: string;
  features: string[]; // ['repos', 'prs', 'pipelines', 'memory', 'suggest']
}

export interface APIProvider {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  status: ConnectionStatus;
  lastTested: string;
  requestsToday: number;
  monthlyLimit: number;
  costPerRequest: number;
  // Novos campos para integração MCP
  mcpEndpoint?: string;
  githubToken?: string;
  azureToken?: string;
  azureOrg?: string;
  azureProject?: string;
}

export interface APIProviderConfig {
  id: string;
  name: string;
  provider: APIProviderType;
  keyPreview: string;
  status: APIProviderStatus;
  lastTested: string;
  requestsToday: number;
  monthlyLimit: number;
  costPerRequest: number;
}

export interface APIProviderContextType {
  apiProviders: APIProvider[];
  isLoading: boolean;
  error: string | null;
  addAPIProvider: (provider: APIProvider) => void;
  updateAPIProvider: (id: string, updates: Partial<APIProvider>) => void;
  deleteAPIProvider: (id: string) => void;
  testAPIProvider: (id: string) => void;
  // Funções específicas do MCP Server
  testMCPConnection: (endpoint: string) => Promise<boolean>;
  fetchMCPStatus: (endpoint: string) => Promise<any>;
}
