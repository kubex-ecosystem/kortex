/**
 * 🎯 Componentes otimizados para re-renders mínimos
 * Cada componente é memo-izado e só re-renderiza quando seus dados específicos mudam
 */

import { Activity, Clock, Database, Server } from 'lucide-react';
import * as React from 'react';

// 🔥 COMPONENTE OTIMIZADO: SystemStats
interface SystemStatsProps {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  isRealData: boolean;
  source: string;
}

export const SystemStats = React.memo(({ cpuUsage, memoryUsage, diskUsage, isRealData, source }: SystemStatsProps) => {
  console.log('🔄 SystemStats re-rendered');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* CPU Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</h3>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full mr-1 ${isRealData ? 'bg-green-400' : 'bg-yellow-400'}`} />
            {source}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {cpuUsage.toFixed(1)}%
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
          />
        </div>
      </div>

      {/* Memory Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Memory Usage</h3>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {memoryUsage.toFixed(1)}%
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(memoryUsage, 100)}%` }}
          />
        </div>
      </div>

      {/* Disk Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Server className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Disk Usage</h3>
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {diskUsage.toFixed(1)}%
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(diskUsage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
});

SystemStats.displayName = 'SystemStats';

// 🔥 COMPONENTE OTIMIZADO: ServiceStatus
interface ServiceStatusProps {
  totalServers: number;
  activeServers: number;
  totalTasks: number;
  runningTasks: number;
  lastUpdated: Date | null;
}

export const ServiceStatus = React.memo(({ totalServers, activeServers, totalTasks, runningTasks, lastUpdated }: ServiceStatusProps) => {
  console.log('🔄 ServiceStatus re-rendered');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Servers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Servers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeServers}/{totalServers}</p>
          </div>
          <Server className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{runningTasks}/{totalTasks}</p>
          </div>
          <Activity className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <Clock className="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>
  );
});

ServiceStatus.displayName = 'ServiceStatus';
