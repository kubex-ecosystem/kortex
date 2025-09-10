import { createContext, ReactNode, useContext, useReducer } from 'react';
import * as gobe from '../services/gobe/api';
import { CONNECTION_STATUS, SERVER_STATUS, THEMES, VIEWS } from '../constants/index';
import { GobeConnection, KortexContextType, KortexState, MCPServer, Notification, Task } from '../types/index';

// Initial state
const initialState: KortexState = {
  gobeConnection: null,
  mcpServers: [],
  tasks: [],
  logs: [],
  notifications: [],
  metrics: {
    totalServers: 0,
    onlineServers: 0,
    activeTasks: 0,
    systemHealth: 'healthy',
    uptime: 0,
    responseTime: 0,
  },
  sidebarOpen: true,
  currentView: VIEWS.DASHBOARD,
  theme: THEMES.DARK,
  loading: {
    servers: false,
    tasks: false,
    metrics: false,
  },
  errors: {
    connection: null,
    servers: null,
    general: null,
  },
};

// Action types
type KortexAction =
  | { type: 'SET_GOBE_CONNECTION'; payload: GobeConnection | null }
  | { type: 'SET_MCP_SERVERS'; payload: MCPServer[] }
  | { type: 'ADD_MCP_SERVER'; payload: MCPServer }
  | { type: 'UPDATE_MCP_SERVER'; payload: { id: string; updates: Partial<MCPServer> } }
  | { type: 'REMOVE_MCP_SERVER'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_METRICS'; payload: Partial<KortexState['metrics']> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_CURRENT_VIEW'; payload: string }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_LOADING'; payload: { key: keyof KortexState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof KortexState['errors']; message: string | null } }
  | { type: 'CLEAR_ERROR'; payload: keyof KortexState['errors'] };

// Reducer
function kortexReducer(state: KortexState, action: KortexAction): KortexState {
  switch (action.type) {
    case 'SET_GOBE_CONNECTION':
      return { ...state, gobeConnection: action.payload };

    case 'SET_MCP_SERVERS':
      return {
        ...state,
        mcpServers: action.payload,
        metrics: {
          ...state.metrics,
          totalServers: action.payload.length,
          onlineServers: action.payload.filter(s => s.status === SERVER_STATUS.ONLINE).length,
        }
      };

    case 'ADD_MCP_SERVER':
      const newServers = [...state.mcpServers, action.payload];
      return {
        ...state,
        mcpServers: newServers,
        metrics: {
          ...state.metrics,
          totalServers: newServers.length,
          onlineServers: newServers.filter(s => s.status === SERVER_STATUS.ONLINE).length,
        }
      };

    case 'UPDATE_MCP_SERVER':
      const updatedServers = state.mcpServers.map(server =>
        server.id === action.payload.id
          ? { ...server, ...action.payload.updates }
          : server
      );
      return {
        ...state,
        mcpServers: updatedServers,
        metrics: {
          ...state.metrics,
          onlineServers: updatedServers.filter(s => s.status === SERVER_STATUS.ONLINE).length,
        }
      };

    case 'REMOVE_MCP_SERVER':
      const filteredServers = state.mcpServers.filter(server => server.id !== action.payload);
      return {
        ...state,
        mcpServers: filteredServers,
        metrics: {
          ...state.metrics,
          totalServers: filteredServers.length,
          onlineServers: filteredServers.filter(s => s.status === SERVER_STATUS.ONLINE).length,
        }
      };

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        metrics: {
          ...state.metrics,
          activeTasks: action.payload.filter(t => t.status === 'running' || t.status === 'pending').length,
        }
      };

    case 'ADD_TASK':
      const newTasks = [...state.tasks, action.payload];
      return {
        ...state,
        tasks: newTasks,
        metrics: {
          ...state.metrics,
          activeTasks: newTasks.filter(t => t.status === 'running' || t.status === 'pending').length,
        }
      };

    case 'UPDATE_TASK':
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        metrics: {
          ...state.metrics,
          activeTasks: updatedTasks.filter(t => t.status === 'running' || t.status === 'pending').length,
        }
      };

    case 'REMOVE_TASK':
      const filteredTasks = state.tasks.filter(task => task.id !== action.payload);
      return {
        ...state,
        tasks: filteredTasks,
        metrics: {
          ...state.metrics,
          activeTasks: filteredTasks.filter(t => t.status === 'running' || t.status === 'pending').length,
        }
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload }
      };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.message }
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload]: null }
      };

    default:
      return state;
  }
}

// Context
const KortexContext = createContext<KortexContextType | undefined>(undefined);

