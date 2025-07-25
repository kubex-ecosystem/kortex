/**
 * Resilient App Context v2.0
 * Context provider defensivo que funciona com ou sem MCP Server
 * Implementa fallbacks, error boundaries e status awareness
 */

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { FALLBACK_DATA, resilientMCPService } from '../lib/resilientMcpService';
import { LogEntry, MCPServerType, Notification, TaskType } from '../types';

// Connection States
type ConnectionStatus = 'checking' | 'online' | 'offline' | 'fallback' | 'error';

// App State Interface
interface AppState {
  // Connection Status
  connectionStatus: ConnectionStatus;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;

  // Data State
  servers: MCPServerType[];
  tasks: TaskType[];
  logs: LogEntry[];
  notifications: Notification[];
  
  // Service Status
  serviceStatus: {
    isOnline: boolean;
    fallbackMode: boolean;
    cacheSize: number;
    activeRetries: number;
  };
}

// Actions
type AppAction = 
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SERVERS'; payload: MCPServerType[] }
  | { type: 'SET_TASKS'; payload: TaskType[] }
  | { type: 'SET_LOGS'; payload: LogEntry[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'UPDATE_SERVICE_STATUS'; payload: any }
  | { type: 'ADD_LOG'; payload: LogEntry }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REFRESH_SUCCESS'; payload: { servers: MCPServerType[]; timestamp: Date } }
  | { type: 'REFRESH_FAILURE'; payload: string };

// Context Type
interface AppContextType extends AppState {
  // Actions
  refreshData: () => Promise<void>;
  reconnect: () => Promise<boolean>;
  addLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  clearError: () => void;
  
  // Status Helpers
  isDataFresh: boolean;
  isUsingFallback: boolean;
  canRetry: boolean;
}

// Initial State
const initialState: AppState = {
  connectionStatus: 'checking',
  lastUpdated: null,
  isLoading: true,
  error: null,
  servers: [],
  tasks: [],
  logs: [],
  notifications: [],
  serviceStatus: {
    isOnline: false,
    fallbackMode: true,
    cacheSize: 0,
    activeRetries: 0
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        connectionStatus: action.payload ? 'error' : state.connectionStatus
      };

    case 'SET_SERVERS':
      return {
        ...state,
        servers: action.payload,
        lastUpdated: new Date()
      };

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      };

    case 'SET_LOGS':
      return {
        ...state,
        logs: action.payload
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      };

    case 'UPDATE_SERVICE_STATUS':
      return {
        ...state,
        serviceStatus: action.payload,
        connectionStatus: action.payload.isOnline ? 'online' : 'fallback'
      };

    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs].slice(0, 100) // Keep only last 100 logs
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 20) // Keep only last 20 notifications
      };

    case 'REFRESH_SUCCESS':
      return {
        ...state,
        servers: action.payload.servers,
        lastUpdated: action.payload.timestamp,
        isLoading: false,
        error: null,
        connectionStatus: 'online'
      };

    case 'REFRESH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        connectionStatus: 'fallback'
      };

    default:
      return state;
  }
}

// Context Creation
const AppContext = createContext<AppContextType | null>(null);

// Provider Component
export const ResilientAppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Refresh data with fallback support
  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Get servers data
      const serversResponse = await resilientMCPService.safeRequest('/servers', {}, {
        fallbackData: FALLBACK_DATA.servers,
        useCache: true,
        maxRetries: 2
      });

      if (serversResponse.success) {
        dispatch({ type: 'SET_SERVERS', payload: serversResponse.data });
        
        // Add log about data source
        const logMessage = serversResponse.isFromFallback 
          ? 'Using demo data (MCP server offline)'
          : serversResponse.isFromCache
          ? 'Loaded from cache'
          : 'Fresh data loaded from MCP server';

        dispatch({ type: 'ADD_LOG', payload: {
          id: `log_${Date.now()}`,
          level: serversResponse.isFromFallback ? 'warning' : 'info',
          message: logMessage,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }});
      }

      // Update service status
      const status = resilientMCPService.getStatus();
      dispatch({ type: 'UPDATE_SERVICE_STATUS', payload: status });

      dispatch({ type: 'REFRESH_SUCCESS', payload: {
        servers: serversResponse.data || [],
        timestamp: new Date()
      }});

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'REFRESH_FAILURE', payload: errorMessage });
      
      // Add error notification
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        id: `notification_${Date.now()}`,
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to load data. Using offline mode.',
        timestamp: new Date().toISOString(),
        read: false
      }});
    }
  }, []);

  // Reconnect attempt
  const reconnect = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'checking' });
    
    try {
      const isConnected = await resilientMCPService.reconnect();
      
      if (isConnected) {
        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          id: `notification_${Date.now()}`,
          type: 'success',
          title: 'Reconnected',
          message: 'Successfully reconnected to MCP server',
          timestamp: new Date().toISOString(),
          read: false
        }});
        
        // Refresh data after reconnect
        await refreshData();
        return true;
      } else {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'offline' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
      return false;
    }
  }, [refreshData]);

  // Add log helper
  const addLog = useCallback((log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_LOG', payload: {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString()
    }});
  }, []);

  // Add notification helper  
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      ...notification,
      id: `notification_${Date.now()}`,
      timestamp: new Date().toISOString()
    }});
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic status check (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const status = resilientMCPService.getStatus();
      dispatch({ type: 'UPDATE_SERVICE_STATUS', payload: status });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Derived state
  const isDataFresh = state.lastUpdated 
    ? (Date.now() - state.lastUpdated.getTime()) < 5 * 60 * 1000 // 5 minutes
    : false;

  const isUsingFallback = state.serviceStatus.fallbackMode || state.connectionStatus === 'fallback';
  const canRetry = !state.isLoading && (state.error || !state.serviceStatus.isOnline);

  const contextValue: AppContextType = {
    ...state,
    refreshData,
    reconnect,
    addLog,
    addNotification,
    clearError,
    isDataFresh,
    isUsingFallback,
    canRetry: state.connectionStatus !== 'checking' ? (canRetry !== false) : false
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use context
export const useResilientApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useResilientApp must be used within ResilientAppProvider');
  }
  return context;
};

// Connection Status Component
export const ConnectionStatusIndicator: React.FC = () => {
  const { connectionStatus, serviceStatus, reconnect, isUsingFallback } = useResilientApp();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return 'text-green-500';
      case 'checking': return 'text-yellow-500';
      case 'fallback': return 'text-orange-500';
      case 'offline': return 'text-red-500';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'online': return 'Online';
      case 'checking': return 'Connecting...';
      case 'fallback': return 'Demo Mode';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`} />
      <span className={getStatusColor()}>{getStatusText()}</span>
      
      {isUsingFallback && (
        <span className="text-xs text-gray-500">
          (Using {serviceStatus.cacheSize > 0 ? 'cached' : 'demo'} data)
        </span>
      )}
      
      {connectionStatus === 'error' || connectionStatus === 'offline' ? (
        <button
          onClick={reconnect}
          className="text-xs text-blue-500 hover:text-blue-600 underline"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
};

export default ResilientAppProvider;
