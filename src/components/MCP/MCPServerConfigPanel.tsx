import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Zap,
  Save,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useMCPConfig } from '../../hooks/useMCPConfig';
import { MCPServerConfig, RateLimitConfig } from '../../types';

interface MCPServerConfigPanelProps {
  serverId: string;
  onConfigUpdate?: (config: MCPServerConfig) => void;
}

export function MCPServerConfigPanel({ serverId, onConfigUpdate }: MCPServerConfigPanelProps) {
  const {
    config,
    updateConfig,
    rateLimitStatus,
    pollingStatus,
    startPolling,
    pausePolling,
    healthStatus,
    isLoading,
    error,
    events,
    refreshStatus,
    calculateOptimalIntervals
  } = useMCPConfig(serverId);

  const [showTokens, setShowTokens] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<Partial<MCPServerConfig>>({});

  // Status indicator
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      case 'limited': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  // Handle provider configuration update
  const handleProviderUpdate = async (provider: string, providerConfig: any) => {
    if (!config) return;
    
    const updates = {
      providers: {
        ...config.providers,
        [provider]: providerConfig
      }
    };

    const success = await updateConfig(updates);
    if (success && onConfigUpdate) {
      onConfigUpdate({ ...config, ...updates });
    }
    
    setEditingProvider(null);
  };

  // Handle rate limit optimization
  const optimizeRateLimit = (provider: string) => {
    const status = rateLimitStatus[provider];
    if (!status || !config) return;

    const optimalIntervals = calculateOptimalIntervals(
      provider,
      status.current.requestsUsed,
      status.current.requestsUsed + status.current.requestsRemaining
    );

    const currentProvider = config.providers[provider as keyof typeof config.providers];
    if (currentProvider?.enabled) {
      const optimizedConfig = {
        ...currentProvider.rateLimitSettings,
        intervals: optimalIntervals
      };

      setTempConfig({
        providers: {
          ...config.providers,
          [provider]: {
            ...currentProvider,
            rateLimitSettings: optimizedConfig
          }
        }
      });
      setEditingProvider(provider);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="ml-2 text-red-700">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center p-8">
        <Settings className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No configuration found for this server</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Server Configuration</h3>
          <button
            onClick={refreshStatus}
            title="Refresh configuration status"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(config.status)} bg-current`} />
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{config.status}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-gray-600">Port</p>
              <p className="font-medium">{config.settings.port}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-gray-600">Log Level</p>
              <p className="font-medium">{config.settings.logLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <div className={`border rounded-lg p-4 ${
          healthStatus.healthy 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center mb-2">
            {healthStatus.healthy ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
            <h4 className="ml-2 font-medium">
              {healthStatus.healthy ? 'System Healthy' : 'Issues Detected'}
            </h4>
          </div>
          
          {healthStatus.issues.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Issues:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {healthStatus.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {healthStatus.recommendations.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Recommendations:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {healthStatus.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Polling Control */}
      {pollingStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Polling Control</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => startPolling()}
                disabled={pollingStatus.isActive}
                className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-1" />
                Start All
              </button>
              <button
                onClick={() => pausePolling()}
                disabled={!pollingStatus.isActive}
                className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg disabled:opacity-50"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause All
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {Object.entries(pollingStatus.schedule).map(([provider, schedule]) => (
              <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{provider}</p>
                  <p className="text-sm text-gray-600">
                    Next run: {new Date(schedule.nextRun).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{schedule.frequency}s</span>
                  {schedule.isRunning && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Configurations */}
      <div className="space-y-4">
        {Object.entries(config.providers).map(([provider, providerConfig]) => {
          if (!providerConfig?.enabled) return null;
          
          const rateLimit = rateLimitStatus[provider];
          const isEditing = editingProvider === provider;
          
          return (
            <div key={provider} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium capitalize">{provider} Configuration</h4>
                <div className="flex items-center space-x-2">
                  {rateLimit && (
                    <button
                      onClick={() => optimizeRateLimit(provider)}
                      className="px-3 py-1 text-sm bg-primary-subtle text-primary-hover rounded-lg hover:bg-primary-subtle"
                    >
                      Optimize
                    </button>
                  )}
                  <button
                    onClick={() => setEditingProvider(isEditing ? null : provider)}
                    title={`${isEditing ? 'Close' : 'Edit'} ${provider} configuration`}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Rate Limit Status */}
              {rateLimit && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Rate Limit Status</span>
                    <span className={`text-sm ${getStatusColor(rateLimit.provider)}`}>
                      {rateLimit.current.percentage.toFixed(1)}% used
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        rateLimit.current.percentage > 90 ? 'bg-red-500' :
                        rateLimit.current.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, rateLimit.current.percentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{rateLimit.current.requestsUsed} used</span>
                    <span>{rateLimit.current.requestsRemaining} remaining</span>
                  </div>
                </div>
              )}
              
              {/* Configuration Form (when editing) */}
              {isEditing && (
                <div className="space-y-4 mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token
                      <button
                        onClick={() => setShowTokens(!showTokens)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </label>
                    <input
                      type={showTokens ? 'text' : 'password'}
                      value={providerConfig.token}
                      placeholder={`Enter ${provider} token`}
                      title={`${provider} API token`}
                      onChange={(e) => setTempConfig({
                        providers: {
                          ...tempConfig.providers,
                          [provider]: {
                            ...providerConfig,
                            token: e.target.value
                          }
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  {/* Rate limit intervals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Polling Intervals (seconds)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(providerConfig.rateLimitSettings.intervals).map(([endpoint, interval]) => (
                        <div key={endpoint}>
                          <label className="block text-xs text-gray-600 capitalize">{endpoint}</label>
                          <input
                            type="number"
                            min="30"
                            value={interval}
                            placeholder="Seconds"
                            title={`${endpoint} polling interval in seconds`}
                            onChange={(e) => {
                              const newInterval = parseInt(e.target.value);
                              setTempConfig({
                                providers: {
                                  ...tempConfig.providers,
                                  [provider]: {
                                    ...providerConfig,
                                    rateLimitSettings: {
                                      ...providerConfig.rateLimitSettings,
                                      intervals: {
                                        ...providerConfig.rateLimitSettings.intervals,
                                        [endpoint]: newInterval
                                      }
                                    }
                                  }
                                }
                              });
                            }}
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                    <button
                      onClick={() => setEditingProvider(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const updatedProvider = tempConfig.providers?.[provider as keyof typeof tempConfig.providers] || providerConfig;
                        handleProviderUpdate(provider, updatedProvider);
                      }}
                      className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Events */}
      {events.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {events.slice(0, 10).map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.severity === 'error' ? 'bg-red-500' :
                  event.severity === 'warning' ? 'bg-yellow-500' : 'bg-primary'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
