/**
 * 🎭 Mock Manager Centralizado
 * Gerencia todos os mocks de forma unificada e inteligente
 * Baseado na arquitetura do kortex com melhorias
 */

interface MockConfig {
  isDemoMode: boolean;
  autoFallback: boolean;
  refreshInterval: number;
}

interface SystemMetrics {
  totalServers: number;
  activeServers: number;
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalConnections: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface ServerData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  type: 'mcp' | 'discord' | 'api' | 'database';
  host: string;
  port: number;
  uptime: number;
  lastPing: string;
  responseTime: number;
  version?: string;
  description?: string;
}

interface TaskData {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  type: 'sync' | 'async' | 'scheduled' | 'triggered';
  startTime: string;
  endTime?: string;
  duration?: number;
  progress: number;
  logs?: string[];
  serverId?: string;
}

export class MockManager {
  private static instance: MockManager;
  private config: MockConfig;
  
  private constructor() {
    this.config = {
      isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      autoFallback: true,
      refreshInterval: 5000,
    };
  }
  
  static getInstance(): MockManager {
    if (!MockManager.instance) {
      MockManager.instance = new MockManager();
    }
    return MockManager.instance;
  }
  
  // Configuração
  setDemoMode(enabled: boolean): void {
    this.config.isDemoMode = enabled;
  }
  
  isDemoModeEnabled(): boolean {
    return this.config.isDemoMode;
  }
  
  // Mock de Métricas do Sistema
  getSystemMetrics(): SystemMetrics {
    const baseTime = Date.now();
    return {
      totalServers: 8,
      activeServers: 6,
      totalTasks: 247,
      runningTasks: 12,
      completedTasks: 198,
      failedTasks: 37,
      totalConnections: 45,
      activeConnections: 32,
      memoryUsage: Math.floor(65 + Math.random() * 10), // 65-75%
      cpuUsage: Math.floor(25 + Math.random() * 15), // 25-40%
      diskUsage: Math.floor(78 + Math.random() * 5), // 78-83%
      networkLatency: Math.floor(45 + Math.random() * 20), // 45-65ms
    };
  }
  
  // Mock de Lista de Servidores
  getServersList(): ServerData[] {
    const servers: ServerData[] = [
      {
        id: 'srv-001',
        name: 'GoBE Main API',
        status: 'online',
        type: 'api',
        host: 'localhost',
        port: 8080,
        uptime: 156789,
        lastPing: new Date(Date.now() - 30000).toISOString(),
        responseTime: 45,
        version: '1.0.0',
        description: 'Main backend API server'
      },
      {
        id: 'srv-002',
        name: 'Discord Bot',
        status: 'online',
        type: 'discord',
        host: 'bot.discord.com',
        port: 443,
        uptime: 234567,
        lastPing: new Date(Date.now() - 15000).toISOString(),
        responseTime: 78,
        version: '2.1.3',
        description: 'Discord integration service'
      },
      {
        id: 'srv-003',
        name: 'MCP Server Alpha',
        status: 'warning',
        type: 'mcp',
        host: '192.168.1.100',
        port: 3001,
        uptime: 45678,
        lastPing: new Date(Date.now() - 120000).toISOString(),
        responseTime: 234,
        version: '0.9.1',
        description: 'Model Context Protocol server'
      },
      {
        id: 'srv-004',
        name: 'PostgreSQL',
        status: 'online',
        type: 'database',
        host: 'db.internal',
        port: 5432,
        uptime: 1234567,
        lastPing: new Date(Date.now() - 10000).toISOString(),
        responseTime: 12,
        version: '14.2',
        description: 'Primary database server'
      },
      {
        id: 'srv-005',
        name: 'MCP Server Beta',
        status: 'error',
        type: 'mcp',
        host: '192.168.1.101',
        port: 3002,
        uptime: 0,
        lastPing: new Date(Date.now() - 600000).toISOString(),
        responseTime: 0,
        version: '0.8.9',
        description: 'Secondary MCP server (down)'
      },
      {
        id: 'srv-006',
        name: 'Cache Redis',
        status: 'online',
        type: 'database',
        host: 'cache.internal',
        port: 6379,
        uptime: 567890,
        lastPing: new Date(Date.now() - 5000).toISOString(),
        responseTime: 8,
        version: '7.0.4',
        description: 'Redis cache server'
      }
    ];
    
    return servers;
  }
  
