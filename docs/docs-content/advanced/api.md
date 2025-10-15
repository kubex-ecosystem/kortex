# API Reference

Comprehensive API documentation for Pulse integrations and endpoints.

## 🌐 Core API Overview

Pulseinterfaces with multiple APIs to provide unified monitoring and management:

- **GitHub API**: Repository monitoring, Actions workflows, Issues tracking
- **Azure DevOps API**: Pipeline monitoring, Work items, Releases
- **MCP Protocol**: Model Context Protocol server management
- **Internal API**: Dashboard state, Configuration, Real-time updates

## 🔑 Authentication

### GitHub API Authentication

```typescript
interface GitHubAuth {
  token: string;        // Personal Access Token
  type: 'token';        // Authentication type
}

// Usage example
const githubClient = new GitHubClient({
  auth: {
    token: process.env.GITHUB_TOKEN,
    type: 'token'
  }
});
```

### Azure DevOps Authentication

```typescript
interface AzureAuth {
  token: string;           // Personal Access Token
  organization: string;    // Azure DevOps organization
}

// Usage example
const azureClient = new AzureClient({
  auth: {
    token: process.env.AZURE_DEVOPS_TOKEN,
    organization: process.env.AZURE_DEVOPS_ORG
  }
});
```

## 📊 GitHub API Integration

### Repository Information

```typescript
// GET /api/v1/github/repos/{owner}/{repo}
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  updated_at: string;
  private: boolean;
}
```

### Workflow Runs

```typescript
// GET /api/v1/github/repos/{owner}/{repo}/actions/runs
interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out';
  workflow_id: number;
  created_at: string;
  updated_at: string;
  run_number: number;
  event: string;
  actor: {
    login: string;
    avatar_url: string;
  };
}
```

### Issues and Pull Requests

```typescript
// GET /api/v1/github/repos/{owner}/{repo}/issues
interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  pull_request?: {
    url: string;
    html_url: string;
  };
}
```

## 🔷 Azure DevOps API Integration

### Pipeline Information

```typescript
// GET /api/v1/azure/pipelines/{project}/{pipelineId}
interface AzurePipeline {
  id: number;
  name: string;
  revision: number;
  folder: string;
  project: {
    id: string;
    name: string;
  };
  configuration: {
    type: 'yaml' | 'designerJson';
    path?: string;
  };
  url: string;
}
```

### Build Runs

```typescript
// GET /api/v1/azure/builds/{project}
interface AzureBuild {
  id: number;
  buildNumber: string;
  status: 'inProgress' | 'completed' | 'cancelling' | 'postponed' | 'notStarted';
  result: 'succeeded' | 'partiallySucceeded' | 'failed' | 'canceled';
  queueTime: string;
  startTime: string;
  finishTime: string;
  definition: {
    id: number;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  sourceBranch: string;
  sourceVersion: string;
  requestedBy: {
    displayName: string;
    imageUrl: string;
  };
}
```

### Work Items

```typescript
// GET /api/v1/azure/workitems/{project}
interface AzureWorkItem {
  id: number;
  rev: number;
  fields: {
    'System.WorkItemType': string;
    'System.Title': string;
    'System.AssignedTo': {
      displayName: string;
      imageUrl: string;
    };
    'System.State': string;
    'System.AreaPath': string;
    'System.IterationPath': string;
    'System.CreatedDate': string;
    'System.ChangedDate': string;
    'Microsoft.VSTS.Common.Priority': number;
    'Microsoft.VSTS.Common.Severity': string;
  };
  url: string;
}
```

## 🔗 MCP Protocol Integration

### Server Registration

```typescript
// POST /api/v1/mcp/servers
interface MCPServerRegistration {
  id: string;
  name: string;
  endpoint: string;
  port: number;
  protocol: 'http' | 'https' | 'ws' | 'wss';
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key';
    credentials: string;
  };
  config: {
    healthCheck: {
      path: string;
      interval: number;
      timeout: number;
    };
    metadata: Record<string, any>;
  };
}
```

### Server Status

```typescript
// GET /api/v1/mcp/servers/{serverId}/status
interface MCPServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'unknown';
  health: {
    lastCheck: string;
    responseTime: number;
    uptime: number;
    errorCount: number;
  };
  metrics: {
    requestCount: number;
    errorRate: number;
    averageResponseTime: number;
  };
  connection: {
    established: string;
    lastActivity: string;
    reconnectCount: number;
  };
}
```

### MCP Commands

```typescript
// POST /api/v1/mcp/servers/{serverId}/execute
interface MCPCommand {
  command: string;
  parameters: Record<string, any>;
  timeout?: number;
  async?: boolean;
}

interface MCPCommandResult {
  id: string;
  command: string;
  status: 'success' | 'error' | 'timeout';
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  executionTime: number;
  timestamp: string;
}
```

## 📡 WebSocket API

### Real-time Events

