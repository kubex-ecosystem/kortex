# Best Practices

Comprehensive guide to best practices for using Kortex effectively in production environments.

## 🏗️ Architecture Best Practices

### Component Design Principles

***Single Responsibility Principle***

Each component should have one clear purpose:

```typescript
// ✅ Good - Single responsibility
interface ServerStatusProps {
  serverId: string;
  refreshInterval?: number;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ serverId, refreshInterval = 5000 }) => {
  // Only handles server status display
};

// ❌ Avoid - Multiple responsibilities
const ServerDashboard = () => {
  // Handles status, logs, metrics, configuration, etc.
};
```

***Composition Over Inheritance***

Build complex UIs by composing smaller components:

```typescript
// ✅ Good - Composable design
const Dashboard = () => (
  <DashboardLayout>
    <ServerGrid servers={servers} />
    <MetricsPanel metrics={metrics} />
    <LogsPanel logs={recentLogs} />
  </DashboardLayout>
);

// ❌ Avoid - Monolithic component
class AllInOneDashboard extends Component {
  // Hundreds of lines mixing concerns
}
```

### State Management Best Practices

***Context Usage***

Use React Context for truly global state:

```typescript
// ✅ Good - Global application state
interface AppContextValue {
  servers: Server[];
  connectionStatus: ConnectionStatus;
  notifications: Notification[];
}

// ❌ Avoid - Local component state in context
interface BadContextValue {
  inputValue: string;        // Component-specific
  isModalOpen: boolean;      // Component-specific
  selectedTab: string;       // Component-specific
}
```

***State Normalization***

Normalize complex state structures:

```typescript
// ✅ Good - Normalized state
interface ServersState {
  byId: Record<string, Server>;
  allIds: string[];
  loading: boolean;
  error: string | null;
}

// ❌ Avoid - Nested arrays
interface BadServersState {
  servers: Array<{
    id: string;
    name: string;
    environments: Array<{
      id: string;
      tasks: Array<Task>;
    }>;
  }>;
}
```

## 🔒 Security Best Practices

### API Security

***Token Management***

```typescript
// ✅ Good - Secure token handling
class TokenManager {
  private static instance: TokenManager;
  private tokens: Map<string, Token> = new Map();

  storeToken(key: string, token: Token): void {
    // Encrypt before storing
    const encrypted = this.encrypt(token);
    this.tokens.set(key, encrypted);
  }

  private encrypt(data: any): Token {
    // Implementation with proper encryption
  }
}

// ❌ Avoid - Plain text storage
const tokens = {
  github: 'ghp_plaintext_token',
  azure: 'plain_text_azure_token'
};
```

***Input Validation***

```typescript
// ✅ Good - Proper validation
interface CreateServerRequest {
  name: string;
  host: string;
  port: number;
}

const validateServerRequest = (data: unknown): CreateServerRequest => {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const { name, host, port } = data as any;

  if (!name || typeof name !== 'string' || name.length > 100) {
    throw new ValidationError('Invalid server name');
  }

  if (!host || typeof host !== 'string' || !isValidHost(host)) {
    throw new ValidationError('Invalid host');
  }

  if (!port || typeof port !== 'number' || port < 1 || port > 65535) {
    throw new ValidationError('Invalid port');
  }

  return { name, host, port };
};

// ❌ Avoid - No validation
const createServer = (data: any) => {
  // Direct usage without validation
  return new Server(data.name, data.host, data.port);
};
```

### Environment Configuration

***Secure Defaults***

```typescript
// ✅ Good - Secure configuration
const config = {
  // Secure defaults
  enableHttps: process.env.NODE_ENV === 'production',
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  
  // Required environment variables
  apiUrl: requireEnvVar('API_URL'),
  secretKey: requireEnvVar('SECRET_KEY'),
};

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

// ❌ Avoid - Insecure defaults
const badConfig = {
  enableHttps: false,              // Always insecure
  sessionTimeout: 86400 * 365,     // 1 year - too long
  apiUrl: 'http://localhost:3000', // Hardcoded
};
```

## 🚀 Performance Best Practices

### Component Optimization

***Memoization***