  // Mock de Lista de Tasks
  getTasksList(): TaskData[] {
    const tasks: TaskData[] = [
      {
        id: 'task-001',
        name: 'Sync Discord Channels',
        status: 'running',
        type: 'scheduled',
        startTime: new Date(Date.now() - 300000).toISOString(),
        progress: 67,
        serverId: 'srv-002',
        logs: ['Started sync process', 'Processing 15 channels', 'Channel #general synced']
      },
      {
        id: 'task-002',
        name: 'Database Backup',
        status: 'completed',
        type: 'scheduled',
        startTime: new Date(Date.now() - 1800000).toISOString(),
        endTime: new Date(Date.now() - 1200000).toISOString(),
        duration: 600000,
        progress: 100,
        serverId: 'srv-004',
        logs: ['Backup started', 'Tables exported', 'Compression complete', 'Backup stored successfully']
      },
      {
        id: 'task-003',
        name: 'MCP Health Check',
        status: 'failed',
        type: 'triggered',
        startTime: new Date(Date.now() - 120000).toISOString(),
        endTime: new Date(Date.now() - 90000).toISOString(),
        duration: 30000,
        progress: 0,
        serverId: 'srv-005',
        logs: ['Health check initiated', 'Connection timeout', 'Retry attempt 1', 'Retry attempt 2', 'Task failed - server unreachable']
      },
      {
        id: 'task-004',
        name: 'Cache Cleanup',
        status: 'pending',
        type: 'async',
        startTime: new Date(Date.now() + 300000).toISOString(),
        progress: 0,
        serverId: 'srv-006'
      }
    ];
    
    return tasks;
  }
  
  // Mock de Logs do Sistema
  getSystemLogs(limit: number = 50) {
    const logLevels = ['info', 'warn', 'error', 'debug'];
    const logSources = ['api', 'discord', 'mcp', 'database', 'system'];
    const logs = [];
    
    for (let i = 0; i < limit; i++) {
      const timestamp = new Date(Date.now() - (i * 30000 + Math.random() * 30000));
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const source = logSources[Math.floor(Math.random() * logSources.length)];
      
      logs.push({
        id: `log-${Date.now()}-${i}`,
        timestamp: timestamp.toISOString(),
        level,
        source,
        message: this.generateLogMessage(level, source),
        details: level === 'error' ? 'Additional error context here' : undefined
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  private generateLogMessage(level: string, source: string): string {
    const messages: Record<string, string[]> = {
      info: [
        `${source} service started successfully`,
        `${source} connection established`,
        `${source} task completed`,
        `${source} health check passed`
      ],
      warn: [
        `${source} response time elevated`,
        `${source} memory usage high`,
        `${source} connection retry attempted`,
        `${source} rate limit approaching`
      ],
      error: [
        `${source} connection failed`,
        `${source} service unavailable`,
        `${source} authentication error`,
        `${source} timeout exceeded`
      ],
      debug: [
        `${source} debug trace active`,
        `${source} cache miss recorded`,
        `${source} query executed`,
        `${source} event processed`
      ]
    };
    
    const levelMessages = messages[level] || messages.info;
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
  }
  
  // Simulação de dados em tempo real
  getRealtimeUpdate(): { type: string; data: any } {
    const updateTypes = ['metric_update', 'server_status', 'task_progress', 'new_log'];
    const type = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    switch (type) {
      case 'metric_update':
        return {
          type,
          data: {
            metric: 'cpu_usage',
            value: Math.floor(25 + Math.random() * 15),
            timestamp: new Date().toISOString()
          }
        };
      case 'server_status':
        return {
          type,
          data: {
            serverId: 'srv-003',
            status: Math.random() > 0.7 ? 'warning' : 'online',
            responseTime: Math.floor(50 + Math.random() * 200)
          }
        };
      case 'task_progress':
        return {
          type,
          data: {
            taskId: 'task-001',
            progress: Math.min(100, Math.floor(Math.random() * 10) + 67)
          }
        };
      case 'new_log':
        return {
          type,
          data: this.getSystemLogs(1)[0]
        };
      default:
        return { type: 'unknown', data: {} };
    }
  }
}

// Export singleton instance
export const mockManager = MockManager.getInstance();
