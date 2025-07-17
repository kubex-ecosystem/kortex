import React, { useState } from 'react';
import { MCPConnectionConfigType, MCPConnectionType } from '../../../types';

interface MCPConnectionSettingsProps {
  config: MCPConnectionConfigType;
  onUpdate: (config: MCPConnectionConfigType) => void;
}

export const MCPConnectionSettings: React.FC<MCPConnectionSettingsProps> = ({ config, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (field: keyof MCPConnectionConfigType, value: any) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    onUpdate(updated);
  };

  const connectionTypes: MCPConnectionType[] = ['WebSocket', 'HTTP', 'HTTPS', 'REST'];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Connection Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Connection Type
          </label>
          <select
            value={localConfig.type}
            onChange={(e) => handleChange('type', e.target.value as MCPConnectionType)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            title="Connection Type"
          >
            {connectionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Base URL
          </label>
          <input
            type="text"
            value={localConfig.baseURL}
            onChange={(e) => handleChange('baseURL', e.target.value)}
            placeholder="localhost:8080"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            WebSocket URL
          </label>
          <input
            type="text"
            value={localConfig.wsUrl}
            onChange={(e) => handleChange('wsUrl', e.target.value)}
            placeholder="ws://localhost:8080"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={localConfig.apiKey || ''}
            onChange={(e) => handleChange('apiKey', e.target.value)}
            placeholder="Enter API key"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connection Timeout (ms)
            </label>
            <input
              type="number"
              value={localConfig.connectionTimeout || 5000}
              onChange={(e) => handleChange('connectionTimeout', parseInt(e.target.value))}
              min="1000"
              max="60000"
              title="Connection Timeout in milliseconds"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localConfig.enableWebSocket}
              onChange={(e) => handleChange('enableWebSocket', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable WebSocket</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localConfig.autoReconnect}
              onChange={(e) => handleChange('autoReconnect', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-reconnect</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localConfig.retryOnFailure}
              onChange={(e) => handleChange('retryOnFailure', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Retry on failure</span>
          </label>
        </div>

        {localConfig.retryOnFailure && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retry Backoff Factor
              </label>
              <input
                type="number"
                value={localConfig.retryBackoffFactor || 2}
                onChange={(e) => handleChange('retryBackoffFactor', parseFloat(e.target.value))}
                min="1"
                max="10"
                step="0.1"
                title="Retry Backoff Factor"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Delay (ms)
              </label>
              <input
                type="number"
                value={localConfig.retryBackoffMaxDelay || 10000}
                onChange={(e) => handleChange('retryBackoffMaxDelay', parseInt(e.target.value))}
                min="1000"
                max="60000"
                title="Max Delay in milliseconds"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