// Provider component
interface KortexProviderProps {
  children: ReactNode;
}

export function KortexProvider({ children }: KortexProviderProps) {
  const [state, dispatch] = useReducer(kortexReducer, initialState);

  // Actions
  const actions = {
    connectToGobe: async (url: string, apiKey?: string) => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'servers', value: true } });

      try {
        const connection: GobeConnection = {
          id: 'gobe-main',
          url,
          status: CONNECTION_STATUS.CONNECTING as any,
          lastPing: Date.now(),
          apiKey,
        };

        dispatch({ type: 'SET_GOBE_CONNECTION', payload: connection });

        // Try health endpoint (optional)
        const health = await gobe.getHealth();

        dispatch({
          type: 'SET_GOBE_CONNECTION', payload: {
            ...connection,
            status: CONNECTION_STATUS.CONNECTED as any,
            version: health?.version,
          }
        });

        dispatch({ type: 'CLEAR_ERROR', payload: 'connection' });
      } catch (error) {
        dispatch({
          type: 'SET_ERROR', payload: {
            key: 'connection',
            message: `Failed to connect to GoBE: ${error}`
          }
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'servers', value: false } });
      }
    },

    disconnectFromGobe: () => {
      dispatch({ type: 'SET_GOBE_CONNECTION', payload: null });
      dispatch({ type: 'SET_MCP_SERVERS', payload: [] });
    },

    addMCPServer: async (serverData: Omit<MCPServer, 'id' | 'status' | 'lastSeen'>) => {
      const server: MCPServer = {
        ...serverData,
        id: `mcp-${Date.now()}`,
        status: SERVER_STATUS.CONNECTING as any,
        lastSeen: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_MCP_SERVER', payload: server });

      // Simulate connection process
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MCP_SERVER', payload: {
            id: server.id,
            updates: { status: SERVER_STATUS.ONLINE as any, lastSeen: new Date().toISOString() }
          }
        });
      }, 2000);
    },

    removeMCPServer: async (serverId: string) => {
      dispatch({ type: 'REMOVE_MCP_SERVER', payload: serverId });
    },

    updateMCPServer: async (serverId: string, updates: Partial<MCPServer>) => {
      dispatch({ type: 'UPDATE_MCP_SERVER', payload: { id: serverId, updates } });
    },

    refreshServers: async () => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'servers', value: true } });

      try {
        const servers = await gobe.listServers();
        dispatch({ type: 'SET_MCP_SERVERS', payload: servers });
        dispatch({ type: 'CLEAR_ERROR', payload: 'servers' });
      } catch (e: any) {
        // keep previous simulated state; just record error
        dispatch({ type: 'SET_ERROR', payload: { key: 'servers', message: String(e?.message || e) } });
      }

      dispatch({ type: 'SET_LOADING', payload: { key: 'servers', value: false } });
    },

    createTask: async (taskData: Omit<Task, 'id' | 'status' | 'progress' | 'createdAt' | 'updatedAt'>) => {
      const task: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_TASK', payload: task });
    },

    cancelTask: async (taskId: string) => {
      dispatch({
        type: 'UPDATE_TASK', payload: {
          id: taskId,
          updates: { status: 'failed', error: 'Cancelled by user' }
        }
      });
    },

    clearCompletedTasks: () => {
      const completedTasks = state.tasks.filter(t => t.status === 'completed' || t.status === 'failed');
      completedTasks.forEach(task => {
        dispatch({ type: 'REMOVE_TASK', payload: task.id });
      });
    },

    addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const notification: Notification = {
        ...notificationData,
        id: `notification-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },

    markNotificationRead: (notificationId: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    },

    clearNotifications: () => {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    },

    toggleSidebar: () => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    },

    setCurrentView: (view: string) => {
      dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    },

    setTheme: (theme: 'dark' | 'light') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },

    clearError: (errorType: keyof KortexState['errors']) => {
      dispatch({ type: 'CLEAR_ERROR', payload: errorType });
    },

    setError: (errorType: keyof KortexState['errors'], message: string) => {
      dispatch({ type: 'SET_ERROR', payload: { key: errorType, message } });
    },
  };

  const contextValue: KortexContextType = {
    ...state,
    ...actions,
  };

  return (
    <KortexContext.Provider value={contextValue}>
      {children}
    </KortexContext.Provider>
  );
}

// Hook to use the context
export function useKortex(): KortexContextType {
  const context = useContext(KortexContext);
  if (context === undefined) {
    throw new Error('useKortex must be used within a KortexProvider');
  }
  return context;
}
