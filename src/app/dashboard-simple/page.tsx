'use client';

import { SystemStats } from '@/components/Dashboard/OptimizedComponents';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { RefreshCw } from 'lucide-react';

export default function SimpleDashboard() {
  const {
    data,
    isLoading,
    error,
    isRealData,
    source,
    lastUpdated,
    refreshData
  } = useSystemMetrics();

  console.log('🔄 Dashboard render:', { data, isLoading, source });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erro ao carregar dados</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Carregando métricas do sistema...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Nenhum dado disponível</h3>
          <p className="text-yellow-600 text-sm mt-1">Aguardando dados do sistema...</p>
          <button 
            onClick={refreshData}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoramento do sistema em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <div className={`inline-block w-2 h-2 rounded-full mr-2 ${isRealData ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {source} {lastUpdated && `• ${lastUpdated.toLocaleTimeString()}`}
          </div>
          
          <button
            onClick={refreshData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <SystemStats
        cpuUsage={data.cpuUsage}
        memoryUsage={data.memoryUsage}
        diskUsage={data.diskUsage}
        isRealData={isRealData}
        source={source}
      />

      {/* Debug Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-8">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Debug Info</h3>
        <pre className="text-xs text-gray-600 dark:text-gray-400">
          {JSON.stringify({ data, isRealData, source, lastUpdated: lastUpdated?.toISOString() }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
