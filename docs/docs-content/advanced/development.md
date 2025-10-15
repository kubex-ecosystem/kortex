# Development

Complete development guide for contributing to Pulse, including setup, workflows, and best practices.

## 🚀 Getting Started

### Prerequisites

1. **Required Software**

   - **Node.js**: Version 18.0.0 or higher
   - **npm**: Version 8.0.0 or higher (comes with Node.js)
   - **Git**: Latest version
   - **VS Code**: Recommended IDE with extensions

2. **Recommended VS Code Extensions**

   ```json
   {
     "recommendations": [
       "bradlc.vscode-tailwindcss",
       "ms-vscode.vscode-typescript-next",
       "esbenp.prettier-vscode",
       "ms-vscode.vscode-eslint",
       "formulahendry.auto-rename-tag",
       "christian-kohler.path-intellisense",
       "ms-vscode.vscode-json"
     ]
   }
   ```

### Development Environment Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/rafa-mori/pulse.git
   cd pulse
   ```

2. **Install Dependencies**

   ```bash
   # Install project dependencies
   npm install

   # Install documentation dependencies (optional)
   cd docs
   pip install -r requirements.txt
   cd ..
   ```

3. **Environment Configuration**

   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Edit the configuration
   nano .env.local
   ```

   ***Required Environment Variables***

   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
   NEXT_PUBLIC_WS_URL=ws://localhost:3002/ws

   # Development Settings
   NODE_ENV=development
   NEXT_PUBLIC_DEBUG_MODE=true

   # Optional: External Integrations
   GITHUB_TOKEN=your_github_token_here
   AZURE_DEVOPS_TOKEN=your_azure_token_here
   ```

4. **Start Development Server**

   ```bash
   # Start the development server
   npm run dev

   # The application will be available at http://localhost:3000
   ```

## 🛠️ Development Workflow

### Branch Strategy

***Main Branches***

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

***Branch Naming Convention***

```bash
# Features
feature/add-server-monitoring
feature/improve-dashboard-performance

# Bug fixes
bugfix/fix-websocket-connection
bugfix/resolve-memory-leak

# Hot fixes
hotfix/critical-security-patch
hotfix/production-crash-fix
```

### Development Process

1. **Create Feature Branch**

   ```bash
   # Update main branch
   git checkout main
   git pull origin main

   # Create and switch to feature branch
   git checkout -b feature/your-feature-name

   # Push branch to remote
   git push -u origin feature/your-feature-name
   ```

2. **Development Cycle**

   ```bash
   # Start development server
   npm run dev

   # In another terminal, run tests in watch mode
   npm run test:watch

   # Run type checking
   npm run type-check

   # Run linting
   npm run lint
   ```

3. **Code Quality Checks**

   ```bash
   # Before committing, run all checks
   npm run check-all

   # This runs:
   # - TypeScript compilation
   # - ESLint
   # - Prettier formatting
   # - Unit tests
   # - Build verification
   ```

4. **Commit Guidelines**

   **Conventional Commits Format**

   ```bash
   type(scope): description

   # Examples:
   feat(dashboard): add real-time server monitoring
   fix(api): resolve connection timeout issues
   docs(readme): update installation instructions
   style(components): format code with prettier
   refactor(hooks): simplify server connection logic
   test(utils): add tests for validation helpers
   ```

   **Commit Types**

   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code formatting
   - `refactor`: Code refactoring
   - `test`: Adding tests
   - `chore`: Maintenance tasks

5. **Pull Request Process**

```bash
# Push your changes
git push origin feature/your-feature-name

# Create pull request with template
```

***PR Template***

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🧪 Testing Strategy

### Test Structure

```plaintext
tests/
├── __mocks__/          # Jest mocks
├── __fixtures__/       # Test data fixtures
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── utils/            # Test utilities
```

### Unit Testing

***Component Testing Example***

```typescript
// __tests__/components/ServerCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServerCard } from '@/components/ServerCard';
import { createMockServer } from '@/utils/test-utils';

describe('ServerCard', () => {
  const mockProps = {
    server: createMockServer(),
    onConnect: jest.fn(),
    onDisconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders server information correctly', () => {
    render(<ServerCard {...mockProps} />);

    expect(screen.getByText(mockProps.server.name)).toBeInTheDocument();
    expect(screen.getByText(mockProps.server.host)).toBeInTheDocument();
    expect(screen.getByText(mockProps.server.port.toString())).toBeInTheDocument();
  });

  it('calls onConnect when connect button is clicked', async () => {
    render(<ServerCard {...mockProps} />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockProps.onConnect).toHaveBeenCalledWith(mockProps.server.id);
    });
  });

  it('disables connect button when server is connecting', () => {
    const connectingServer = createMockServer({ status: 'connecting' });
    render(<ServerCard {...mockProps} server={connectingServer} />);

    const connectButton = screen.getByRole('button', { name: /connect/i });
    expect(connectButton).toBeDisabled();
  });
});
```

***Hook Testing Example***

```typescript
// __tests__/hooks/useServerConnection.test.ts
import { renderHook, act } from '@testing-library/react';
import { useServerConnection } from '@/hooks/useServerConnection';
import { MockAppContextProvider } from '@/utils/test-utils';

