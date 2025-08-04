import { Activity, AlertTriangle, CheckCircle, Clock, Database, RefreshCw, Server, XCircle } from 'lucide-react';
import React from 'react';
import { DiscordStatus } from '../components/Discord/DiscordStatus';
import { useServersAndTasks } from '../hooks/useServersAndTasks';
import { useSystemData } from '../hooks/useSystemData';

export default function Dashboard() {
  // 🔥 Separar hooks para reduzir re-renders
  const {
    data,
    isLoading: metricsLoading,
    error,
    isRealData,
    isFallbackData,
    lastUpdated,
    source,
    refreshData: refreshMetrics,
    setDemoMode,
    serviceStatus
  } = useSystemData();
  
  const {
    servers,
    tasks,
    logs,
    isLoading: dataLoading,
    refreshData: refreshServersAndTasks
  } = useServersAndTasks();
  
  // 🔥 Loading otimizado - só mostrar loading se métricas principais estão carregando
  const isLoading = metricsLoading;
  
  // 🔥 Refresh unificado
  const refreshData = async () => {
    await Promise.all([
      refreshMetrics(),
      refreshServersAndTasks()
    ]);
  };

  if (isLoading) {
    return (
      <React.Fragment>
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Carregando dados do sistema...</p>
        </div>
      </div>
      </React.Fragment>
    );
  }

  if (error) {
    return (
      <React.Fragment>
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Erro ao carregar dados</h3>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>
    );
  }

  const statsCards = [
    {
      label: 'Servidores',
      value: data?.totalServers || 0,
      active: data?.activeServers || 0,
      icon: <Server className="h-8 w-8 text-blue-600" />,
      color: 'blue',
      subtitle: `${data?.activeServers || 0} ativos`,
      isPercentage: false
    },
    {
      label: 'Tasks',
      value: data?.totalTasks || 0,
      active: data?.runningTasks || 0,
      icon: <Activity className="h-8 w-8 text-green-600" />,
      color: 'green',
      subtitle: `${data?.runningTasks || 0} executando`,
      isPercentage: false
    },
    {
      label: 'Conexões',
      value: data?.totalConnections || 0,
      active: data?.activeConnections || 0,
      icon: <Database className="h-8 w-8 text-purple-600" />,
      color: 'purple',
      subtitle: `${data?.activeConnections || 0} ativas`,
      isPercentage: false
    },
    {
      label: 'Performance',
      value: data?.cpuUsage || 0,
      active: data?.memoryUsage || 0,
      icon: <CheckCircle className="h-8 w-8 text-orange-600" />,
      color: 'orange',
      subtitle: `${data?.memoryUsage || 0}% RAM`,
      isPercentage: true
    }
  ];

  return (
    <React.Fragment>
    <div className="p-6 space-y-6">
      {/* Header com Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do sistema KubeX MCP
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isRealData ? 'bg-green-500' : isFallbackData ? 'bg-yellow-500' : 'bg-gray-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isRealData ? 'Dados Reais' : isFallbackData ? 'Modo Demo' : 'Cache'}
            </span>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!serviceStatus.demoMode)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              serviceStatus.demoMode
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {serviceStatus.demoMode ? 'Sair do Demo' : 'Modo Demo'}
          </button>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${serviceStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium text-gray-900 dark:text-white">
                Backend: {serviceStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Source: {source} | Cache: {serviceStatus.cacheSize} items
            </div>
          </div>
          
          {lastUpdated && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Última atualização: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {card.isPercentage ? `${(card.value < 1 ? card.value * 100 : card.value).toFixed(2)}%` : card.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {card.isPercentage ? `${(parseFloat(card.subtitle) < 1 ? parseFloat(card.subtitle) * 100 : parseFloat(card.subtitle)).toFixed(2)}%` : card.subtitle.toLocaleString()}
                </p>
              </div>
              <div className="flex-shrink-0">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discord Status Section */}
      <DiscordStatus />

      {/* Lista de Servidores */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Servidores</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {servers.length > 0 ? servers.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    server.status === 'online' ? 'bg-green-500' :
                    server.status === 'warning' ? 'bg-yellow-500' :
                    server.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{server.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {server.host}:{server.port} • {server.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {server.responseTime}ms
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {server.version}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum servidor encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Tasks Recentes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks Recentes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {tasks.length > 0 ? tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  {task.status === 'running' && <Clock className="h-4 w-4 text-blue-500" />}
                  {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {task.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                  {task.status === 'pending' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{task.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {task.type} • {task.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {task.progress > 0 && (
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {task.progress}%
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma task encontrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}
