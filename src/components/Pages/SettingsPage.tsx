import React, { useState } from 'react';
import { MCPSettings } from '../MCP/MCPSettings/MCPSettings';
import { MCPServerConfigPanel } from '../MCP/MCPServerConfigPanel';
import RealTimeDashboard from '../MCP/RealTimeDashboard';
import { MCPSettingsType, MCPServerConfig } from '../../types';
import { useMCPServers } from '../../hooks/useMCPServers';
import { Settings, Server, Database, Sliders, Activity } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('realtime');
  const [selectedServerId, setSelectedServerId] = useState<string>('statusrafa-mcp');
  const { servers } = useMCPServers();

  const handleSaveSettings = (config: MCPSettingsType): void => {
    console.log('Saving general settings:', config);
    // Implementar lógica de salvamento
  };

  const handleServerConfigUpdate = (config: MCPServerConfig): void => {
    console.log('Server configuration updated:', config);
    // Aqui você pode adicionar lógica adicional como notificações
  };

  const tabs = [
    { id: 'realtime', label: 'Real-Time Dashboard', icon: Activity },
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'servers', label: 'MCP Servers', icon: Server },
    { id: 'rate-limits', label: 'Rate Limits & Polling', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Sliders }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Configure your MCP servers, rate limits, and system preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {activeTab === 'realtime' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Real-Time Dashboard</h2>
              <p className="text-gray-600">Monitor your MCP servers and rate limits in real-time</p>
            </div>
            <RealTimeDashboard />
          </div>
        )}

        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">General Configuration</h2>
            <MCPSettings onSave={handleSaveSettings} />
          </div>
        )}

        {activeTab === 'servers' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">MCP Server Management</h2>
              <p className="text-gray-600">Configure and monitor your MCP server connections</p>
            </div>

            {/* Server Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Server to Configure:
              </label>
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                title="Select MCP server to configure"
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="statusrafa-mcp">StatusRafa MCP Server</option>
                                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name} - {server.hostname}
                    </option>
                  ))}
              </select>
            </div>

            {/* Server Configuration Panel */}
            <MCPServerConfigPanel
              serverId={selectedServerId}
              onConfigUpdate={handleServerConfigUpdate}
            />
          </div>
        )}

        {activeTab === 'rate-limits' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Rate Limits & Polling Control</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <Database className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">Smart Rate Limiting</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    The system automatically manages API calls to stay within provider limits.
                    You can fine-tune intervals and thresholds in the MCP Servers tab.
                  </p>
                </div>
              </div>
            </div>
            
            <MCPServerConfigPanel
              serverId={selectedServerId}
              onConfigUpdate={handleServerConfigUpdate}
            />
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Advanced Settings</h2>
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Sliders className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-yellow-900">Development Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Advanced settings like WebSocket configuration, custom endpoints, and 
                      performance tuning will be available in future versions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">System Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="checkbox" id="dark-mode" className="mr-2" defaultChecked />
                      <label htmlFor="dark-mode" className="text-sm">Enable dark mode</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="auto-refresh" className="mr-2" defaultChecked />
                      <label htmlFor="auto-refresh" className="text-sm">Auto-refresh data</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="notifications" className="mr-2" defaultChecked />
                      <label htmlFor="notifications" className="text-sm">Enable notifications</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Cache duration (minutes)</label>
                      <input 
                        type="number" 
                        defaultValue={5} 
                        min={1} 
                        max={60}
                        title="Cache duration in minutes"
                        placeholder="Minutes"
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max concurrent requests</label>
                      <input 
                        type="number" 
                        defaultValue={5} 
                        min={1} 
                        max={20}
                        title="Maximum concurrent requests"
                        placeholder="Number"
                        className="w-full p-2 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
