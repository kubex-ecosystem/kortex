import { useState, useEffect, useRef, useCallback } from 'react';
import { MCPServerConfig, RateLimitStatus, PollingControl } from '../types';

interface WebSocketMessage {
  type: string;
  data?: any;
  provider?: string;
  timestamp: string;
  alert?: boolean;
  reason?: string;
  percentage?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  serverConfig: MCPServerConfig | null;
  rateLimitStatus: Record<string, RateLimitStatus>;
  pollingStatus: PollingControl | null;
  alerts: WebSocketMessage[];
  reconnect: () => void;
  clearAlerts: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [serverConfig, setServerConfig] = useState<MCPServerConfig | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<Record<string, RateLimitStatus>>({});
  const [pollingStatus, setPollingStatus] = useState<PollingControl | null>(null);
  const [alerts, setAlerts] = useState<WebSocketMessage[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'initial_state':
          if (message.data?.server_config) {
            setServerConfig(message.data.server_config);
          }
          break;
        
        case 'rate_limit_update':
          if (message.provider && message.data) {
            setRateLimitStatus(prev => ({
              ...prev,
              [message.provider!]: message.data
            }));
            
            // Add alert if percentage is high
            if (message.alert && message.data.current?.percentage > 80) {
              setAlerts(prev => [...prev.slice(-4), message]); // Keep last 5 alerts
            }
          }
          break;
        
        case 'polling_status':
          if (message.data) {
            setPollingStatus(message.data);
          }
          break;
        
        case 'auto_pause':
          // Add auto-pause alert
          setAlerts(prev => [...prev.slice(-4), message]);
          break;
        
        case 'pong':
          // Handle ping/pong for connection health
          break;
        
        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
                // Send initial ping
        wsRef.current?.send(JSON.stringify({ type: 'ping' }));
      };
      
      wsRef.current.onmessage = handleMessage;
      
      wsRef.current.onclose = (event) => {
        console.log('❌ WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Auto-reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current); // Exponential backoff
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setIsConnected(false);
    }
  }, [url, handleMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // Ping interval to keep connection alive
  useEffect(() => {
    let pingInterval: NodeJS.Timeout;
    
    if (isConnected && wsRef.current) {
      pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Ping every 30 seconds
    }
    
    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [isConnected]);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    serverConfig,
    rateLimitStatus,
    pollingStatus,
    alerts,
    reconnect,
    clearAlerts
  };
};
