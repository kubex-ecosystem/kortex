# Examples

Practical examples and code snippets for common Kortex integration scenarios.

## 🚀 Quick Start Examples

### Basic Dashboard Setup

```typescript
// components/BasicDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface DashboardStats {
  servers: number;
  activeConnections: number;
  totalRequests: number;
  errorRate: number;
}

export const BasicDashboard: React.FC = () => {
  const { servers, logs } = useAppContext();
  const [stats, setStats] = useState<DashboardStats>({
    servers: 0,
    activeConnections: 0,
    totalRequests: 0,
    errorRate: 0
  });

  useEffect(() => {
    // Calculate dashboard statistics
    const activeServers = servers.filter(s => s.status === 'online').length;
    const totalRequests = logs.length;
    const errorCount = logs.filter(l => l.level === 'error').length;
    
    setStats({
      servers: servers.length,
      activeConnections: activeServers,
      totalRequests,
      errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0
    });
  }, [servers, logs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Servers
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.servers}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Active Connections
        </h3>
        <p className="text-2xl font-bold text-green-600">
          {stats.activeConnections}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Requests
        </h3>
        <p className="text-2xl font-bold text-blue-600">
          {stats.totalRequests}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Error Rate
        </h3>
        <p className={`text-2xl font-bold ${
          stats.errorRate > 5 ? 'text-red-600' : 'text-green-600'
        }`}>
          {stats.errorRate.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};
```

### Real-time Server Monitoring

```typescript
// components/ServerMonitor.tsx
import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  lastChecked: Date;
  uptime: number;
}

export const ServerMonitor: React.FC = () => {
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const websocket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    websocket.onopen = () => {
      console.log('Connected to server monitoring WebSocket');
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'server.status') {
        setServers(prev => {
          const updated = [...prev];
          const index = updated.findIndex(s => s.id === data.payload.id);
          
          if (index >= 0) {
            updated[index] = {
              ...updated[index],
              ...data.payload,
              lastChecked: new Date()
            };
          } else {
            updated.push({
              ...data.payload,
              lastChecked: new Date()
            });
          }
          
          return updated;
        });
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (websocket.readyState === WebSocket.CLOSED) {
          // Reconnect logic here
        }
      }, 5000);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-yellow-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Server Status
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {servers.map((server) => (
          <div key={server.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(server.status)}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {server.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last checked: {server.lastChecked.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-900 dark:text-white">
                {server.responseTime}ms
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Uptime: {formatUptime(server.uptime)}
              </p>
            </div>
          </div>
        ))}
        
        {servers.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No servers configured
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
```

## 🔌 API Integration Examples

### GitHub Integration

```typescript
// lib/github-integration.ts
interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export class GitHubIntegration {
  private config: GitHubConfig;
  private baseUrl = 'https://api.github.com';

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Kortex-Dashboard'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRepository() {
    return this.makeRequest(`/repos/${this.config.owner}/${this.config.repo}`);
  }

  async getWorkflowRuns(limit = 10) {
    return this.makeRequest(
      `/repos/${this.config.owner}/${this.config.repo}/actions/runs?per_page=${limit}`
    );
  }

  async getIssues(state: 'open' | 'closed' | 'all' = 'open') {
    return this.makeRequest(
      `/repos/${this.config.owner}/${this.config.repo}/issues?state=${state}`
    );
  }

  async getPullRequests(state: 'open' | 'closed' | 'all' = 'open') {
    return this.makeRequest(
      `/repos/${this.config.owner}/${this.config.repo}/pulls?state=${state}`
    );
  }

  async getRateLimit() {
    return this.makeRequest('/rate_limit');
  }
}

// Usage example
const github = new GitHubIntegration({
  token: process.env.GITHUB_TOKEN!,
  owner: 'your-username',
  repo: 'your-repo'
});

// Get recent workflow runs
const workflows = await github.getWorkflowRuns(5);
console.log('Recent workflows:', workflows);
```

### Azure DevOps Integration

