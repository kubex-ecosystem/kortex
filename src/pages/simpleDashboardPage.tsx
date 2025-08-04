'use client';

import { SystemStats } from '@/components/Dashboard/OptimizedComponents';
import { AppLayout } from '@/components/navigation/app-layout';
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

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard Simples</h1>
        {isLoading ? (
          <p>Carregando dados...</p>
        ) : error ? (
          <p className="text-red-500">Erro ao carregar dados: {error}</p>
        ) : (
          <>
            <SystemStats
              isRealData={isRealData}
              source={source}
              cpuUsage={(data || {}).cpuUsage || 0}
              memoryUsage={(data || {}).memoryUsage || 0}
              diskUsage={(data || {}).diskUsage || 0}
            />
            <button
              onClick={refreshData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <RefreshCw className="inline mr-2" />
              Atualizar Dados
            </button>
          </>
        )}
      </div>
    </AppLayout>
  );
}