```typescript
// WebSocket connection: /api/v1/ws
interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: string;
  source: 'github' | 'azure' | 'mcp' | 'system';
}

// Event types
interface ServerStatusEvent extends WebSocketEvent {
  type: 'server.status';
  payload: {
    serverId: string;
    status: MCPServerStatus;
  };
}

interface BuildCompleteEvent extends WebSocketEvent {
  type: 'build.complete';
  payload: {
    buildId: number;
    result: 'succeeded' | 'failed' | 'canceled';
    duration: number;
  };
}

interface WorkflowEvent extends WebSocketEvent {
  type: 'workflow.run';
  payload: {
    workflowId: number;
    status: 'started' | 'completed' | 'failed';
    repository: string;
  };
}
```

### WebSocket Client Usage

```typescript
class KortexWebSocket {
  private ws: WebSocket;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('Connected to PulseWebSocket');
    };

    this.ws.onmessage = (event) => {
      const message: WebSocketEvent = JSON.parse(event.data);
      this.handleEvent(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.reconnect();
    };
  }

  private handleEvent(event: WebSocketEvent) {
    switch (event.type) {
      case 'server.status':
        this.updateServerStatus(event as ServerStatusEvent);
        break;
      case 'build.complete':
        this.handleBuildComplete(event as BuildCompleteEvent);
        break;
      case 'workflow.run':
        this.handleWorkflowEvent(event as WorkflowEvent);
        break;
    }
  }
}
```

## 🔄 Rate Limiting

### GitHub API Limits

```typescript
interface GitHubRateLimit {
  core: {
    limit: number;        // 5000 for authenticated users
    remaining: number;
    reset: number;        // Unix timestamp
    used: number;
  };
  search: {
    limit: number;        // 30 for authenticated users
    remaining: number;
    reset: number;
    used: number;
  };
  graphql: {
    limit: number;        // 5000 points per hour
    remaining: number;
    reset: number;
    used: number;
  };
}
```

### Azure DevOps Limits

```typescript
interface AzureRateLimit {
  requestsPerSecond: number;    // ~200 requests per second
  dailyLimit: number;           // Organization-specific
  remaining: number;
  resetTime: string;
}
```

### Rate Limit Handling

```typescript
class RateLimitManager {
  private static async handleRateLimit(
    service: 'github' | 'azure',
    response: Response
  ): Promise<void> {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const resetTime = response.headers.get('X-RateLimit-Reset');

      if (retryAfter) {
        await this.delay(parseInt(retryAfter) * 1000);
      } else if (resetTime) {
        const delay = parseInt(resetTime) * 1000 - Date.now();
        await this.delay(Math.max(delay, 0));
      }
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 🛡️ Error Handling

### Standardized Error Response

```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
  service: 'github' | 'azure' | 'mcp' | 'internal';
}

// Common error codes
enum ErrorCodes {
  AUTHENTICATION_FAILED = 'AUTH_001',
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  SERVICE_UNAVAILABLE = 'SVC_001',
  INVALID_REQUEST = 'REQ_001',
  TIMEOUT = 'TIME_001',
  UNKNOWN_ERROR = 'ERR_001'
}
```

### Error Recovery Strategies

```typescript
class ErrorRecoveryService {
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;

        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('All retry attempts failed');
  }
}
```

## 🧪 API Testing

### Test Utilities

```typescript
// Test GitHub API connection
export async function testGitHubConnection(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'PulseDashboard'
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Test Azure DevOps connection
export async function testAzureConnection(
  token: string,
  organization: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://dev.azure.com/${organization}/_apis/projects?api-version=7.0`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`:${token}`)}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Test MCP server health
export async function testMCPHealth(
  endpoint: string,
  healthPath: string = '/health'
): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}${healthPath}`, {
      timeout: 5000
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
```

### Integration Tests

```bash
# Run API integration tests
npm run test:api

# Test specific integrations
npm run test:github
npm run test:azure
npm run test:mcp

# Test WebSocket connections
npm run test:websocket

# Test rate limiting
npm run test:rate-limits
```

## 📈 Performance Optimization

### API Response Caching

```typescript
interface CacheStrategy {
  key: string;
  ttl: number;              // Time to live in milliseconds
  strategy: 'memory' | 'localStorage' | 'sessionStorage';
  invalidation?: string[];  // Events that invalidate cache
}

class APICache {
  private static cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>();

  static async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    return data;
  }
}
```

### Request Batching

```typescript
class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{
      resolve: (value: any) => void;
      reject: (error: any) => void;
    }>;
    timer: NodeJS.Timeout;
  }>();

  async batchRequest<T>(
    batchKey: string,
    request: () => Promise<T[]>,
    delay: number = 100
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, {
          requests: [],
          timer: setTimeout(() => this.executeBatch(batchKey, request), delay)
        });
      }

      const batch = this.batches.get(batchKey)!;
      batch.requests.push({ resolve, reject });
    });
  }

  private async executeBatch<T>(
    batchKey: string,
    request: () => Promise<T[]>
  ) {
    const batch = this.batches.get(batchKey);
    if (!batch) return;

    try {
      const results = await request();
      batch.requests.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      batch.requests.forEach(req => {
        req.reject(error);
      });
    }

    this.batches.delete(batchKey);
  }
}
```

---

*Next: Explore [advanced features](../advanced/customization.md) or check [troubleshooting](../guide/troubleshooting.md).*
