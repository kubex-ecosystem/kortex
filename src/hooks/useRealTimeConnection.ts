/**
 * 🔥 useRealTimeConnection Hook
 * Conexão WebSocket real com Kosmos + StatusRafa MCP
 * Sistema resiliente que funciona online e offline
 */

import { useCallback, useEffect, useState } from 'react';
import { useWebSocket, WebSocketEventMap, websocketManager } from '../lib/websocketManager';

interface RealTimeConnectionConfig {
  kosmosUrl?: string;
  statusRafaUrl?: string;
  mcpServerUrl?: string;
  autoConnect?: boolean;
  retryOnFailure?: boolean;
}

interface RealTimeStatus {
  kosmos: 'connected' | 'connecting' | 'disconnected' | 'error';
  statusRafa: 'connected' | 'connecting' | 'disconnected' | 'error';
  websocket: 'connected' | 'connecting' | 'disconnected' | 'error';
  overall: 'online' | 'partial' | 'offline' | 'demo';
}

export function useRealTimeConnection(config: RealTimeConnectionConfig = {}) {
  const {
    kosmosUrl = 'ws://localhost:8001', // Nosso mock server!
    statusRafaUrl = 'ws://localhost:3002/ws', 
    mcpServerUrl = 'ws://localhost:3001/ws',
    autoConnect = true,
    retryOnFailure = true
  } = config;

  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState<RealTimeStatus>({
    kosmos: 'disconnected',
    statusRafa: 'disconnected', 
    websocket: 'disconnected',
    overall: 'offline'
  });

  const [lastConnectedUrl, setLastConnectedUrl] = useState<string | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  
  // Use the WebSocket hook
  const ws = useWebSocket();

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add connection log
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setConnectionLogs(prev => [...prev.slice(-9), logEntry]); // Keep last 10 logs
    console.log(`🔗 WebSocket: ${logEntry}`);
  }, []);

  // Update overall status based on individual statuses
  const updateOverallStatus = useCallback((newStatus: Partial<RealTimeStatus>) => {
    setStatus(prev => {
      const updated = { ...prev, ...newStatus };
      
      // Calculate overall status
      if (updated.websocket === 'connected' && (updated.kosmos === 'connected' || updated.statusRafa === 'connected')) {
        updated.overall = 'online';
      } else if (updated.websocket === 'connected' || updated.kosmos === 'connected' || updated.statusRafa === 'connected') {
        updated.overall = 'partial';
      } else if (updated.websocket === 'connecting' || updated.kosmos === 'connecting' || updated.statusRafa === 'connecting') {
        updated.overall = 'offline'; // Still trying to connect
      } else {
        updated.overall = 'demo'; // Using fallback data
      }
      
      return updated;
    });
  }, []);

  // Try to connect to the best available server
  const connectToBestServer = useCallback(async () => {
    if (!isClient) return false;

    const servers = [
      { url: kosmosUrl, name: 'Kosmos', type: 'kosmos' as const },
      { url: statusRafaUrl, name: 'StatusRafa MCP', type: 'statusRafa' as const },
      { url: mcpServerUrl, name: 'FastMCP', type: 'websocket' as const }
    ];

    addLog('🔍 Scanning for available servers...');
    
    for (const server of servers) {
      try {
        updateOverallStatus({ [server.type]: 'connecting' });
        addLog(`🔄 Attempting to connect to ${server.name}...`);
        
        const connected = await websocketManager.connect(server.url);
        
        if (connected) {
          updateOverallStatus({ [server.type]: 'connected' });
          setLastConnectedUrl(server.url);
          addLog(`✅ Connected to ${server.name} successfully!`);
          
          // Set up event listeners
          setupEventListeners();
          return true;
        }
      } catch (error) {
        updateOverallStatus({ [server.type]: 'error' });
        addLog(`❌ Failed to connect to ${server.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    addLog('🔴 All servers unavailable - switching to demo mode');
    updateOverallStatus({ overall: 'demo' });
    return false;
  }, [isClient, kosmosUrl, statusRafaUrl, mcpServerUrl, addLog, updateOverallStatus]);

  // Set up WebSocket event listeners
  const setupEventListeners = useCallback(() => {
    // Listen for server status updates
    const unsubscribeServerStatus = websocketManager.on('server:status', (data) => {
      addLog(`📊 Server status update: ${data.serverId} is ${data.status}`);
    });

    // Listen for pipeline updates
    const unsubscribePipeline = websocketManager.on('pipeline:update', (data) => {
      addLog(`🚀 Pipeline update: ${data.pipelineId} at ${data.stage} (${data.status})`);
    });

    // Listen for system alerts
    const unsubscribeAlerts = websocketManager.on('system:alert', (data) => {
      addLog(`🔔 ${data.type.toUpperCase()}: ${data.message}`);
    });

    // Listen for metrics updates
    const unsubscribeMetrics = websocketManager.on('metrics:update', (data) => {
      addLog(`📈 Metrics update from ${data.source}`);
    });

    // Return cleanup function
    return () => {
      unsubscribeServerStatus();
      unsubscribePipeline();
      unsubscribeAlerts();
      unsubscribeMetrics();
    };
  }, [addLog]);

  // Auto-connect on mount
  useEffect(() => {
    if (!isClient || !autoConnect) return;

    addLog('🚀 Starting real-time connection...');
    connectToBestServer();

    // Cleanup on unmount
    return () => {
      websocketManager.disconnect();
      addLog('🔌 Disconnected from all servers');
    };
  }, [isClient, autoConnect, connectToBestServer, addLog]);

  // Manual connection methods
  const connect = useCallback(async () => {
    return await connectToBestServer();
  }, [connectToBestServer]);

  const disconnect = useCallback(() => {
    websocketManager.disconnect();
    updateOverallStatus({
      kosmos: 'disconnected',
      statusRafa: 'disconnected',
      websocket: 'disconnected',
      overall: 'demo'
    });
    addLog('🔌 Manually disconnected');
  }, [updateOverallStatus, addLog]);

  // Send real-time event
  const sendEvent = useCallback(<T extends keyof WebSocketEventMap>(
    event: T, 
    data: WebSocketEventMap[T]
  ) => {
    const sent = websocketManager.send(event, data);
    if (sent) {
      addLog(`📤 Sent ${String(event)} event`);
    } else {
      addLog(`❌ Failed to send ${String(event)} event - not connected`);
    }
    return sent;
  }, [addLog]);

  // Subscribe to events
  const subscribe = useCallback(<T extends keyof WebSocketEventMap>(
    event: T,
    callback: (data: WebSocketEventMap[T]) => void
  ) => {
    return websocketManager.on(event, callback);
  }, []);

  return {
    // Status
    status,
    isConnected: status.overall === 'online',
    isPartiallyConnected: status.overall === 'partial',
    isDemoMode: status.overall === 'demo',
    lastConnectedUrl,
    connectionLogs,
    
    // WebSocket info
    websocketStatus: ws,
    
    // Actions
    connect,
    disconnect,
    sendEvent,
    subscribe,
    
    // Utils
    addLog
  };
}

export default useRealTimeConnection;
