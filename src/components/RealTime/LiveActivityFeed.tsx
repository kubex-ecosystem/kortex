/**
 * 🔥 LiveActivityFeed Component
 * Feed em tempo real dos eventos WebSocket
 */

import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    GitBranch,
    Server,
    User,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRealTimeConnection } from '../../hooks/useRealTimeConnection';
import { WebSocketEventMap } from '../../lib/websocketManager';

interface ActivityEvent {
  id: string;
  type: keyof WebSocketEventMap;
  data: any;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
}

interface LiveActivityFeedProps {
  maxEvents?: number;
  className?: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ 
  maxEvents = 10,
  className = '' 
}) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const { subscribe, status } = useRealTimeConnection();

  // Função para criar evento formatado
  const createEvent = (type: keyof WebSocketEventMap, data: any): ActivityEvent => {
    const baseEvent = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: new Date()
    };

    switch (type) {
      case 'server:status':
        return {
          ...baseEvent,
          icon: <Server className="w-4 h-4" />,
          color: data.status === 'online' ? 'text-green-600' : 'text-red-600',
          title: 'Server Status Change',
          description: `${data.serverId} is now ${data.status}`
        };

      case 'pipeline:update':
        return {
          ...baseEvent,
          icon: <Activity className="w-4 h-4" />,
          color: data.status === 'success' ? 'text-green-600' : 
                 data.status === 'failed' ? 'text-red-600' : 'text-blue-600',
          title: 'Pipeline Update',
          description: `${data.pipelineId} at ${data.stage} (${data.status}${data.progress ? ` ${data.progress}%` : ''})`
        };

      case 'user:action':
        return {
          ...baseEvent,
          icon: <User className="w-4 h-4" />,
          color: 'text-purple-600',
          title: 'User Activity',
          description: `${data.userId} performed ${data.action} on ${data.target}`
        };

      case 'system:alert':
        return {
          ...baseEvent,
          icon: data.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                data.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                <Zap className="w-4 h-4" />,
          color: data.type === 'success' ? 'text-green-600' :
                 data.type === 'error' ? 'text-red-600' :
                 data.type === 'warning' ? 'text-yellow-600' : 'text-blue-600',
          title: data.title || 'System Alert',
          description: data.message
        };

      case 'metrics:update':
        return {
          ...baseEvent,
          icon: <BarChart3 className="w-4 h-4" />,
          color: 'text-indigo-600',
          title: 'Metrics Update',
          description: `${data.source}: ${Object.keys(data.metrics).length} metrics updated`
        };

      case 'deployment:status':
        return {
          ...baseEvent,
          icon: <GitBranch className="w-4 h-4" />,
          color: data.status === 'success' ? 'text-green-600' : 
                 data.status === 'failed' ? 'text-red-600' : 'text-orange-600',
          title: 'Deployment Update',
          description: `${data.deploymentId} in ${data.environment} is ${data.status}`
        };

      default:
        return {
          ...baseEvent,
          icon: <Zap className="w-4 h-4" />,
          color: 'text-gray-600',
          title: 'Unknown Event',
          description: `${type} event received`
        };
    }
  };

  // Subscribe to all events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to each event type
    const eventTypes: (keyof WebSocketEventMap)[] = [
      'server:status',
      'pipeline:update', 
      'user:action',
      'system:alert',
      'deployment:status',
      'metrics:update'
    ];

    eventTypes.forEach(eventType => {
      const unsubscribe = subscribe(eventType, (data) => {
        const event = createEvent(eventType, data);
        setEvents(prev => [event, ...prev.slice(0, maxEvents - 1)]);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [subscribe, maxEvents]);

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (status.overall === 'demo' || status.overall === 'offline') {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Real-Time Feed Offline
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Connect to WebSocket server to see live activity
          </p>
          <div className="text-xs text-gray-400">
            Status: {status.overall} | WebSocket: {status.websocket}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-500 animate-pulse" />
          Live Activity Feed
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Real-time</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Waiting for activity...
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div 
              key={event.id}
              className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`flex-shrink-0 ${event.color} mt-0.5`}>
                {event.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatTimeAgo(event.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {event.description}
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  {event.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveActivityFeed;
