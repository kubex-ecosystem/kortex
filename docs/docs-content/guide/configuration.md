# Configuration Guide

This comprehensive guide covers all configuration options for Pulse, from basic setup to advanced customization.

## 🚀 Quick Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
# Required: API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3002/ws

# Optional: Service Integrations
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
AZURE_DEVOPS_TOKEN=xxxxxxxxxxxxxxxxxxxx

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENABLE_AUTO_REFRESH=true
NEXT_PUBLIC_DEBUG_MODE=false
```

### Configuration

Pulse automatically validates your configuration on startup:

```typescript
interface KortexConfig {
  apiBaseUrl: string;
  wsUrl: string;
  features: {
    websockets: boolean;
    autoRefresh: boolean;
    debugMode: boolean;
  };
  integrations: {
    github: {
      enabled: boolean;
      token?: string;
    };
    azure: {
      enabled: boolean;
      token?: string;
    };
  };
}
```

## 🔌 Service Integration Setup

### GitHub Integration

#### Personal Access Token Setup

1. **Navigate to GitHub Settings**:
   - Go to GitHub.com → Settings → Developer settings → Personal access tokens

2. **Create New Token**:

   ```bash
   # Required scopes for Pulse
   repo              # Repository access
   user              # User information
   read:org          # Organization data
   workflow          # GitHub Actions
   ```

3. **Configure in Pulse**:

   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

#### Advanced GitHub Configuration

```typescript
// Optional: Custom GitHub configuration
const githubConfig = {
  apiVersion: '2022-11-28',
  userAgent: 'Pulse-Dashboard/1.0',
  timeout: 10000,
  retries: 3,
  rateLimit: {
    warning: 0.8,    // Warn at 80% usage
    pause: 0.95      // Pause at 95% usage
  }
};
```

### Azure DevOps Integration

#### Personal Access Token (PAT) Setup

1. **Create PAT in Azure DevOps**:
   - Organization Settings → Personal Access Tokens

2. **Required Scopes**:

   ```plaintext
   Build (read)           # Pipeline information
   Project and team (read) # Project details
   Work Items (read)      # Work item data
   Release (read)         # Release information
   ```

3. **Configure in Environment**:

   ```env
   AZURE_DEVOPS_TOKEN=your_pat_here
   AZURE_DEVOPS_ORGANIZATION=your-org-name
   ```

#### Azure DevOps Configuration

```typescript
interface AzureConfig {
  organization: string;
  apiVersion: '7.0';
  timeout: 15000;
  projects: string[];  // Specific projects to monitor
  excludeBuilds?: string[];  // Build definitions to exclude
}
```

### MCP Server Configuration

#### Server Registration

```typescript
interface MCPServerConfig {
  id: string;
  name: string;
  endpoint: string;
  port: number;
  protocol: 'http' | 'https' | 'ws' | 'wss';
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key';
    credentials: string;
  };
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
}
```

#### Example MCP Configuration

```yaml
# config/mcp-servers.yml
servers:
  - id: "kosmos-server"
    name: "Kosmos MCP Server"
    endpoint: "http://localhost:8000"
    protocol: "http"
    healthCheck:
      path: "/health"
      interval: 30000
      timeout: 5000

  - id: "production-mcp"
    name: "Production MCP"
    endpoint: "https://mcp.example.com"
    protocol: "https"
    authentication:
      type: "bearer"
      credentials: "${MCP_TOKEN}"
    healthCheck:
      path: "/api/v1/health"
      interval: 60000
      timeout: 10000
```

## 🛠️ Advanced Configuration

### WebSocket Configuration

```typescript
interface WebSocketConfig {
  url: string;
  options: {
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    maxReconnectionAttempts: number;
    timeout: number;
    forceNew: boolean;
  };
  events: {
    connect: () => void;
    disconnect: (reason: string) => void;
    error: (error: Error) => void;
    message: (data: any) => void;
  };
}
```

### Performance Tuning

#### Update Intervals

```typescript
const updateConfig = {
  intervals: {
    dashboard: 300000,      // 5 minutes
    serverHealth: 180000,   // 3 minutes
    apiLimits: 60000,      // 1 minute
    criticalAlerts: 30000   // 30 seconds
  },

  // Adaptive intervals based on activity
  adaptive: {
    enabled: true,
    factors: {
      errorRate: 1.5,      // Slow down when errors occur
      responseTime: 1.2,   // Slow down for slow responses
      userActivity: 0.8    // Speed up when user is active
    }
  }
};
```

#### Caching Strategy

```typescript
interface CacheConfig {
  strategy: 'memory' | 'localStorage' | 'sessionStorage';
  ttl: {
    dashboard: 300000,     // 5 minutes
    servers: 180000,       // 3 minutes
    static: 3600000        // 1 hour
  };
  maxSize: {
    memory: 50,           // 50 MB
    localStorage: 10      // 10 MB
  };
}
```

## 📊 Monitoring Configuration

### Alert Thresholds

```yaml
# config/alerts.yml
thresholds:
  api_rate_limit:
    github:
      warning: 80    # 80% of rate limit
      critical: 95   # 95% of rate limit
    azure:
      warning: 75
      critical: 90

  response_time:
    warning: 1000    # 1 second
    critical: 5000   # 5 seconds

  error_rate:
    warning: 5       # 5% error rate
    critical: 15     # 15% error rate

  server_health:
    unhealthy_threshold: 3  # Failed health checks
    timeout: 10000          # 10 seconds
