import { Activity, Database, Gauge, RefreshCw, Server, XCircle } from 'lucide-react';
import { JSX } from 'react';
import { useResilientApp } from '../../context/ResilientAppContext';
import { useRealAPIData } from '../../hooks/useRealAPIData';
import { Task } from '../../types';
import { TaskCard } from '../Dashboard/TaskCard';
import { LiveActivityFeed } from '../RealTime/LiveActivityFeed';
import { RealTimeStatus } from '../Status/RealTimeStatus';

export const DashboardPage = (): JSX.Element => {
  const { tasks } = useResilientApp();
  const { stats, isLoading, error, isRealData, isFallbackData, lastUpdated, refreshData } = useRealAPIData();
  
  const statusCounts = (tasks || []).reduce((acc, task) => {
    const status = (task as any)?.status || (task as any)?.definition?.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageScorePercent = `${(stats.averageScore * 100).toFixed(1)}%`;
  const successPercent = `${(stats.successRate * 100).toFixed(1)}%`;

  const statsCards = [
    {
      label: 'Itens do Scorecard',
      value: stats.scorecardItems,
      icon: <Database className="h-8 w-8 text-blue-600" />,
      color: 'blue',
      subtitle: `Score médio ${averageScorePercent}`,
      trend: stats.version ? `Versão ${stats.version}` : undefined,
    },
    {
      label: 'Requisições (1h)',
      value: stats.requestsLastHour,
      icon: <Activity className="h-8 w-8 text-green-600" />,
      color: 'green',
      subtitle: `Latência média ${stats.avgLatencyMs.toFixed(1)} ms`,
      trend: isRealData ? 'Dados do GoBE' : 'Modo resiliência',
    },
    {
      label: 'Taxa de Sucesso',
      value: successPercent,
      icon: <Gauge className="h-8 w-8 text-purple-600" />,
      color: 'purple',
      subtitle: 'Execuções bem-sucedidas',
      trend: undefined,
    },
    {
      label: 'Provedores Ativos',
      value: stats.connectedProviders,
      icon: <Server className="h-8 w-8 text-orange-600" />,
      color: 'orange',
      subtitle: `Total cadastrados ${stats.totalProviders}`,
      trend: stats.connectedProviders > 0 ? 'Integrações prontas' : 'Nenhum provider online',
    },
  ];

  const handleTaskAction = (taskId: string, action: string) => {
    console.log(`Action '${action}' executed on task ${taskId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        
        {/* Real-Time Connection Status */}
        <div className="flex items-center gap-4">
          {/* WebSocket Real-Time Status */}
          <RealTimeStatus compact />
          
          {/* API Data Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            isRealData 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : isFallbackData
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isRealData ? 'bg-green-500' : isFallbackData ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            {isRealData ? 'Dados Reais' : isFallbackData ? 'Modo Demo' : 'Offline'}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Atualizado: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle size={16} />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transform hover:scale-105 transition-all duration-200 ${
            isLoading ? 'animate-pulse' : ''
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  {isRealData && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className={`text-2xl font-bold ${
                  stat.color === 'gray' 
                    ? 'text-gray-900 dark:text-white' 
                    : `text-${stat.color}-600`
                }`}>
                  {isLoading ? '...' : stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.subtitle}
                  </p>
                )}
                {stat.trend && (
                  <p className={`text-xs mt-1 font-medium ${
                    isRealData ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stat.trend}
                  </p>
                )}
              </div>
              <div className="ml-3">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            � Connection Status
          </h2>
          <RealTimeStatus showDetails />
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <LiveActivityFeed maxEvents={8} />
        </div>
      </div>

      {/* Recent Tasks */}
      <>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(tasks || []).slice(0, 6).map((task: any) => {
            const completeTask: Task = {
              ...task,
              definitionId: task.definitionId || '',
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: task.updatedAt || new Date().toISOString(),
            };
            return (
              <TaskCard
                key={completeTask.id}
                task={completeTask}
                onAction={handleTaskAction} 
              />
            );
          })}
        </div>
      </>
    </div>
  );
};

export default DashboardPage;