```typescript
// ✅ Good - Proper memoization
const ServerCard = React.memo<ServerCardProps>(({ server, onConnect }) => {
  const handleConnect = useCallback(() => {
    onConnect(server.id);
  }, [server.id, onConnect]);

  const statusColor = useMemo(() => {
    return getStatusColor(server.status);
  }, [server.status]);

  return (
    <Card>
      <ServerStatus color={statusColor} />
      <ConnectButton onClick={handleConnect} />
    </Card>
  );
});

// ❌ Avoid - Unnecessary re-renders
const BadServerCard = ({ server, onConnect }) => {
  // Creates new function on every render
  const handleConnect = () => onConnect(server.id);
  
  // Recalculates on every render
  const statusColor = getStatusColor(server.status);
  
  return <Card>...</Card>;
};
```

***Lazy Loading***

```typescript
// ✅ Good - Code splitting
const LogsPanel = lazy(() => import('./LogsPanel'));
const MetricsChart = lazy(() => import('./MetricsChart'));

const Dashboard = () => (
  <Suspense fallback={<Loading />}>
    <LogsPanel />
    <MetricsChart />
  </Suspense>
);

// ✅ Good - Data lazy loading
const useServers = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async (offset: number) => {
    setLoading(true);
    try {
      const newServers = await api.getServers({ offset, limit: 20 });
      setServers(prev => [...prev, ...newServers]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { servers, loading, loadMore };
};
```

### API Optimization

***Request Batching***

```typescript
// ✅ Good - Batch multiple requests
class BatchedApiClient {
  private batchQueue: Array<{ url: string; resolve: Function; reject: Function }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  async get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ url, resolve, reject });
      
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, 10); // 10ms batch window
      }
    });
  }

  private async processBatch(): Promise<void> {
    const batch = this.batchQueue.splice(0);
    this.batchTimeout = null;

    try {
      const responses = await Promise.all(
        batch.map(item => fetch(item.url))
      );
      
      batch.forEach((item, index) => {
        item.resolve(responses[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

// ❌ Avoid - Individual requests
const badApproach = async () => {
  const server1 = await api.getServer('1');
  const server2 = await api.getServer('2');
  const server3 = await api.getServer('3');
  // Each request waits for the previous one
};
```

***Caching Strategy***

```typescript
// ✅ Good - Smart caching
class CachedApiClient {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  async get(url: string, ttl = 300000): Promise<any> { // 5 minutes default TTL
    const cached = this.cache.get(url);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await fetch(url).then(res => res.json());
    
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
      ttl
    });

    return data;
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}
```

## 🧪 Testing Best Practices

### Unit Testing

***Test Structure***

```typescript
// ✅ Good - Clear test structure
describe('ServerCard', () => {
  describe('when server is online', () => {
    it('should display green status indicator', () => {
      const server = createMockServer({ status: 'online' });
      render(<ServerCard server={server} />);
      
      expect(screen.getByTestId('status-indicator')).toHaveClass('text-green-500');
    });

    it('should enable connect button', () => {
      const server = createMockServer({ status: 'online' });
      render(<ServerCard server={server} />);
      
      expect(screen.getByRole('button', { name: /connect/i })).toBeEnabled();
    });
  });

  describe('when server is offline', () => {
    it('should display red status indicator', () => {
      const server = createMockServer({ status: 'offline' });
      render(<ServerCard server={server} />);
      
      expect(screen.getByTestId('status-indicator')).toHaveClass('text-red-500');
    });

    it('should disable connect button', () => {
      const server = createMockServer({ status: 'offline' });
      render(<ServerCard server={server} />);
      
      expect(screen.getByRole('button', { name: /connect/i })).toBeDisabled();
    });
  });
});

// ❌ Avoid - Unclear test structure
describe('ServerCard', () => {
  it('should work correctly', () => {
    // Tests multiple things without clear separation
  });
});
```

***Mock Best Practices***

