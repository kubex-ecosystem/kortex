export interface ModelType {
  id: string;
  name: string;
  version?: string;
  maxTokens: number;
  description: string;
  costPerRequest?: number;
  monthlyLimit?: number;
  usage?: number;
  requests?: number;
}