import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MCPServerType } from '../../types/MCP/Server';
import { MCPAPIProvider, MCPConnectionType, MCPPlaceType } from '../../types/MCP/Context';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: MCPServerType) => void;
  server?: MCPServerType;
  title: string;
}

export const ServerModal: React.FC<ServerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  server,
  title
}) => {
  const [formData, setFormData] = useState({
    name: server?.name || '',
    hostname: server?.hostname || '',
    place: server?.config.place || 'local' as MCPPlaceType,
    connectionType: server?.config.connectionType || 'HTTP' as MCPConnectionType,
    baseURL: server?.config.connectionConfig.baseURL || '',
    wsUrl: server?.config.connectionConfig.wsUrl || '',
    apiKey: server?.config.connectionConfig.apiKey || '',
    enableWebSocket: server?.config.connectionConfig.enableWebSocket || false,
    autoReconnect: server?.config.connectionConfig.autoReconnect ?? true,
    providerName: server?.config.apiProvider.name || '',
    provider: server?.config.apiProvider.provider || 'OpenAI' as MCPAPIProvider,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newServer: MCPServerType = {
      id: server?.id || Date.now().toString(),
      name: formData.name,
      hostname: formData.hostname,
      status: 'Offline',
      config: {
        place: formData.place,
        connectionType: formData.connectionType,
        connectionConfig: {
          id: server?.config.connectionConfig.id || Date.now().toString(),
          type: formData.connectionType,
          baseURL: formData.baseURL,
          wsUrl: formData.wsUrl,
          apiKey: formData.apiKey,
          enableWebSocket: formData.enableWebSocket,
          autoReconnect: formData.autoReconnect,
          retryOnFailure: true,
          retryBackoff: true
        },
        apiProvider: {
          id: server?.config.apiProvider.id || Date.now().toString(),
          name: formData.providerName,
          provider: formData.provider,
          enabled: true,
          activeModel: null
        }
      },
      lastUpdated: new Date(),
      tasks: [],
      logs: [],
      notifications: [],
      stats: {
        type: 'servers',
        totalServers: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgResponseTime: 0
      }
    };

    onSave(newServer);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Enter server name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hostname
                  </label>
                  <input
                    type="text"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Enter hostname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Place
                  </label>
                  <select
                    value={formData.place}
                    onChange={(e) => setFormData({ ...formData, place: e.target.value as MCPPlaceType })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select place"
                  >
                    <option value="local">Local</option>
                    <option value="remote">Remote</option>
                    <option value="cloud">Cloud</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Connection Type
                  </label>
                  <select
                    value={formData.connectionType}
                    onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as MCPConnectionType })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select connection type"
                  >
                    <option value="HTTP">HTTP</option>
                    <option value="HTTPS">HTTPS</option>
                    <option value="WebSocket">WebSocket</option>
                    <option value="REST">REST</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Connection Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Connection Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={formData.baseURL}
                    onChange={(e) => setFormData({ ...formData, baseURL: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="http://localhost:3000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WebSocket URL
                  </label>
                  <input
                    type="url"
                    value={formData.wsUrl}
                    onChange={(e) => setFormData({ ...formData, wsUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ws://localhost:3000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter API key"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enableWebSocket}
                    onChange={(e) => setFormData({ ...formData, enableWebSocket: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable WebSocket</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoReconnect}
                    onChange={(e) => setFormData({ ...formData, autoReconnect: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto Reconnect</span>
                </label>
              </div>
            </div>

            {/* API Provider Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Provider</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={formData.providerName}
                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My OpenAI Provider"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Provider Type
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as MCPAPIProvider })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select API provider"
                  >
                    <option value="OpenAI">OpenAI</option>
                    <option value="Google">Google</option>
                    <option value="Azure">Azure</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors duration-200"
              >
                {server ? 'Update Server' : 'Add Server'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