```typescript
// lib/azure-integration.ts
interface AzureConfig {
  token: string;
  organization: string;
  project: string;
}

export class AzureDevOpsIntegration {
  private config: AzureConfig;
  private baseUrl: string;

  constructor(config: AzureConfig) {
    this.config = config;
    this.baseUrl = `https://dev.azure.com/${config.organization}`;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const auth = Buffer.from(`:${this.config.token}`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Azure DevOps API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getBuilds(top = 10) {
    return this.makeRequest(
      `/${this.config.project}/_apis/build/builds?$top=${top}&api-version=7.0`
    );
  }

  async getPipelines() {
    return this.makeRequest(
      `/${this.config.project}/_apis/pipelines?api-version=7.0`
    );
  }

  async getWorkItems(wiql: string) {
    const response = await fetch(
      `${this.baseUrl}/${this.config.project}/_apis/wit/wiql?api-version=7.0`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`:${this.config.token}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: wiql })
      }
    );

    return response.json();
  }

  async getReleases() {
    return this.makeRequest(
      `/${this.config.project}/_apis/release/releases?api-version=7.0`
    );
  }
}

// Usage example
const azure = new AzureDevOpsIntegration({
  token: process.env.AZURE_DEVOPS_TOKEN!,
  organization: 'your-org',
  project: 'your-project'
});

// Get recent builds
const builds = await azure.getBuilds(10);
console.log('Recent builds:', builds);
```

## 🎨 Custom Components Examples

### Alert System

```typescript
// components/AlertSystem.tsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissible?: boolean;
  autoDismiss?: number; // milliseconds
}

interface AlertSystemProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, onDismiss }) => {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    setVisibleAlerts(alerts);

    // Auto-dismiss alerts with autoDismi ss set
    alerts.forEach(alert => {
      if (alert.autoDismi ss) {
        setTimeout(() => {
          onDismiss(alert.id);
        }, alert.autoDismi ss);
      }
    });
  }, [alerts, onDismiss]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertClasses = (type: Alert['type']) => {
    const baseClasses = "p-4 rounded-lg border-l-4 mb-4";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-400 text-green-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-700`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-400 text-red-700`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-700`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
      {visibleAlerts.map(alert => (
        <div key={alert.id} className={getAlertClasses(alert.type)}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium">{alert.title}</h3>
              <p className="mt-1 text-sm opacity-90">{alert.message}</p>
              <p className="mt-2 text-xs opacity-75">
                {alert.timestamp.toLocaleTimeString()}
              </p>
            </div>
            
            {alert.dismissible !== false && (
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Usage example in a parent component
export const DashboardWithAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    
    setAlerts(prev => [...prev, newAlert]);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Example: Add alert when server goes offline
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          addAlert({
            type: 'error',
            title: 'Server Offline',
            message: 'Main server is not responding',
            autoDismi ss: 5000
          });
        }
      } catch (error) {
        addAlert({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to connect to server',
          autoDismi ss: 5000
        });
      }
    };

    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Your dashboard content */}
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />
    </div>
  );
};
```

### Performance Metrics Chart

```typescript
// components/PerformanceChart.tsx
import React, { useEffect, useState } from 'react';

interface MetricData {
  timestamp: Date;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

export const PerformanceChart: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`/api/metrics?range=${timeRange}`);
        const data = await response.json();
        setMetrics(data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timeRange]);

  const maxResponseTime = Math.max(...metrics.map(m => m.responseTime));
  const maxRequestCount = Math.max(...metrics.map(m => m.requestCount));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h2>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
      </div>

      <div className="h-64 relative">
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Response Time Line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={metrics.map((metric, index) => {
              const x = (index / (metrics.length - 1)) * 100;
              const y = 100 - (metric.responseTime / maxResponseTime) * 80;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Request Count Bars */}
          {metrics.map((metric, index) => {
            const x = (index / metrics.length) * 100;
            const height = (metric.requestCount / maxRequestCount) * 60;
            const y = 100 - height;
            
            return (
              <rect
                key={index}
                x={`${x}%`}
                y={`${y}%`}
                width={`${100 / metrics.length * 0.8}%`}
                height={`${height}%`}
                fill="#10B981"
                opacity="0.6"
              />
            );
          })}
          
          {/* Error Rate Indicators */}
          {metrics.map((metric, index) => {
            if (metric.errorRate > 5) {
              const x = (index / (metrics.length - 1)) * 100;
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy="10%"
                  r="3"
                  fill="#EF4444"
                />
              );
            }
            return null;
          })}
        </svg>
        
        {/* Legend */}
        <div className="absolute bottom-0 left-0 flex space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-blue-500 mr-1"></div>
            <span>Response Time</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 opacity-60 mr-1"></div>
            <span>Request Count</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>High Error Rate</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-semibold text-blue-600">
            {metrics.length > 0 ? metrics[metrics.length - 1].responseTime : 0}ms
          </p>
          <p className="text-xs text-gray-500">Avg Response Time</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-green-600">
            {metrics.reduce((sum, m) => sum + m.requestCount, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Requests</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-red-600">
            {metrics.length > 0 
              ? (metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-gray-500">Avg Error Rate</p>
        </div>
      </div>
    </div>
  );
};
```

## 🔧 Utility Functions

### WebSocket Manager

```typescript
// lib/websocket-manager.ts
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
          
          if (data.type) {
            this.emit(data.type, data.payload);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  public disconnect(): void {
    this.maxReconnectAttempts = 0; // Prevent reconnection
    if (this.ws) {
      this.ws.close();
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Usage example
const wsManager = new WebSocketManager(process.env.NEXT_PUBLIC_WS_URL!);

wsManager.on('connected', () => {
  console.log('Successfully connected to WebSocket');
});

wsManager.on('server.status', (data) => {
  console.log('Server status update:', data);
});

wsManager.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### Local Storage Helper

```typescript
// lib/storage.ts
export class StorageHelper {
  private static prefix = 'kortex_';

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(
        `${this.prefix}${key}`,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      if (item === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue ?? null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  static exists(key: string): boolean {
    return localStorage.getItem(`${this.prefix}${key}`) !== null;
  }
}

// Usage examples
StorageHelper.set('user_preferences', {
  theme: 'dark',
  autoRefresh: true,
  notifications: false
});

const preferences = StorageHelper.get('user_preferences', {
  theme: 'light',
  autoRefresh: false,
  notifications: true
});

console.log('User preferences:', preferences);
```

---

*Next: Explore [troubleshooting guide](../guide/troubleshooting.md) or check [API reference](../advanced/api.md).*
