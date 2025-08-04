export type MCPTaskType = 'analysis' | 'processing' | 'training' | 'inference';

export interface MCPTask {
  id: string;
  type: MCPTaskType;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  progress?: number; // percentage of completion
}