```

### Notification Configuration

```typescript
interface NotificationConfig {
  channels: {
    browser: {
      enabled: boolean;
      permission: 'granted' | 'denied' | 'default';
    };
    toast: {
      enabled: boolean;
      duration: number;
      position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    };
    email: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
    };
    webhook: {
      enabled: boolean;
      url: string;
      headers: Record<string, string>;
    };
  };
}
```

## 🎯 Environment-Specific Configurations

### Development Environment

```env
# .env.development
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3002/ws
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_MOCK_MODE=true

# Development-specific features
NEXT_PUBLIC_HOT_RELOAD=true
NEXT_PUBLIC_SOURCE_MAPS=true
NEXT_PUBLIC_ERROR_OVERLAY=true
```

### Staging Environment

```env
# .env.staging
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://staging-api.example.com
NEXT_PUBLIC_WS_URL=wss://staging-api.example.com/ws
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_MODE=false

# Staging-specific monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Production Environment

```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.pulse.example.com
NEXT_PUBLIC_WS_URL=wss://api.pulseexample.com/ws
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_MOCK_MODE=false

# Production optimizations
NEXT_PUBLIC_CDN_URL=https://cdn.pulseexample.com
NEXT_PUBLIC_CACHE_STRATEGY=aggressive
NEXT_PUBLIC_MONITORING=full
```

## 🔒 Security Configuration

### API Security

```typescript
interface SecurityConfig {
  cors: {
    origin: string[];
    credentials: boolean;
    optionsSuccessStatus: number;
  };

  rateLimit: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };

  helmet: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
    hsts: boolean;
    noSniff: boolean;
  };
}
```

### Token Management

```typescript
// Secure token storage
class TokenManager {
  private static encryptToken(token: string): string {
    // Implement encryption
    return btoa(token); // Simplified example
  }

  static storeToken(service: string, token: string): void {
    const encrypted = this.encryptToken(token);
    localStorage.setItem(`kortex_${service}_token`, encrypted);
  }

  static getToken(service: string): string | null {
    const encrypted = localStorage.getItem(`kortex_${service}_token`);
    return encrypted ? atob(encrypted) : null;
  }
}
```

## 📱 UI/UX Configuration

### Theme Configuration

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
}
```

### Layout Configuration

```typescript
interface LayoutConfig {
  sidebar: {
    width: number;
    collapsible: boolean;
    defaultCollapsed: boolean;
  };

  header: {
    height: number;
    sticky: boolean;
    showBreadcrumbs: boolean;
  };

  content: {
    maxWidth: number;
    padding: number;
    spacing: number;
  };

  responsive: {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
}
```

## 🔧 Configuration

### Runtime

```typescript
import { z } from 'zod';

const configSchema = z.object({
  apiBaseUrl: z.string().url(),
  wsUrl: z.string().url(),
  github: z.object({
    token: z.string().optional(),
  }).optional(),
  azure: z.object({
    token: z.string().optional(),
    organization: z.string().optional(),
  }).optional(),
  features: z.object({
    websockets: z.boolean().default(true),
    autoRefresh: z.boolean().default(true),
    debugMode: z.boolean().default(false),
  }),
});

export function validateConfig(config: unknown) {
  return configSchema.parse(config);
}
```

### Configuration Testing

```bash
# Test configuration
npm run config:validate

# Test specific integration
npm run test:github-integration
npm run test:azure-integration

# Test WebSocket connection
npm run test:websocket
```

## 🔍 Troubleshooting Configuration

### Common Issues

#### Environment Variables Not Loading

```bash
# Check if .env.local exists
ls -la .env*

# Verify environment variables
env | grep NEXT_PUBLIC

# Debug configuration loading
npm run debug:config
```

#### Token Authentication Issues

```bash
# Test GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Test Azure DevOps token
curl -u ":$AZURE_DEVOPS_TOKEN" \
  https://dev.azure.com/$ORGANIZATION/_apis/projects?api-version=7.0
```

#### WebSocket Connection Problems

```javascript
// Debug WebSocket in browser console
const ws = new WebSocket('ws://localhost:3002/ws');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
ws.onmessage = (event) => console.log('Message:', event.data);
```

---

*Next: Learn about [workflows](workflows.md) or explore [advanced features](../advanced/api.md).*
