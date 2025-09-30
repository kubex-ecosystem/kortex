# TypeScript Scripts

Advanced TypeScript development patterns and custom scripts for extending Kortex functionality.

## 🛠️ Custom Hook Development

### Server Connection Hooks

Create reusable hooks for server management:

```typescript
// hooks/useServerConnection.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';

interface UseServerConnectionProps {
  serverId: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

interface ServerConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

export const useServerConnection = ({
  serverId,
  autoReconnect = true,
  reconnectInterval = 5000,
}: UseServerConnectionProps) => {
  const { servers, connectToServer, disconnectFromServer } = useAppContext();
  const [state, setState] = useState<ServerConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;

  const server = servers.find(s => s.id === serverId);

  const connect = useCallback(async () => {
    if (!server || state.isConnecting) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      await connectToServer(serverId);
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: errorMessage,
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));

      // Auto-reconnect logic
      if (autoReconnect && state.reconnectAttempts < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    }
  }, [server, serverId, connectToServer, state.isConnecting, state.reconnectAttempts, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      await disconnectFromServer(serverId);
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [serverId, disconnectFromServer]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, reconnectAttempts: 0 }));
    connect();
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    server,
    connect,
    disconnect,
    retry,
    canRetry: state.reconnectAttempts < maxReconnectAttempts,
  };
};
```

### Real-time Data Hooks

```typescript
// hooks/useRealTimeMetrics.ts
import { useState, useEffect, useRef } from 'react';

interface MetricData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

interface UseRealTimeMetricsProps {
  serverId: string;
  metricType: string;
  updateInterval?: number;
  maxDataPoints?: number;
}

export const useRealTimeMetrics = ({
  serverId,
  metricType,
  updateInterval = 1000,
  maxDataPoints = 100,
}: UseRealTimeMetricsProps) => {
  const [data, setData] = useState<MetricData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3002/metrics/${serverId}/${metricType}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsLoading(false);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const newData: MetricData = JSON.parse(event.data);
        setData(prev => {
          const updated = [...prev, newData];
          return updated.length > maxDataPoints
            ? updated.slice(-maxDataPoints)
            : updated;
        });
      } catch (err) {
        console.error('Failed to parse metric data:', err);
      }
    };

    ws.onerror = (event) => {
      setError('WebSocket connection error');
      setIsLoading(false);
    };

    ws.onclose = () => {
      setIsLoading(false);
    };

    return () => {
      ws.close();
    };
  }, [serverId, metricType, maxDataPoints]);

  const clearData = () => setData([]);

  const getLatestValue = () => data.length > 0 ? data[data.length - 1].value : null;

  const getAverageValue = (timeWindow?: number) => {
    let relevantData = data;

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      relevantData = data.filter(d => d.timestamp >= cutoff);
    }

    if (relevantData.length === 0) return null;

    const sum = relevantData.reduce((acc, d) => acc + d.value, 0);
    return sum / relevantData.length;
  };

  return {
    data,
    isLoading,
    error,
    clearData,
    getLatestValue,
    getAverageValue,
    dataPoints: data.length,
  };
};
```

## 🔧 Utility Scripts

### Configuration Validator

