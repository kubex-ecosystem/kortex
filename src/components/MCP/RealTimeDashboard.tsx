import React, { useState } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, Pause, Play, Settings } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { RateLimitStatus } from '../../types';

interface RealTimeDashboardProps {
  className?: string;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ className = '' }) => {
  const { isConnected, rateLimitStatus, pollingStatus, alerts, clearAlerts } = 
    useWebSocket('ws://127.0.0.1:3002/ws');
  
  const [showAlerts, setShowAlerts] = useState(true);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 80) return 'text-yellow-500';
    if (percentage >= 60) return 'text-blue-500';
    return 'text-green-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Real-Time Dashboard</h2>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center gap-2 mb-6">
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-green-400 font-medium">Connected to MCP Server</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-red-500" />
            <span className="text-red-400 font-medium">Disconnected from MCP Server</span>
          </>
        )}
        
        <div className="flex items-center gap-4 ml-auto">
          <div className="text-sm text-gray-400">
            Last Update: {new Date().toLocaleTimeString()}
          </div>
          
          {pollingStatus && (
            <div className="flex items-center gap-2">
              {pollingStatus.isActive ? (
                <div className="flex items-center gap-1 text-green-400">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Polling Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Polling Paused</span>
                </div>
              )}
              
              <span className="text-xs text-gray-500">
                ({pollingStatus.activeProviders?.length || 0} providers)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && showAlerts && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-yellow-400">Real-time Alerts</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={clearAlerts}
                className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/30 transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowAlerts(false)}
                className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Hide
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {alerts.slice(-3).map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-yellow-900/10 rounded p-2">
                <div>
                  {alert.type === 'auto_pause' ? (
                    <span className="text-yellow-300">
                      Auto-paused {alert.provider} - {alert.reason}
                    </span>
                  ) : (
                    <span className="text-yellow-300">
                      High usage on {alert.provider}: {alert.percentage?.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(alert.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Rate Limit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(rateLimitStatus).map(([provider, status]) => (
          <div key={provider} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white capitalize">{provider}</h3>
              <div className={`flex items-center gap-2 ${getStatusColor(status.current.percentage)}`}>
                <Activity className="w-4 h-4" />
                <span className="font-mono text-sm">{status.current.percentage.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.current.percentage)}`}
                  style={{ width: `${Math.min(status.current.percentage, 100)}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Used:</span>
                  <span className="text-white font-mono ml-2">{status.current.requestsUsed}</span>
                </div>
                <div>
                  <span className="text-gray-400">Remaining:</span>
                  <span className="text-white font-mono ml-2">{status.current.requestsRemaining}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Reset: {formatTime(status.current.resetTime)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Debug Info</h4>
          <pre className="text-xs text-gray-500 overflow-auto">
            {JSON.stringify({ 
              isConnected, 
              alertsCount: alerts.length,
              rateLimitKeys: Object.keys(rateLimitStatus),
              pollingActive: pollingStatus?.isActive 
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RealTimeDashboard;