```typescript
// ✅ Good - Focused mocks
const mockApiClient = {
  getServers: jest.fn(),
  connectToServer: jest.fn(),
  disconnectFromServer: jest.fn(),
} as jest.Mocked<ApiClient>;

beforeEach(() => {
  jest.clearAllMocks();
  mockApiClient.getServers.mockResolvedValue([]);
});

// ✅ Good - Factory functions for test data
const createMockServer = (overrides: Partial<Server> = {}): Server => ({
  id: 'test-server-1',
  name: 'Test Server',
  host: 'localhost',
  port: 3001,
  status: 'online',
  ...overrides,
});

// ❌ Avoid - Overmocking
jest.mock('entire-library'); // Mocks everything, loses type safety
```

### Integration Testing

***API Testing***

```typescript
// ✅ Good - Integration test with setup/teardown
describe('Server API Integration', () => {
  let testServer: TestServer;
  let apiClient: ApiClient;

  beforeAll(async () => {
    testServer = await createTestServer();
    apiClient = new ApiClient(testServer.url);
  });

  afterAll(async () => {
    await testServer.close();
  });

  beforeEach(async () => {
    await testServer.reset();
  });

  it('should create and retrieve server', async () => {
    const serverData = {
      name: 'Test Server',
      host: 'localhost',
      port: 3001,
    };

    const created = await apiClient.createServer(serverData);
    expect(created).toMatchObject(serverData);

    const retrieved = await apiClient.getServer(created.id);
    expect(retrieved).toEqual(created);
  });
});
```

## 📦 Deployment Best Practices

### Environment Management

***Multi-Environment Configuration***

```typescript
// ✅ Good - Environment-specific configs
interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  features: Record<string, boolean>;
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    apiUrl: 'http://localhost:3001',
    wsUrl: 'ws://localhost:3001/ws',
    logLevel: 'debug',
    features: {
      mockData: true,
      debugPanel: true,
    },
  },
  staging: {
    apiUrl: 'https://staging-api.kortex.example.com',
    wsUrl: 'wss://staging-api.kortex.example.com/ws',
    logLevel: 'info',
    features: {
      mockData: false,
      debugPanel: true,
    },
  },
  production: {
    apiUrl: 'https://api.kortex.example.com',
    wsUrl: 'wss://api.kortex.example.com/ws',
    logLevel: 'warn',
    features: {
      mockData: false,
      debugPanel: false,
    },
  },
};

export const getConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || 'development';
  return environments[env] || environments.development;
};
```

### Monitoring and Observability

***Structured Logging***

```typescript
// ✅ Good - Structured logging
interface LogContext {
  userId?: string;
  serverId?: string;
  requestId?: string;
  component?: string;
}

class Logger {
  static info(message: string, context: LogContext = {}): void {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    }));
  }

  static error(message: string, error: Error, context: LogContext = {}): void {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      ...context,
    }));
  }
}

// Usage
Logger.info('Server connection established', { 
  serverId: 'server-123',
  component: 'ServerManager' 
});

// ❌ Avoid - Unstructured logging
console.log('User clicked button'); // No context
console.log('Error:', error); // No structure
```

***Health Checks***

```typescript
// ✅ Good - Comprehensive health checks
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Record<string, {
    status: 'pass' | 'fail';
    time: number;
    output?: string;
  }>;
}

class HealthChecker {
  async checkHealth(): Promise<HealthCheckResult> {
    const checks: Record<string, any> = {};
    
    // Database connectivity
    checks.database = await this.checkDatabase();
    
    // External API availability
    checks.externalApis = await this.checkExternalApis();
    
    // Memory usage
    checks.memory = await this.checkMemoryUsage();
    
    const overallStatus = this.determineOverallStatus(checks);
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private determineOverallStatus(checks: Record<string, any>): 'healthy' | 'degraded' | 'unhealthy' {
    const results = Object.values(checks);
    const failures = results.filter(check => check.status === 'fail');
    
    if (failures.length === 0) return 'healthy';
    if (failures.length <= results.length / 2) return 'degraded';
    return 'unhealthy';
  }
}
```

---

!!! tip "Remember"
    - Document architectural decisions
    - Regular code reviews for best practices
    - Automated testing in CI/CD pipeline
    - Monitor performance metrics continuously
    - Keep dependencies updated and secure
