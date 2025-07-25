/**
 * WebSocket Manager v1.0
 * Sistema de broadcasting e real-time para Kortex
 * Implementa reconnect automático e event subscription
 */

import { useEffect, useState } from 'react';

export interface WebSocketEventMap {
  'server:status': { serverId: string; status: 'online' | 'offline' | 'error'; timestamp: string };
  'pipeline:update': { pipelineId: string; stage: string; status: string; progress?: number };
  'user:action': { userId: string; action: string; target: string; timestamp: string };
  'system:alert': { type: 'info' | 'warning' | 'error' | 'success'; message: string; title?: string };
  'deployment:status': { deploymentId: string; status: string; environment: string };
  'chat:message': { userId: string; message: string; room: string; timestamp: string };
  'metrics:update': { source: string; metrics: Record<string, number>; timestamp: string };
}

type EventListener<T extends keyof WebSocketEventMap> = (data: WebSocketEventMap[T]) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 1000; // Start with 1 second
  private maxReconnectInterval: number = 30000; // Max 30 seconds
  
  private subscribers: Map<keyof WebSocketEventMap, Set<EventListener<any>>> = new Map();
  private isReconnecting: boolean = false;
  private lastHeartbeat: number = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  private status: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private url: string = '';

  constructor() {
    // Initialize event maps
    Object.keys(this.getEventTypes()).forEach(event => {
      this.subscribers.set(event as keyof WebSocketEventMap, new Set());
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(url: string): Promise<boolean> {
    this.url = url;
    
    return new Promise((resolve, reject) => {
      try {
        if (this.ws?.readyState === WebSocket.OPEN) {
          resolve(true);
          return;
        }

        this.status = 'connecting';
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.info('🟢 WebSocket connected to', url);
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.reconnectInterval = 1000;
          this.isReconnecting = false;
          
          this.startHeartbeat();
          this.emit('system:alert', {
            type: 'success',
            title: 'Connected',
            message: 'Real-time updates enabled'
          });
          
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.warn('🔴 WebSocket disconnected:', event.code, event.reason);
          this.status = 'disconnected';
          this.stopHeartbeat();
          
          if (!this.isReconnecting) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('🔴 WebSocket error:', error);
          this.status = 'error';
          this.stopHeartbeat();
          reject(error);
        };

      } catch (error) {
        this.status = 'error';
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.status = 'disconnected';
    this.isReconnecting = false;
  }

  /**
   * Subscribe to specific event type
   */
  on<T extends keyof WebSocketEventMap>(event: T, listener: EventListener<T>): () => void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.add(listener);
    }

    // Return unsubscribe function
    return () => {
      if (eventSubscribers) {
        eventSubscribers.delete(listener);
      }
    };
  }

  /**
   * Unsubscribe from event
   */
  off<T extends keyof WebSocketEventMap>(event: T, listener?: EventListener<T>): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      if (listener) {
        eventSubscribers.delete(listener);
      } else {
        eventSubscribers.clear();
      }
    }
  }

  /**
   * Send message to server
   */
  send<T extends keyof WebSocketEventMap>(event: T, data: WebSocketEventMap[T]): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ event, data, timestamp: Date.now() }));
        return true;
      } catch (error) {
        console.error('🔴 Failed to send WebSocket message:', error);
        return false;
      }
    }
    
    console.warn('🔴 WebSocket not connected, message not sent');
    return false;
  }

  /**
   * Broadcast event to local subscribers (for internal events)
   */
  emit<T extends keyof WebSocketEventMap>(event: T, data: WebSocketEventMap[T]): void {
    const eventSubscribers = this.subscribers.get(event);
    if (eventSubscribers) {
      eventSubscribers.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`🔴 Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      status: this.status,
      isConnected: this.status === 'connected',
      reconnectAttempts: this.reconnectAttempts,
      subscribersCount: Array.from(this.subscribers.values())
        .reduce((total, set) => total + set.size, 0),
      lastHeartbeat: this.lastHeartbeat
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      // Handle heartbeat
      if (parsed.event === 'heartbeat') {
        this.lastHeartbeat = Date.now();
        return;
      }

      // Emit event to subscribers
      if (parsed.event && parsed.data) {
        this.emit(parsed.event, parsed.data);
      }
    } catch (error) {
      console.error('🔴 Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🔴 Max reconnection attempts reached');
      this.emit('system:alert', {
        type: 'error',
        title: 'Connection Lost',
        message: 'Unable to reconnect to real-time server'
      });
      return;
    }

    this.isReconnecting = true;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts),
      this.maxReconnectInterval
    );

    console.info(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.url).catch(() => {
        this.scheduleReconnect();
      });
    }, delay);
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    this.heartbeatInterval = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > 35000) { // 35 second timeout
        console.warn('🔴 WebSocket heartbeat timeout');
        this.ws?.close();
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get available event types
   */
  private getEventTypes(): WebSocketEventMap {
    return {} as WebSocketEventMap;
  }
}

// Singleton instance
export const websocketManager = new WebSocketManager();

// React hook for WebSocket integration
export function useWebSocket() {
  const [status, setStatus] = useState(() => websocketManager.getStatus());
  
  useEffect(() => {
    const updateStatus = () => {
      setStatus(websocketManager.getStatus());
    };

    // Update status periodically
    const interval = setInterval(updateStatus, 1000);
    
    // Listen for status changes
    const unsubscribe = websocketManager.on('system:alert', updateStatus);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return {
    ...status,
    connect: websocketManager.connect.bind(websocketManager),
    disconnect: websocketManager.disconnect.bind(websocketManager),
    send: websocketManager.send.bind(websocketManager),
    on: websocketManager.on.bind(websocketManager),
    off: websocketManager.off.bind(websocketManager)
  };
}

export default WebSocketManager;
