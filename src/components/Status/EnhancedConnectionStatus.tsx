/**
 * Connection Status Widget
 * Shows real-time connection status for MCP and WebSocket
 * Includes retry buttons and data freshness indicators
 */

import { AlertCircle, CheckCircle, Clock, RefreshCw, Wifi } from 'lucide-react';
import React from 'react';
import { useResilientApp } from '../../context/ResilientAppContext';
import { useWebSocket } from '../../lib/websocketManager';

export const EnhancedConnectionStatus: React.FC = () => {
  const { 
    connectionStatus, 
    lastUpdated, 
    isDataFresh, 
    isUsingFallback, 
    canRetry, 
    reconnect,
    refreshData,
    error 
  } = useResilientApp();
  
  const websocket = useWebSocket();

  const getStatusColor = () => {
    if (websocket.isConnected) return 'text-green-500 bg-green-500';
    if (connectionStatus === 'online') return 'text-blue-500 bg-blue-500';
    if (connectionStatus === 'checking') return 'text-yellow-500 bg-yellow-500';
    if (connectionStatus === 'fallback') return 'text-orange-500 bg-orange-500';
    return 'text-red-500 bg-red-500';
  };

  const getStatusText = () => {
    if (websocket.isConnected) return 'Live';
    if (connectionStatus === 'online') return 'Online';
    if (connectionStatus === 'checking') return 'Connecting...';
    if (connectionStatus === 'fallback') return 'Demo Mode';
    return 'Offline';
  };

  const getDataAge = () => {
    if (!lastUpdated) return 'Never';
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  const handleReconnect = async () => {
    if (websocket.status === 'disconnected') {
      try {
        await websocket.connect('ws://localhost:3001/ws'); // Kosmos WebSocket
      } catch (error) {
        console.warn('WebSocket connection failed, falling back to HTTP polling');
      }
    }
    
    if (canRetry) {
      await reconnect();
      await refreshData();
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Connection Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor().split(' ')[1]} animate-pulse`} />
        <span className={`text-sm font-medium ${getStatusColor().split(' ')[0]}`}>
          {getStatusText()}
        </span>
      </div>

      {/* WebSocket Status */}
      {websocket.isConnected && (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <Wifi className="w-3 h-3" />
          <span>Real-time</span>
        </div>
      )}

      {/* Data Source Indicator */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        {isUsingFallback ? (
          <>
            <AlertCircle className="w-3 h-3" />
            <span>Demo Data</span>
          </>
        ) : isDataFresh ? (
          <>
            <CheckCircle className="w-3 h-3" />
            <span>Fresh Data</span>
          </>
        ) : (
          <>
            <Clock className="w-3 h-3" />
            <span>Cached Data</span>
          </>
        )}
      </div>

      {/* Data Age */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Updated: {getDataAge()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          <span className="truncate max-w-32" title={error}>
            {error.length > 20 ? `${error.substring(0, 20)}...` : error}
          </span>
        </div>
      )}

      {/* Reconnect Button */}
      {(canRetry || !websocket.isConnected) && (
        <button
          onClick={handleReconnect}
          className="flex items-center gap-1 px-2 py-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reconnect</span>
        </button>
      )}

      {/* WebSocket Subscribers Count */}
      {websocket.subscribersCount > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {websocket.subscribersCount} listeners
        </div>
      )}
    </div>
  );
};

// Simple version for header/navbar
export const SimpleConnectionStatus: React.FC = () => {
  const { connectionStatus, isUsingFallback } = useResilientApp();
  const websocket = useWebSocket();

  const getStatusColor = () => {
    if (websocket.isConnected) return 'bg-green-500';
    if (connectionStatus === 'online') return 'bg-blue-500';
    if (connectionStatus === 'checking') return 'bg-yellow-500 animate-pulse';
    if (connectionStatus === 'fallback') return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (websocket.isConnected) return 'Live';
    if (connectionStatus === 'online') return 'Online';
    if (connectionStatus === 'checking') return 'Connecting';
    if (connectionStatus === 'fallback') return 'Demo';
    return 'Offline';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {getStatusText()}
      </span>
      {websocket.isConnected && (
        <Wifi className="w-3 h-3 text-green-500" />
      )}
    </div>
  );
};

// Notification Component for WebSocket alerts
export const WebSocketNotifications: React.FC = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const websocket = useWebSocket();

  React.useEffect(() => {
    const unsubscribe = websocket.on('system:alert', (alert) => {
      const notification = {
        id: Date.now(),
        ...alert,
        timestamp: new Date()
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    });

    return unsubscribe;
  }, [websocket]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg shadow-lg border transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {notification.type === 'info' && <Wifi className="w-4 h-4" />}
            <div>
              {notification.title && (
                <div className="font-medium text-sm">{notification.title}</div>
              )}
              <div className="text-xs">{notification.message}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedConnectionStatus;
