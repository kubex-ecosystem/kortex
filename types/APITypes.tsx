import { ConnectionStatus } from ".";

export type APIProviderStatus = 'Active' | 'Inactive' | 'Testing';
export type APIKey = string;
export type APIProviderType = 'internal' | 'external' | 'custom';

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
}
