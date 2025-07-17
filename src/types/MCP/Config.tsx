import { MCPAPIProvider, MCPConnectionType, MCPPlaceType } from './Context';
import { ConnectionStatus } from '../SettingsTypes';

export interface MCPConnectionConfigType {
  id: string;
  name?: string;
  type: MCPConnectionType;
  baseURL: string;
  wsUrl: string;
  apiKey: string;
  enableWebSocket: boolean;
  autoReconnect: boolean;
  connectionTimeout?: number;
  keepAlive?: boolean;
  pingInterval?: number;
  pingTimeout?: number;
  retryOnFailure: boolean;
  retryDelay?: number;
  maxRetries?: number;
  retryBackoff: boolean;
  retryBackoffFactor?: number;
  retryBackoffMaxDelay?: number;
}

export interface MCPAPIProviderConfigType {
  id: string;
  name: string;
  description?: string;
  provider: MCPAPIProvider;
  enabled: boolean;
  status?: ConnectionStatus;
  models?: MCPModelType[];
  activeModel: MCPModelType | null;
  apiKey?: string;
  apiUrl?: string;
  wsUrl?: string;
  lastTested?: string;
  connectionSettings?: MCPConnectionConfigType;
  keyPreview?: string;
  requestsToday?: number;
  monthlyLimit?: number;
  costPerRequest?: number;
}

export interface MCPSettingsType {
  id?: string;
  place: MCPPlaceType;
  connectionType: MCPConnectionType;
  connectionConfig: MCPConnectionConfigType;
  apiProvider: MCPAPIProviderConfigType;
}

export interface MCPServiceConfigType {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
}

export interface MCPRequestType {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: Record<string, any>;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  retryInterval?: number;
  timeout?: number;
  retryOnFailure?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  retryBackoff?: boolean;
  retryBackoffFactor?: number;
  retryBackoffMaxDelay?: number;
}

// Import necessário
import { ModelType as MCPModelType } from './Model';
