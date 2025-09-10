// Application Constants
export const APP_CONFIG = {
  name: 'Kortex',
  version: '2.0.0',
  description: 'Mission Control Center for Kubex Ecosystem',
  author: 'Rafael Mori',
  repository: 'https://github.com/kubex-ecosystem/kortex',
} as const;

export const GOBE_CONFIG = {
  defaultUrl: 'http://localhost:8080',
  defaultWsUrl: 'ws://localhost:8080/ws',
  healthCheckInterval: 30000,
  reconnectAttempts: 5,
  reconnectDelay: 2000,
} as const;

export const MCP_CONFIG = {
  defaultHost: 'localhost',
  defaultPort: 3001,
  connectionTimeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const UI_CONFIG = {
  sidebarWidth: 280,
  headerHeight: 64,
  animationDuration: 200,
  toastDuration: 5000,
  refreshInterval: 10000,
} as const;

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export const TASK_TYPES = {
  MCP_OPERATION: 'mcp-operation',
  SERVER_MANAGEMENT: 'server-management',
  SYSTEM_CHECK: 'system-check',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  ERROR: 'error',
} as const;

export const SERVER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
  CONNECTING: 'connecting',
} as const;

export const SYSTEM_HEALTH = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export const VIEWS = {
  DASHBOARD: 'dashboard',
  SERVERS: 'servers',
  TASKS: 'tasks',
  LOGS: 'logs',
  SETTINGS: 'settings',
} as const;

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
} as const;