```typescript
// scripts/validateConfig.ts
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const ServerConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  host: z.string().min(1),
  port: z.number().min(1).max(65535),
  protocol: z.enum(['http', 'https', 'ws', 'wss']),
  auth: z.object({
    type: z.enum(['none', 'token', 'basic', 'oauth']),
    credentials: z.string().optional(),
  }).optional(),
  healthCheck: z.object({
    enabled: z.boolean(),
    interval: z.number().min(1000),
    timeout: z.number().min(100),
    endpoint: z.string().optional(),
  }),
  metadata: z.record(z.any()).optional(),
});

const ConfigSchema = z.object({
  version: z.string(),
  servers: z.array(ServerConfigSchema),
  global: z.object({
    logLevel: z.enum(['debug', 'info', 'warn', 'error']),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      enabled: z.boolean(),
      types: z.array(z.string()),
    }).optional(),
  }),
});

export type KortexConfig = z.infer<typeof ConfigSchema>;

class ConfigValidator {
  static validateFile(configPath: string): {
    isValid: boolean;
    errors: string[];
    config?: KortexConfig;
  } {
    try {
      if (!fs.existsSync(configPath)) {
        return {
          isValid: false,
          errors: [`Configuration file not found: ${configPath}`],
        };
      }

      const configContent = fs.readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(configContent);

      const result = ConfigSchema.safeParse(parsedConfig);

      if (result.success) {
        return {
          isValid: true,
          errors: [],
          config: result.data,
        };
      } else {
        return {
          isValid: false,
          errors: result.error.errors.map(err =>
            `${err.path.join('.')}: ${err.message}`
          ),
        };
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static validateEnvironment(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables
    const requiredVars = [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_WS_URL',
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Required environment variable missing: ${varName}`);
      }
    }

    // Check optional but recommended variables
    const recommendedVars = [
      'GITHUB_TOKEN',
      'AZURE_DEVOPS_TOKEN',
    ];

    for (const varName of recommendedVars) {
      if (!process.env[varName]) {
        warnings.push(`Recommended environment variable missing: ${varName}`);
      }
    }

    // Validate URL formats
    const urlVars = [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_WS_URL',
    ];

    for (const varName of urlVars) {
      const value = process.env[varName];
      if (value) {
        try {
          new URL(value);
        } catch {
          errors.push(`Invalid URL format for ${varName}: ${value}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static generateSampleConfig(): KortexConfig {
    return {
      version: '1.0.0',
      servers: [
        {
          id: 'local-dev',
          name: 'Local Development Server',
          host: 'localhost',
          port: 3001,
          protocol: 'http',
          healthCheck: {
            enabled: true,
            interval: 5000,
            timeout: 2000,
            endpoint: '/health',
          },
        },
        {
          id: 'production',
          name: 'Production Server',
          host: 'api.example.com',
          port: 443,
          protocol: 'https',
          auth: {
            type: 'token',
            credentials: 'your-api-token-here',
          },
          healthCheck: {
            enabled: true,
            interval: 10000,
            timeout: 5000,
            endpoint: '/api/health',
          },
        },
      ],
      global: {
        logLevel: 'info',
        theme: 'system',
        notifications: {
          enabled: true,
          types: ['error', 'warning', 'info'],
        },
      },
    };
  }
}

// CLI script usage
if (require.main === module) {
  const configPath = process.argv[2] || './kortex.config.json';

  console.log('🔍 Validating Kortex configuration...\n');

  // Validate configuration file
  const file = ConfigValidator.validateFile(configPath);

  if (file.isValid) {
    console.log('✅ Configuration file is valid');
  } else {
    console.log('❌ Configuration file validation failed:');
    file.errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('');

  // Validate environment
  const env = ConfigValidator.validateEnvironment();

  if (env.isValid) {
    console.log('✅ Environment variables are valid');
  } else {
    console.log('❌ Environment validation failed:');
    env.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (env.warnings.length > 0) {
    console.log('⚠️  Environment warnings:');
    env.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  // Exit with appropriate code
  process.exit(file.isValid && env.isValid ? 0 : 1);
}

export default ConfigValidator;
```

### Performance Monitor Script

```typescript
// scripts/performanceMonitor.ts
import { performance } from 'perf_hooks';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceReport {
  totalTime: number;
  metrics: PerformanceMetric[];
  averages: Record<string, number>;
  slowest: PerformanceMetric[];
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private activeTimers: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): void {
    this.activeTimers.set(name, performance.now());
  }

  endTimer(name: string, metadata?: Record<string, any>): PerformanceMetric | null {
    const startTime = this.activeTimers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`);
      return null;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.activeTimers.delete(name);

    return metric;
  }

  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name, metadata);
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, metadata);
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  getReport(timeWindow?: number): PerformanceReport {
    let relevantMetrics = this.metrics;

    if (timeWindow) {
      const cutoff = Date.now() - timeWindow;
      relevantMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    }

    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);

    // Calculate averages by metric name
    const averages: Record<string, number> = {};
    const groupedMetrics = relevantMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    Object.entries(groupedMetrics).forEach(([name, metrics]) => {
      const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
      averages[name] = sum / metrics.length;
    });

    // Find slowest operations
    const slowest = [...relevantMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      totalTime,
      metrics: relevantMetrics,
      averages,
      slowest,
    };
  }

  exportReport(format: 'json' | 'csv' = 'json', timeWindow?: number): string {
    const report = this.getReport(timeWindow);

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else {
      const headers = ['Name', 'Duration (ms)', 'Timestamp', 'Metadata'];
      const rows = report.metrics.map(m => [
        m.name,
        m.duration.toFixed(2),
        new Date(m.timestamp).toISOString(),
        JSON.stringify(m.metadata || {}),
      ]);

      return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    }
  }

  clear(): void {
    this.metrics = [];
    this.activeTimers.clear();
  }

  // React Hook integration
  static usePerformanceMonitor() {
    const monitor = PerformanceMonitor.getInstance();

    return {
      startTimer: monitor.startTimer.bind(monitor),
      endTimer: monitor.endTimer.bind(monitor),
      measure: monitor.measure.bind(monitor),
      measureAsync: monitor.measureAsync.bind(monitor),
      getReport: monitor.getReport.bind(monitor),
    };
  }
}

