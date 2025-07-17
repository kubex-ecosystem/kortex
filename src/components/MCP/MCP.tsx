import { useState } from "react";
import { MCPConnectionConfigType, MCPSettingsType } from "../../types";
import { randomUUID } from "crypto";

interface MCPSettingsProps {
  onSave: (config: MCPSettingsType) => void;
  initialConfig?: MCPSettingsType;
}

export const MCPSettings: React.FC<MCPSettingsProps> = ({ onSave, initialConfig }) => {
  const [config, setConfig] = useState<MCPSettingsType>(initialConfig || {
    place: "local",
    connectionType: "HTTP",
    connectionConfig: {
      id: randomUUID().toString(),
      type: "HTTP",
      baseURL: "localhost:8080",
      wsUrl: "localhost:8080",
      apiKey: "your-api-key",
      enableWebSocket: false,
      autoReconnect: true,
      retryOnFailure: true,
      retryBackoff: true,
      retryBackoffFactor: 2,
      retryBackoffMaxDelay: 10000
    } as MCPConnectionConfigType,
    apiProvider: {
      id: randomUUID().toString(),
      name: "Default Provider",
      provider: "Local",
      enabled: false,
      activeModel: null
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev: MCPSettingsType) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">MCP Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Base URL
          </label>
          <input
            aria-label="Base URL"
            type="text"
            name="baseURL"
            value={config.connectionConfig?.baseURL}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            API Key
          </label>
          <input
            aria-label="API Key"
            type="text"
            name="apiKey"
            value={config.connectionConfig?.apiKey}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timeout (ms)
          </label>
          <input
            aria-label="Timeout"
            type="number"
            name="timeout"
            value={config.connectionConfig?.connectionTimeout || 5000}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable WebSocket
          </label>
          <input
            aria-label="Enable WebSocket"
            type="checkbox"
            name="enableWebSocket"
            checked={config.connectionConfig?.enableWebSocket}
            onChange={e => setConfig(prev => ({ ...prev, connectionConfig: { ...prev.connectionConfig, enableWebSocket: e.target.checked } }))}
            className="mt-1 block h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};