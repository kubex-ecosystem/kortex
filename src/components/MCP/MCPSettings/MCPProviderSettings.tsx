import React, { useState } from 'react';
import { MCPAPIProviderConfigType, MCPAPIProvider, MCPModelType } from '../../../types';

interface MCPProviderSettingsProps {
  provider: MCPAPIProviderConfigType;
  onUpdate: (provider: MCPAPIProviderConfigType) => void;
  availableModels: MCPModelType[];
}

export const MCPProviderSettings: React.FC<MCPProviderSettingsProps> = ({
  provider,
  onUpdate,
  availableModels
}) => {
  const [localProvider, setLocalProvider] = useState(provider);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleChange = (field: keyof MCPAPIProviderConfigType, value: any) => {
    const updated = { ...localProvider, [field]: value };
    setLocalProvider(updated);
    onUpdate(updated);
  };

  const providers: MCPAPIProvider[] = ['OpenAI', 'Google', 'Azure', 'Local'];

  const getProviderColor = (providerType: MCPAPIProvider) => {
    switch (providerType) {
      case 'OpenAI': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Google': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Azure': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Local': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredModels = availableModels.filter(model => 
    localProvider.provider === 'Local' || model.name.toLowerCase().includes(localProvider.provider.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Settings</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            localProvider.enabled 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}>
            {localProvider.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Provider
          </label>
          <div className="grid grid-cols-2 gap-2">
            {providers.map(providerType => (
              <button
                key={providerType}
                onClick={() => handleChange('provider', providerType)}
                className={`p-3 rounded-md border transition-colors ${
                  localProvider.provider === providerType
                    ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {providerType}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getProviderColor(providerType)}`}>
                    {providerType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Provider Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Provider Name
          </label>
          <input
            type="text"
            value={localProvider.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter provider name"
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* API Key (if not Local) */}
        {localProvider.provider !== 'Local' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localProvider.apiKey || ''}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="Enter API key"
                className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? '👁️' : '🙈'}
              </button>
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Active Model
          </label>
          <select
            value={localProvider.activeModel?.id || ''}
            onChange={(e) => {
              const selectedModel = filteredModels.find(m => m.id === e.target.value);
              handleChange('activeModel', selectedModel || null);
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            title="Select active model"
          >
            <option value="">Select a model</option>
            {filteredModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} {model.version && `(${model.version})`}
              </option>
            ))}
          </select>
        </div>

        {/* Model Details */}
        {localProvider.activeModel && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Model Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {localProvider.activeModel.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Version:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {localProvider.activeModel.version || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Max Tokens:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {localProvider.activeModel.maxTokens.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  ${localProvider.activeModel.costPerRequest || 'N/A'}
                </span>
              </div>
            </div>
            {localProvider.activeModel.description && (
              <div className="mt-2">
                <span className="text-gray-500 dark:text-gray-400">Description:</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {localProvider.activeModel.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Provider Actions */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localProvider.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Provider</span>
          </label>

          <button
            onClick={() => {
              // Test connection logic would go here
              console.log('Testing connection to', localProvider.provider);
            }}
            disabled={!localProvider.enabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
};
