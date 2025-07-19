import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  Activity,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { APIProvider } from '../../types/APITypes';
import { MCPConnectionTest } from '../MCP/MCPConnectionTest';
import { APIProviderModal } from '../API/APIProviderModal';

export const APIConfigPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<APIProvider | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isConnectedToMCP, setIsConnectedToMCP] = useState(false);

  // Mock data para demonstração - será substituído por dados reais na próxima sessão
  const [apiProviders, setApiProviders] = useState<APIProvider[]>([
    {
      id: '1',
      name: 'OpenAI Production',
      provider: 'OpenAI',
      keyPreview: 'sk-...J3K',
      status: 'Connected',
      lastTested: '2025-01-18T10:30:00Z',
      requestsToday: 245,
      monthlyLimit: 10000,
      costPerRequest: 0.002,
    },
    {
      id: '2', 
      name: 'StatusRafa MCP Local',
      provider: 'StatusRafa MCP',
      keyPreview: 'mcp-local',
      status: 'Disconnected',
      lastTested: '2025-01-18T09:15:00Z',
      requestsToday: 0,
      monthlyLimit: 999999,
      costPerRequest: 0,
      mcpEndpoint: 'http://127.0.0.1:3002',
      githubToken: 'ghp_...ABC',
      azureToken: 'pat_...XYZ',
      azureOrg: 'rafa-mori',
      azureProject: 'kubex'
    },
    {
      id: '3',
      name: 'Anthropic Claude',
      provider: 'Anthropic', 
      keyPreview: 'sk-ant...9XY',
      status: 'Connected',
      lastTested: '2025-01-18T11:45:00Z',
      requestsToday: 89,
      monthlyLimit: 5000,
      costPerRequest: 0.008,
    }
  ]);

  // CRUD Functions
  const handleAddProvider = (provider: APIProvider) => {
    setApiProviders(prev => [...prev, provider]);
    setIsAddModalOpen(false);
  };

  const handleEditProvider = (provider: APIProvider) => {
    setApiProviders(prev => prev.map(p => p.id === provider.id ? provider : p));
    setIsEditModalOpen(false);
    setSelectedProvider(null);
  };

  const handleDeleteProvider = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este provedor de API?')) {
      setApiProviders(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleOpenEditModal = (provider: APIProvider) => {
    setSelectedProvider(provider);
    setIsEditModalOpen(true);
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const testProvider = async (id: string) => {
    setApiProviders(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'Testing' } : p
      )
    );

    // Simulate API test
    setTimeout(() => {
      setApiProviders(prev =>
        prev.map(p =>
          p.id === id 
            ? { ...p, status: Math.random() > 0.3 ? 'Connected' : 'Disconnected', lastTested: new Date().toISOString() }
            : p
        )
      );
    }, 2000);
  };

  // Filter providers based on search term
  const filteredProviders = apiProviders.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: apiProviders.length,
    connected: apiProviders.filter(p => p.status === 'Connected').length,
    totalRequests: apiProviders.reduce((sum, p) => sum + p.requestsToday, 0),
    totalCost: apiProviders.reduce((sum, p) => sum + (p.requestsToday * p.costPerRequest), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            API Configuration
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie suas chaves de API e provedores de IA
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add API Provider
        </button>
      </div>

      {/* MCP Server Connection Test */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Status do MCP Server</h2>
        <MCPConnectionTest onConnectionChange={setIsConnectedToMCP} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.connected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Requests Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Providers List */}
      <div className="space-y-4">
        {filteredProviders.map((provider) => (
          <div key={provider.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {provider.name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {provider.provider}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    provider.status === 'Connected' ? 'text-green-600' : 
                    provider.status === 'Testing' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {provider.status === 'Connected' ? <CheckCircle className="w-4 h-4" /> :
                     provider.status === 'Testing' ? <AlertCircle className="w-4 h-4" /> :
                     <XCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{provider.status}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">API Key</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {showKeys[provider.id] ? 'sk-1234567890abcdef1234567890abcdef' : provider.keyPreview}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(provider.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showKeys[provider.id] ?
                          <EyeOff className="w-4 h-4" /> :
                          <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Requests Today</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {provider.requestsToday.toLocaleString()}/{provider.monthlyLimit.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cost/Request</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      ${provider.costPerRequest}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Tested</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(provider.lastTested).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* MCP Specific Info */}
                {provider.provider === 'StatusRafa MCP' && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">MCP Configuration</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">Endpoint:</span>
                        <span className="ml-1 text-blue-800 dark:text-blue-300">{provider.mcpEndpoint}</span>
                      </div>
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">Azure Org:</span>
                        <span className="ml-1 text-blue-800 dark:text-blue-300">{provider.azureOrg}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => testProvider(provider.id)}
                  disabled={provider.status === 'Testing'}
                  className="p-2 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                  title="Test Connection"
                >
                  <TestTube className={`w-4 h-4 ${provider.status === 'Testing' ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => handleOpenEditModal(provider)}
                  className="p-2 text-gray-400 hover:text-green-600"
                  title="Edit Provider"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete Provider"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum provider encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tente uma busca diferente.' : 'Comece adicionando um novo API provider.'}
          </p>
        </div>
      )}

      {/* Modals */}
      <APIProviderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProvider}
        provider={null}
      />

      <APIProviderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProvider(null);
        }}
        onSave={handleEditProvider}
        provider={selectedProvider}
      />
    </div>
  );
};
