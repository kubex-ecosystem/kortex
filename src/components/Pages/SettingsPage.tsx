import { Activity, Database, HelpCircle, Server, Settings, Sliders, Zap } from 'lucide-react';
import { useState } from 'react';
import { useMCPServers } from '../../hooks/useMCPServers';
import { MCPServerConfig, MCPSettingsType } from '../../types';
import DynamicConfigPanel from '../MCP/DynamicConfigPanel';
import { MCPServerConfigPanel } from '../MCP/MCPServerConfigPanel';
import { MCPSettings } from '../MCP/MCPSettings/MCPSettings';
import RealTimeDashboard from '../MCP/RealTimeDashboard';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('dynamic');
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
    { id: 'dynamic', label: 'Dynamic Configuration', icon: Zap },
    { id: 'realtime', label: 'Real-Time Dashboard', icon: Activity },
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'servers', label: 'MCP Servers', icon: Server },
    { id: 'rate-limits', label: 'Rate Limits & Polling', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
    { id: 'help', label: 'Help & Documentation', icon: HelpCircle }
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
        {activeTab === 'dynamic' && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Configuração Dinâmica MCP v2.0</h2>
              <p className="text-gray-600">
                Controle completo do servidor MCP com configurações em tempo real, 
                gerenciamento de secrets criptografados e execução de comandos do sistema.
              </p>
            </div>
            <DynamicConfigPanel />
          </div>
        )}

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

        {activeTab === 'help' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Help & Documentation</h2>
            
            {/* Quick Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Getting Started</h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Learn the basics of Kortex and get up and running quickly with our comprehensive guides.
                </p>
                <a
                  href="https://kortex.rafa-mori.dev/getting-started/quick-start/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  View Quick Start Guide
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Settings className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">User Guide</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Detailed instructions for configuration, workflows, and best practices.
                </p>
                <a
                  href="https://kortex.rafa-mori.dev/guide/configuration/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                >
                  Browse User Guide
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">API Reference</h3>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                  Complete API documentation for developers and advanced integrations.
                </p>
                <a
                  href="https://kortex.rafa-mori.dev/advanced/api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
                >
                  View API Docs
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Full Documentation Link */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Documentation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access the full Kortex documentation with detailed guides, examples, and troubleshooting tips.
                  </p>
                </div>
                <a
                  href="https://kortex.rafa-mori.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Open Documentation
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Popular Topics</h3>
                <div className="space-y-2">
                  <a href="https://kortex.rafa-mori.dev/guide/commands/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Commands Reference
                  </a>
                  <a href="https://kortex.rafa-mori.dev/guide/workflows/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Development Workflows
                  </a>
                  <a href="https://kortex.rafa-mori.dev/guide/best-practices/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Best Practices
                  </a>
                  <a href="https://kortex.rafa-mori.dev/features/extraction/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Feature Overview
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Advanced Topics</h3>
                <div className="space-y-2">
                  <a href="https://kortex.rafa-mori.dev/advanced/architecture/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    System Architecture
                  </a>
                  <a href="https://kortex.rafa-mori.dev/advanced/typescript-scripts/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    TypeScript Scripts
                  </a>
                  <a href="https://kortex.rafa-mori.dev/advanced/development/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Development Guide
                  </a>
                  <a href="https://kortex.rafa-mori.dev/examples/integration/" target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Integration Examples
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
