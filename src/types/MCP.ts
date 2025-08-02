// Tipos baseados na API do Gobe MCP Server
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  provider: string;
  target: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  estimatedTime?: string;
  result?: string;
  cronJob?: CronJobInfo;
}

export interface CronJobInfo {
  schedule: string;
  nextRun: string;
  lastRun?: string;
  isActive: boolean;
}

export interface MCPStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingApprovals: number;
  providersConnected: number;
  avgResponseTime: number;
  uptime: number;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'degraded';
  lastSeen: string;
  organization?: string;
  group?: string;
  config: Record<string, any>;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  task: Task;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface MetricData {
  timestamp: string;
  value: number;
  label: string;
}

export interface ServerMetrics {
  responseTime: MetricData[];
  requestRate: MetricData[];
  errorRate: MetricData[];
  taskThroughput: MetricData[];
}