// Usage examples:
export const measureComponentRender = (componentName: string) => {
  return function<P extends {}>(Component: React.ComponentType<P>) {
    const MeasuredComponent: React.FC<P> = (props) => {
      const monitor = PerformanceMonitor.getInstance();

      React.useEffect(() => {
        monitor.startTimer(`${componentName}-mount`);
        return () => {
          monitor.endTimer(`${componentName}-mount`);
        };
      }, []);

      monitor.startTimer(`${componentName}-render`);
      const result = React.createElement(Component, props);
      monitor.endTimer(`${componentName}-render`);

      return result;
    };

    MeasuredComponent.displayName = `Measured(${Component.displayName || Component.name})`;
    return MeasuredComponent;
  };
};

export default PerformanceMonitor;
```

## 🧪 Testing Utilities

### Custom Test Utilities

```typescript
// utils/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppContext, AppContextValue } from '@/context/AppContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  contextValue?: Partial<AppContextValue>;
}

const createMockContextValue = (overrides: Partial<AppContextValue> = {}): AppContextValue => ({
  servers: [],
  connectionStatus: 'disconnected',
  notifications: [],
  tasks: [],
  logs: [],
  connectToServer: jest.fn(),
  disconnectFromServer: jest.fn(),
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  removeTask: jest.fn(),
  ...overrides,
});

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { contextValue, ...renderOptions } = options;

  const mockContextValue = createMockContextValue(contextValue);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppContext.Provider value={mockContextValue}>
      {children}
    </AppContext.Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock factories
export const createMockServer = (overrides = {}): Server => ({
  id: 'mock-server-1',
  name: 'Mock Server',
  host: 'localhost',
  port: 3001,
  protocol: 'http',
  status: 'online',
  healthCheck: {
    enabled: true,
    interval: 5000,
    timeout: 2000,
  },
  ...overrides,
});

export const createMockTask = (overrides = {}): Task => ({
  id: 'mock-task-1',
  name: 'Mock Task',
  status: 'pending',
  serverId: 'mock-server-1',
  createdAt: new Date(),
  ...overrides,
});

export const createMockNotification = (overrides = {}): Notification => ({
  id: 'mock-notification-1',
  type: 'info',
  title: 'Mock Notification',
  message: 'This is a mock notification',
  timestamp: new Date(),
  ...overrides,
});
```

### API Mocking Utilities

```typescript
// utils/api-mocks.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  // Servers API
  rest.get('/api/servers', (req, res, ctx) => {
    return res(
      ctx.json([
        createMockServer({ id: '1', name: 'Server 1' }),
        createMockServer({ id: '2', name: 'Server 2', status: 'offline' }),
      ])
    );
  }),

  rest.post('/api/servers', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json(createMockServer({ id: '3', name: 'New Server' }))
    );
  }),

  rest.get('/api/servers/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json(createMockServer({ id, name: `Server ${id}` }))
    );
  }),

  rest.post('/api/servers/:id/connect', (req, res, ctx) => {
    return res(
      ctx.json({ success: true, message: 'Connected successfully' })
    );
  }),

  rest.post('/api/servers/:id/disconnect', (req, res, ctx) => {
    return res(
      ctx.json({ success: true, message: 'Disconnected successfully' })
    );
  }),

  // Health check API
  rest.get('/api/servers/:id/health', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: 150,
      })
    );
  }),

  // Metrics API
  rest.get('/api/servers/:id/metrics', (req, res, ctx) => {
    return res(
      ctx.json({
        responseTime: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (19 - i) * 60000,
          value: Math.random() * 1000 + 100,
        })),
        throughput: Array.from({ length: 20 }, (_, i) => ({
          timestamp: Date.now() - (19 - i) * 60000,
          value: Math.random() * 100 + 10,
        })),
      })
    );
  }),
];

export const server = setupServer(...handlers);

// Test setup helper
export const setupApiMocks = () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};
```

---

!!! tip "TypeScript Development Tips"
    - Use strict TypeScript configuration for better type safety
    - Implement proper error boundaries for React components
    - Use performance monitoring in development to identify bottlenecks
    - Create reusable utilities and hooks for common patterns
    - Write comprehensive tests with proper mocking strategies
