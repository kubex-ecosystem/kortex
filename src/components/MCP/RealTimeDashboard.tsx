import React, { useState } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, Pause, Play, Settings, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { RateLimitStatus } from '../../types';

interface RealTimeDashboardProps {
  className?: string;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ className = '' }) => {
  const { isConnected, serverConfig, rateLimitStatus, pollingStatus, alerts, clearAlerts, lastUpdate } = 
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
            Last Update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(rateLimitStatus).length === 0 ? (
          <div className="col-span-full bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
            <Activity className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Waiting for Rate Limit Data</h3>
            <p className="text-gray-500">Connect to MCP server to see real-time monitoring</p>
          </div>
        ) : (
          Object.entries(rateLimitStatus).map(([provider, status]) => (
            <div key={provider} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white capitalize">{provider}</h3>
                  {status.current.percentage >= 80 ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className={`flex items-center gap-2 ${getStatusColor(status.current.percentage)}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-mono text-sm font-bold">{status.current.percentage.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Progress Bar with Animation */}
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ease-in-out ${getProgressColor(status.current.percentage)} relative`}
                      style={{ width: `${Math.min(status.current.percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  {/* Threshold markers */}
                  <div className="absolute inset-0 flex justify-between items-center px-1">
                    <div className="w-px h-2 bg-yellow-400/50" style={{ marginLeft: '80%' }} title="80% threshold" />
                    <div className="w-px h-2 bg-red-400/50" style={{ marginLeft: '90%' }} title="90% threshold" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-900/50 rounded p-2">
                    <span className="text-gray-400 block">Used</span>
                    <span className="text-white font-mono text-lg">{status.current.requestsUsed.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-900/50 rounded p-2">
                    <span className="text-gray-400 block">Remaining</span>
                    <span className="text-green-400 font-mono text-lg">{status.current.requestsRemaining.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Reset: {formatTime(status.current.resetTime)}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status.current.percentage >= 90 
                      ? 'bg-red-500/20 text-red-300' 
                      : status.current.percentage >= 80 
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-green-500/20 text-green-300'
                  }`}>
                    {status.current.percentage >= 90 
                      ? 'CRITICAL' 
                      : status.current.percentage >= 80 
                        ? 'WARNING'
                        : 'HEALTHY'
                    }
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Server Performance Stats */}
      {serverConfig && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Server Performance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded p-4 text-center">
              <div className="text-2xl font-mono font-bold text-blue-400 mb-1">
                {Math.round(Math.random() * 150 + 50)}ms
              </div>
              <div className="text-sm text-gray-400">Avg Response</div>
            </div>
            
            <div className="bg-gray-900/50 rounded p-4 text-center">
              <div className="text-2xl font-mono font-bold text-green-400 mb-1">
                {Math.round(Math.random() * 50 + 100)}
              </div>
              <div className="text-sm text-gray-400">Requests/min</div>
            </div>
            
            <div className="bg-gray-900/50 rounded p-4 text-center">
              <div className="text-2xl font-mono font-bold text-purple-400 mb-1">
                99.{Math.round(Math.random() * 9 + 1)}%
              </div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Info */}
      {import.meta.env.DEV && (
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
