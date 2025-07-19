/**
 * 🔧 APIConfigPage - Modernized with Real API Integration
 * Página de configuração de APIs usando a nova camada de abstração
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  TestTube, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Activity,
  Loader2
} from 'lucide-react';
import { APIProvider } from '../../types';
import { useAPIManager } from '../../hooks/useAPIManager';
import { APIProviderModal } from '../API/APIProviderModal';
import APIConnectionStatus from '../UI/APIConnectionStatus';
import ClientOnly from '../UI/ClientOnly';

export function APIConfigPage() {
  const {
    providers,
    isLoading,
    error,
    stats,
    addProvider,
    updateProvider,
    removeProvider,
    testProvider,
    refreshProviders
  } = useAPIManager();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<APIProvider | null>(null);
  const [testResults, setTestResults] = useState<Map<string, boolean>>(new Map());

  // Handle provider test
  const handleTestProvider = async (provider: APIProvider) => {
    const result = await testProvider(provider);
    setTestResults(prev => new Map(prev.set(provider.id, result.connected)));
    
    // Show notification
    if (result.connected) {
      console.log(`✅ ${provider.name} conectado com sucesso!`);
    } else {
      console.error(`❌ Falha na conexão com ${provider.name}: ${result.error}`);
    }
  };

  // Handle provider deletion
  const handleDeleteProvider = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este provider?')) {
      await removeProvider(id);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuração de APIs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas conexões com provedores de API
          </p>
        </div>
        
        <ClientOnly
          fallback={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg">
                <Loader2 size={16} className="animate-spin" />
                Carregando...
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-3">
            <button
              onClick={refreshProviders}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Atualizar Tudo
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Adicionar Provider
            </button>
          </div>
        </ClientOnly>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <ClientOnly
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Settings size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total de Providers
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.connected}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Conectados
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Activity size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRequests}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Requests Hoje
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg">$</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Custo Total
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClientOnly>

      {/* Providers List */}
      <ClientOnly
        fallback={
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-64 mx-auto"></div>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Provedores Configurados
          </h2>
          
          {providers.length === 0 ? (
            <div className="text-center py-12">
              <Settings size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum provider configurado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Adicione seu primeiro provider de API para começar
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Provider
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - Connection Status */}
                    <div className="flex-1">
                      <APIConnectionStatus 
                        provider={provider} 
                        showDetails={true}
                      />
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleTestProvider(provider)}
                        disabled={isLoading || provider.status === 'Testing'}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        <TestTube size={14} />
                        Testar
                      </button>
                      
                      <button
                        onClick={() => setSelectedProvider(provider)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Settings size={14} />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Provider Modal */}
        <APIProviderModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={addProvider}
          provider={null}
        />

        {/* Edit Provider Modal */}
        <APIProviderModal
          isOpen={!!selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onSave={updateProvider}
          provider={selectedProvider}
        />
      </ClientOnly>
    </div>
  );
}

export default APIConfigPage;
