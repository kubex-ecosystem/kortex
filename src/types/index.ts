// Core Types for Kortex Mission Control
export interface MCPServer {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'error' | 'connecting';
  lastSeen: string;
  version?: string;
  description?: string;
  capabilities: string[];
  config: Record<string, any>;
}

export interface GobeConnection {
  id: string;
  url: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastPing: number;
  apiKey?: string;
  version?: string;
}

export interface Task {
  id: string;
  type: 'mcp-operation' | 'server-management' | 'system-check';
  status: 'pending' | 'running' | 'completed' | 'failed';
  title: string;
  description?: string;
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface DashboardMetrics {
  totalServers: number;
  onlineServers: number;
  activeTasks: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
}

export interface KortexState {
  // Connection state
  gobeConnection: GobeConnection | null;
  mcpServers: MCPServer[];

  // Application state
  tasks: Task[];
  logs: LogEntry[];
  notifications: Notification[];
  metrics: DashboardMetrics;

  // UI state
  sidebarOpen: boolean;
  currentView: string;
  theme: 'dark' | 'light';

  // Loading states
  loading: {
    servers: boolean;
    tasks: boolean;
    metrics: boolean;
  };

  // Error states
  errors: {
    connection: string | null;
    servers: string | null;
    general: string | null;
  };
}

export interface KortexActions {
  // Connection actions
  connectToGobe: (url: string, apiKey?: string) => Promise<void>;
  disconnectFromGobe: () => void;

  // Server management
  addMCPServer: (server: Omit<MCPServer, 'id' | 'status' | 'lastSeen'>) => Promise<void>;
  removeMCPServer: (serverId: string) => Promise<void>;
  updateMCPServer: (serverId: string, updates: Partial<MCPServer>) => Promise<void>;
  refreshServers: () => Promise<void>;

  // Task management
  createTask: (task: Omit<Task, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  clearCompletedTasks: () => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;

  // UI actions
  toggleSidebar: () => void;
  setCurrentView: (view: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Error handling
  clearError: (errorType: keyof KortexState['errors']) => void;
  setError: (errorType: keyof KortexState['errors'], message: string) => void;
}

export type KortexContextType = KortexState & KortexActions;
