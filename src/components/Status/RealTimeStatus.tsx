/**
 * 🔥 RealTimeStatus Component
 * Indicador visual do status de conexão WebSocket em tempo real
 */

import {
    Activity,
    AlertCircle,
    CheckCircle,
    Loader2,
    Radio,
    WifiOff,
    Zap
} from 'lucide-react';
import React from 'react';
import { useRealTimeConnection } from '../../hooks/useRealTimeConnection';

interface RealTimeStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ 
  className = '', 
  showDetails = false,
  compact = false 
}) => {
  const { 
    status, 
    isConnected, 
    isDemoMode,
    lastConnectedUrl,
    connectionLogs,
    websocketStatus,
    connect,
    disconnect 
  } = useRealTimeConnection();

  const getStatusIcon = () => {
    switch (status.overall) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'demo':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.overall) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'offline':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'demo':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-700';
      default:
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    }
  };

  const getStatusText = () => {
    switch (status.overall) {
      case 'online':
        return 'Real-Time Active';
      case 'partial':
        return 'Partial Connection';
      case 'offline':
        return 'Connecting...';
      case 'demo':
        return 'Demo Mode';
      default:
        return 'Connection Error';
    }
  };

  const getDetailedStatus = () => {
    return [
      { name: 'Kosmos', status: status.kosmos },
      { name: 'StatusRafa', status: status.statusRafa },
      { name: 'WebSocket', status: status.websocket }
    ];
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {isConnected ? (
            <span className="flex items-center space-x-1">
              <Radio className="w-3 h-3 text-green-500 animate-pulse" />
              <span>Live</span>
            </span>
          ) : isDemoMode ? (
            <span className="text-gray-500">Demo</span>
          ) : (
            <span className="text-blue-500">Connecting</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Main Status Badge */}
      <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
        {isConnected && (
          <Zap className="w-3 h-3 ml-2 text-green-500 animate-pulse" />
        )}
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-4 space-y-3">
          {/* Connection Details */}
          <div className="text-sm">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connection Status
            </h4>
            <div className="space-y-1">
              {getDetailedStatus().map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{service.name}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    service.status === 'connected' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : service.status === 'connecting'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      : service.status === 'error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WebSocket Details */}
          {websocketStatus && (
            <div className="text-sm">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                WebSocket Info
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>Status: {websocketStatus.status}</div>
                <div>Subscribers: {websocketStatus.subscribersCount}</div>
                <div>Attempts: {websocketStatus.reconnectAttempts}</div>
                {lastConnectedUrl && (
                  <div>URL: {lastConnectedUrl}</div>
                )}
              </div>
            </div>
          )}

          {/* Connection Logs */}
          {connectionLogs.length > 0 && (
            <div className="text-sm">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Activity
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                <div className="space-y-1 text-xs font-mono">
                  {connectionLogs.slice(-5).map((log, index) => (
                    <div key={index} className="text-gray-600 dark:text-gray-400">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            {!isConnected ? (
              <button
                onClick={connect}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Activity className="w-4 h-4 mr-1" />
                Connect
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <WifiOff className="w-4 h-4 mr-1" />
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeStatus;
