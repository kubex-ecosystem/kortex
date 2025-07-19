import React, { JSX } from 'react';
import { LayoutDashboard, Play, CheckCircle, XCircle, GitBranch, Database, Server, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCard } from '../Dashboard/TaskCard';
import { Task } from '../../types';
import { useMCPData } from '../../hooks/useMCPData';

export const DashboardPage = (): JSX.Element => {
  const { tasks } = useApp();
  const { stats, isLoading, isConnected, error, lastUpdated } = useMCPData();
  
  const statusCounts = tasks.reduce((acc, task:Task) => {
    acc[task.status || 'Unknown'] = (acc[task.status || 'Unknown'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Real MCP-based statistics cards
  const statsCards = [
    { 
      label: 'Repositórios', 
      value: stats.totalRepositories, 
      icon: <Database className="h-8 w-8 text-blue-600" />, 
      color: 'blue',
      subtitle: 'GitHub repos' 
    },
    { 
      label: 'Pull Requests', 
      value: stats.totalPullRequests, 
      icon: <GitBranch className="h-8 w-8 text-green-600" />, 
      color: 'green',
      subtitle: `${stats.openPRs} abertos, ${stats.draftPRs} drafts`
    },
    { 
      label: 'Pipelines', 
      value: stats.totalPipelines, 
      icon: <Activity className="h-8 w-8 text-purple-600" />, 
      color: 'purple',
      subtitle: `${stats.successfulPipelines} ok, ${stats.failedPipelines} falhou`
    },
    { 
      label: 'Fontes Conectadas', 
      value: stats.connectedSources, 
      icon: <Server className="h-8 w-8 text-orange-600" />, 
      color: 'orange',
      subtitle: 'GitHub + Azure DevOps'
    }
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
        
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            isConnected 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            MCP Server {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
          
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
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
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.slice(0, 6).map((task: Task) => {
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