describe('useServerConnection', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockAppContextProvider>{children}</MockAppContextProvider>
  );

  it('connects to server successfully', async () => {
    const { result } = renderHook(
      () => useServerConnection({ serverId: 'test-server-1' }),
      { wrapper }
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
  });

  it('handles connection errors gracefully', async () => {
    // Mock API to throw error
    const mockError = new Error('Connection failed');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(
      () => useServerConnection({ serverId: 'invalid-server' }),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe('Connection failed');
  });
});
```

### Integration Testing

***API Integration Tests***

```typescript
// __tests__/integration/api.test.ts
import { ApiClient } from '@/lib/api';
import { setupApiMocks } from '@/utils/api-mocks';

describe('API Integration', () => {
  setupApiMocks();

  const apiClient = new ApiClient({
    baseUrl: 'http://localhost:3002',
  });

  describe('Server API', () => {
    it('fetches servers list', async () => {
      const response = await apiClient.get('/api/v1/servers');

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('creates new server', async () => {
      const serverData = {
        name: 'Test Server',
        host: 'localhost',
        port: 3001,
        protocol: 'http',
      };

      const response = await apiClient.post('/api/v1/servers', serverData);

      expect(response.success).toBe(true);
      expect(response.data).toMatchObject(serverData);
      expect(response.data.id).toBeDefined();
    });

    it('handles API errors correctly', async () => {
      try {
        await apiClient.get('/api/v1/nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('404');
      }
    });
  });
});
```

### End-to-End Testing

***Playwright E2E Tests***

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays dashboard correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pulse Dashboard');
    await expect(page.locator('[data-testid="server-grid"]')).toBeVisible();
  });

  test('can add new server', async ({ page }) => {
    // Click add server button
    await page.click('[data-testid="add-server-btn"]');

    // Fill server form
    await page.fill('[data-testid="server-name"]', 'Test Server');
    await page.fill('[data-testid="server-host"]', 'localhost');
    await page.fill('[data-testid="server-port"]', '3001');

    // Submit form
    await page.click('[data-testid="submit-server"]');

    // Verify server appears in list
    await expect(page.locator('[data-testid="server-card"]')).toContainText('Test Server');
  });

  test('can connect to server', async ({ page }) => {
    // Assume server exists
    await page.click('[data-testid="connect-btn"]:first-child');

    // Wait for connection
    await expect(page.locator('[data-testid="server-status"]')).toContainText('Connected');
  });
});
```

## 📦 Build and Deployment

### Build Process

***Development Build***

```bash
# Development build with hot reload
npm run dev

# Type checking in watch mode
npm run type-check:watch

# Linting with auto-fix
npm run lint:fix
```

***Production Build***

```bash
# Build for production
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run analyze
```

***Build Configuration***

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
```

### Deployment Strategies

***Static Site Deployment (GitHub Pages)***

```bash
# Build static site
npm run build

# Deploy to GitHub Pages
npm run deploy
```

***Docker Deployment***

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

***CI/CD Pipeline***

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:ci
      - run: npm run build

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## 🔧 Development Tools

### Code Quality Tools

***ESLint Configuration***

```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

***Prettier Configuration***

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

***Husky Git Hooks***

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test:ci"
    }
  }
}
```

### Development Scripts

***Package.json Scripts***

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "analyze": "ANALYZE=true npm run build",
    "check-all": "npm run type-check && npm run lint && npm run test:ci && npm run build"
  }
}
```

## 🤝 Contributing Guidelines

### Code Style

***TypeScript Guidelines***

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` type, use `unknown` when needed

***React Guidelines***

- Use functional components with hooks
- Implement proper prop types with TypeScript
- Use React.memo for performance optimization
- Handle loading and error states

***Component Guidelines***

- Single responsibility principle
- Composable design patterns
- Consistent naming conventions
- Comprehensive prop documentation

### Documentation

***Code Documentation***

```typescript
/**
 * Connects to a server and manages the connection state
 * @param serverId - Unique identifier for the server
 * @param options - Connection configuration options
 * @returns Connection management utilities
 * @example
 * ```tsx
 * const { connect, disconnect, isConnected } = useServerConnection({
 *   serverId: 'server-1',
 *   autoReconnect: true
 * });
 * ```
 */
export const useServerConnection = (
  serverId: string,
  options: ConnectionOptions = {}
) => {
  // Implementation
};
```

***README Updates***

- Keep installation instructions current
- Update feature descriptions
- Include usage examples
- Maintain changelog

### Issue Reporting

***Bug Report Template***

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What should have happened

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96.0]
- Node.js: [e.g., 18.12.0]
- npm: [e.g., 8.19.2]
```

***Feature Request Template***

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why this feature would be valuable

## Implementation Ideas
Suggestions for how it could be implemented

## Alternatives Considered
Other approaches you've considered
```

---

!!! tip "Development Best Practices"
    - Write tests before implementing features (TDD)
    - Keep commits small and focused
    - Use meaningful commit messages
    - Update documentation with code changes
    - Run all quality checks before pushing
    - Review your own pull requests first
