import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AppContextType, AppProvider, useApp } from '../context/AppContext';

const contextValue: AppContextType = useApp();

// Mock data generators
export const createMockServer = (overrides = {}) => ({
  id: 'mock-server-1',
  name: 'Mock Server',
  hostname: 'localhost',
  port: 3001,
  status: 'Online',
  responseTime: 120,
  lastSeen: new Date().toISOString(),
  version: '1.0.0',
  capabilities: ['mock', 'testing'],
  endpoints: 5,
  activeConnections: 2,
  totalRequests: 100,
  errors: 0,
  ...overrides,
})

export const createMockTask = (overrides = {}) => ({
  id: 'mock-task-1',
  name: 'Mock Task',
  status: 'pending',
  serverId: 'mock-server-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  progress: 0,
  ...overrides,
})

export const createMockNotification = (overrides = {}) => ({
  id: 'mock-notification-1',
  type: 'info',
  title: 'Mock Notification',
  message: 'This is a mock notification',
  timestamp: new Date(),
  read: false,
  ...overrides,
})

export const createMockLog = (overrides = {}) => ({
  id: 'mock-log-1',
  level: 'info',
  message: 'Mock log entry',
  timestamp: new Date(),
  source: 'test',
  ...overrides,
})

// Mock context provider
const createMockAppContext = (overrides: Partial<typeof contextValue> = {}) => ({
  // Connection status
  isConnected: false,
  isLoading: false,
  error: null,

  // Server state
  servers: [],
  
  // Notifications
  notifications: [],
  
  // Tasks
  tasks: [],
  
  // Logs
  logs: [],
  
  // Actions
  connect: jest.fn(),
  disconnect: jest.fn(),
  addServer: jest.fn(),
  updateServer: jest.fn(),
  removeServer: jest.fn(),
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  markNotificationRead: jest.fn(),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  removeTask: jest.fn(),
  addLog: jest.fn(),
  removeLog: jest.fn(),
  
  ...overrides,
})

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  contextValue?: Partial<AppContextType>
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {
    contextValue: useApp(),
  },
) {
  // Destructure contextValue and other render options
  const { contextValue, ...renderOptions } = options

  // Create a mock context value with defaults if not provided
  const defaultContextValue = contextValue || { ...useApp() };
  
  // Create a mock context value with the provided overrides
  // or the default context value
  const createMockAppContext = (overrides: Partial<AppContextType> = {}) => ({
    ...defaultContextValue,
    ...overrides,
  });

  // Create a mock context value
  const mockContextValue = createMockAppContext(contextValue);
  
  // Create a wrapper component that provides the context
  // and renders the UI
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AppProvider {...mockContextValue}>
      {children}
    </AppProvider>
  );

  // Render the UI with the custom wrapper
  // and any additional render options
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Helper to create test props
export const createTestProps = (overrides = {}) => ({
  'data-testid': 'test-component',
  ...overrides,
})

// Helper for async testing
export const waitForElement = async (getByTestId: any, testId: string, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkElement = () => {
      try {
        const element = getByTestId(testId)
        resolve(element)
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element with testId "${testId}" not found within ${timeout}ms`))
        } else {
          setTimeout(checkElement, 100)
        }
      }
    }
    
    checkElement()
  })
}

// Helper for testing hooks
export const renderHookWithProviders = (hook: () => any, contextValue?: Partial<AppContextType>) => {
  const mockContextValue = createMockAppContext(contextValue)
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider {...mockContextValue}>
      {children}
    </AppProvider>
  )
  
  return { wrapper, mockContextValue }
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Export our custom render as the default
export { renderWithProviders as render };

