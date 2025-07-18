import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { APIProvider } from '../../types/APITypes';

export const APIConfigPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<APIProvider | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Mock data para demonstração
  const [apiProviders, setApiProviders] = useState<APIProvider[]>([
    {
      id: '1',
      name: 'OpenAI Production',
      provider: 'OpenAI',
      keyPreview: 'sk-...J3K',
      status: 'Connected',
      lastTested: '2 minutes ago',
      requestsToday: 145,
      monthlyLimit: 10000,
      costPerRequest: 0.002
    },
    {
      id: '2',
      name: 'Google AI Studio',
      provider: 'Google',
      keyPreview: 'AIz...9xY',
      status: 'Disconnected',
      lastTested: '1 hour ago',
      requestsToday: 67,
      monthlyLimit: 5000,
      costPerRequest: 0.001
    },
    {
      id: '3',
      name: 'Azure OpenAI',
      provider: 'Azure',
      keyPreview: 'abc...xyz',
      status: 'Testing',
      lastTested: '5 minutes ago',
      requestsToday: 23,
      monthlyLimit: 8000,
      costPerRequest: 0.0015
    }
  ]);

  const filteredProviders = apiProviders.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Disconnected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Testing': return <TestTube className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Disconnected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Testing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTestConnection = (provider: APIProvider) => {
    setApiProviders(prev => 
      prev.map(p => 
        p.id === provider.id 
          ? { ...p, status: 'Testing', lastTested: 'Testing...' }
          : p
      )
    );
    
    // Simular teste de conexão
    setTimeout(() => {
      setApiProviders(prev => 
        prev.map(p => 
          p.id === provider.id 
            ? { ...p, status: 'Connected', lastTested: 'Just now' }
            : p
        )
      );
    }, 2000);
  };

  const handleDeleteProvider = (providerId: string) => {
    if (window.confirm('Tem certeza que deseja remover este provedor de API?')) {
      setApiProviders(prev => prev.filter(p => p.id !== providerId));
    }
  };

  const APIProviderCard: React.FC<{ provider: APIProvider }> = ({ provider }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {provider.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {provider.provider}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(provider.status)}`}>
              {getStatusIcon(provider.status)}
              <span className="ml-1 capitalize">{provider.status}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">API Key</span>
            <div className="flex items-center space-x-2">
              <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {showKeys[provider.id] ? 'sk-1234567890abcdef1234567890abcdef' : provider.keyPreview}
              </code>
              <button
                onClick={() => toggleKeyVisibility(provider.id)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {showKeys[provider.id] ? 
                  <EyeOff className="w-4 h-4 text-gray-500" /> : 
                  <Eye className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requests Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {provider.requestsToday.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Limit</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {provider.monthlyLimit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Tested</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {provider.lastTested}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cost/Request</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ${provider.costPerRequest.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTestConnection(provider)}
                  disabled={provider.status === 'Testing'}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <TestTube className="w-4 h-4 mr-1" />
                  {provider.status === 'Testing' ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={() => {
                    setSelectedProvider(provider);
                    setIsEditModalOpen(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>
              <button
                onClick={() => handleDeleteProvider(provider.id)}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-200 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Providers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {apiProviders.filter(p => p.status === 'Connected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {apiProviders.reduce((sum, p) => sum + p.requestsToday, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Cost/Request</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(apiProviders.reduce((sum, p) => sum + p.costPerRequest, 0) / apiProviders.length).toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search API providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* API Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum provedor de API encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm 
              ? 'Tente ajustar os filtros de busca' 
              : 'Comece adicionando seu primeiro provedor de API'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Provider
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <APIProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      {/* Modals - placeholder for now */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add API Provider</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Modal para adicionar novo provedor de API será implementado aqui
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit API Provider</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Editando provedor: {selectedProvider.name}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
