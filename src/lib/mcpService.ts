// Serviço para comunicação com a API do Gobe MCP Server
import { Task, MCPStats, Provider, ApprovalRequest, ServerMetrics } from '@/types/MCP';

const API_BASE_URL = process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:8080';

class MCPService {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Tasks API
  async getAllTasks(): Promise<Task[]> {
    return this.fetch<Task[]>('/mcp/tasks/');
  }

  async getTaskById(id: string): Promise<Task> {
    return this.fetch<Task>(`/mcp/tasks/${id}`);
  }

  async getActiveTasks(): Promise<Task[]> {
    return this.fetch<Task[]>('/mcp/tasks/active');
  }

  async getTasksByProvider(provider: string): Promise<Task[]> {
    return this.fetch<Task[]>(`/mcp/tasks/provider/${provider}`);
  }

  async markTaskAsRunning(id: string): Promise<void> {
    await this.fetch(`/mcp/tasks/${id}/running`, { method: 'POST' });
  }

  async markTaskAsCompleted(id: string, message?: string): Promise<void> {
    await this.fetch(`/mcp/tasks/${id}/completed`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async markTaskAsFailed(id: string, message: string): Promise<void> {
    await this.fetch(`/mcp/tasks/${id}/failed`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Providers API
  async getAllProviders(): Promise<Provider[]> {
    return this.fetch<Provider[]>('/mcp/providers/');
  }

  // Stats/Metrics - simulados por enquanto
  async getStats(): Promise<MCPStats> {
    const tasks = await this.getAllTasks();
    const providers = await this.getAllProviders();

    return {
      totalTasks: tasks.length,
      activeTasks: tasks.filter(t => t.status === 'running').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      failedTasks: tasks.filter(t => t.status === 'failed').length,
      pendingApprovals: tasks.filter(t => t.status === 'pending').length,
      providersConnected: providers.filter(p => p.status === 'online').length,
      avgResponseTime: Math.random() * 100 + 50,
      uptime: 99.5 + Math.random() * 0.5,
    };
  }

  async getServerMetrics(): Promise<ServerMetrics> {
    // Dados simulados para métricas em tempo real
    const now = new Date();
    const timestamps = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return time.toISOString();
    });

    return {
      responseTime: timestamps.map((timestamp, i) => ({
        timestamp,
        value: Math.random() * 100 + 50,
        label: new Date(timestamp).getHours().toString().padStart(2, '0') + ':00',
      })),
      requestRate: timestamps.map((timestamp, i) => ({
        timestamp,
        value: Math.random() * 200 + 100,
        label: new Date(timestamp).getHours().toString().padStart(2, '0') + ':00',
      })),
      errorRate: timestamps.map((timestamp, i) => ({
        timestamp,
        value: Math.random() * 5,
        label: new Date(timestamp).getHours().toString().padStart(2, '0') + ':00',
      })),
      taskThroughput: timestamps.map((timestamp, i) => ({
        timestamp,
        value: Math.random() * 50 + 20,
        label: new Date(timestamp).getHours().toString().padStart(2, '0') + ':00',
      })),
    };
  }

  // Mock para aprovações
  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    const tasks = await this.getAllTasks();
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    return pendingTasks.map(task => ({
      id: `approval-${task.id}`,
      taskId: task.id,
      task,
      requestedBy: 'Discord Bot',
      requestedAt: task.createdAt,
      reason: `Solicitação de execução da task: ${task.title}`,
      priority: task.priority as any,
      status: 'pending',
    }));
  }

  async approveTask(approvalId: string, taskId: string): Promise<void> {
    await this.markTaskAsRunning(taskId);
  }

  async rejectTask(approvalId: string, reason: string): Promise<void> {
    // Por enquanto, marca como failed
    const taskId = approvalId.replace('approval-', '');
    await this.markTaskAsFailed(taskId, `Rejeitado: ${reason}`);
  }
}

export const mcpService = new MCPService();
