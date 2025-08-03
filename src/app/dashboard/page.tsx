'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Server, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Zap,
  TrendingUp,
  Users,
  Target,
  Settings
} from 'lucide-react';
import { StatsCard } from '../../components/UI/StatsCard';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { LoadingState } from '../../components/UI/LoadingSpinner';
import { RefreshIndicator } from '../..//components/UI/RefreshIndicator';
import { useStableQuery } from '../../hooks/useStableQuery';
import { mcpService } from '../../lib/mcpService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isRefetching: statsRefetching } = useStableQuery({
    queryKey: ['mcp-stats'],
    queryFn: () => mcpService.getStats(),
    refetchInterval: 30000, // Reduzido para 30 segundos
  });

  const { data: tasks, isLoading: tasksLoading, isRefetching: tasksRefetching } = useStableQuery({
    queryKey: ['active-tasks'],
    queryFn: () => mcpService.getActiveTasks(),
    refetchInterval: 15000, // Reduzido para 15 segundos
  });

  const { data: providers, isLoading: providersLoading } = useStableQuery({
    queryKey: ['providers'],
    queryFn: () => mcpService.getAllProviders(),
    refetchInterval: 60000, // Providers mudam menos, 60 segundos
  });

  const { data: metrics, isLoading: metricsLoading } = useStableQuery({
    queryKey: ['server-metrics'],
    queryFn: () => mcpService.getServerMetrics(),
    refetchInterval: 60000, // Métricas a cada 60 segundos
  });

  const isAnyRefetching = statsRefetching || tasksRefetching;

  if (statsLoading) {
    return <LoadingState message="Carregando dashboard..." />;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard MCP</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoramento em tempo real do servidor Gobe integrado ao Discord
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 dark:text-green-400 text-sm font-medium">Sistema Online</span>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Tasks"
            value={stats.totalTasks}
            icon={Target}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Tasks Ativas"
            value={stats.activeTasks}
            icon={Activity}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Providers Conectados"
            value={stats.providersConnected}
            icon={Server}
            trend={{ value: 0, isPositive: true }}
          />
          <StatsCard
            title="Tempo de Resposta"
            value={`${Math.round(stats.avgResponseTime)}ms`}
            icon={Zap}
            trend={{ value: 8, isPositive: false }}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Ativas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks em Execução</h2>
            <StatusBadge status="running">
              {tasks?.length || 0} ativas
            </StatusBadge>
          </div>

          {tasksLoading ? (
            <LoadingState message="Carregando tasks..." />
          ) : (
            <div className="space-y-4">
              {tasks?.slice(0, 5).map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{task.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {task.progress && (
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 1 }}
                          className="bg-blue-600 h-2 rounded-full"
                        />
                      </div>
                    )}
                    <StatusBadge status={task.status}>
                      {task.status}
                    </StatusBadge>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma task ativa no momento</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Providers Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Providers</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          {providersLoading ? (
            <LoadingState message="Carregando providers..." />
          ) : (
            <div className="space-y-4">
              {providers?.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{provider.type}</p>
                  </div>
                  <StatusBadge status={provider.status}>
                    {provider.status}
                  </StatusBadge>
                </motion.div>
              )) || (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum provider conectado</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Metrics Charts */}
      {metrics && !metricsLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Response Time Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tempo de Resposta (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.responseTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Task Throughput Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Throughput de Tasks (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics.taskThroughput}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">Aprovar Pendentes</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-700 dark:text-green-300 font-medium">Ver Métricas</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">Ver Histórico</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Configurações</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Refresh Indicator */}
      <RefreshIndicator 
        isRefetching={isAnyRefetching}
        lastUpdated={new Date()}
        isOnline={true}
      />
    </motion.main>
  );
}
