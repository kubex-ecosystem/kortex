import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as PieChartComponent,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { LoadingState } from '../components/UI/LoadingSpinner';
import { mcpService } from '../lib/mcpService';
import { LogEntry } from '../types';

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['mcp-stats'],
    queryFn: () => mcpService.getStatus(),
    refetchInterval: 60000, // Stats a cada 60 segundos
    enabled: true,
  });

  const { data: metrics, isLoading: metricsLoading, refetch } = useQuery({
    queryKey: ['server-metrics', timeRange],
    queryFn: () => mcpService.getSystemMetrics(),
    refetchInterval: 120000, // Métricas a cada 2 minutos
    enabled: true,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['all-tasks-metrics'],
    queryFn: async () => {
      const tasks = await mcpService.getTasksList();
      if (!tasks) return [];
      if (Array.isArray(tasks)) {
        for (const task of tasks) {
          if (typeof task !== 'object' || !task.id || !task.name || !task.status) {
            console.warn('🐛 useSystemData Debug - Task data is not in expected format:', task);
            continue; // Skip invalid task data
          }
          task.startTime = new Date(task.startTime).toISOString();
          if (task.endTime) {
            task.endTime = new Date(task.endTime).toISOString();
            task.duration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();
          } else {
            task.endTime = null; // Ensure endTime is always defined
            task.duration = null; // Ensure duration is always defined
          }
          task.progress = task.progress || 0; // Default progress to 0 if not defined
          task.serverId = task.serverId || 'unknown'; // Default serverId if not defined
          if (task.logs && Array.isArray(task.logs)) {
            task.logs = (task.logs as LogEntry[]).map((log:LogEntry | undefined) => {
              if (!log) return {
                id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                timestamp: new Date().toISOString(),
                message: 'No message provided',
                level: 'info'
              };
              return ({
                id: log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
                message: log.message || 'No message provided',
                level: log.level || 'info'
              });
            });
          } else {
            task.logs = [];
          }
        }
        return tasks;
      } else {
        console.warn('🐛 useSystemData Debug - Tasks data is not an array:', tasks);
        return [];
      }
    },
    refetchInterval: 120000, // Tasks para métricas a cada 2 minutos
    enabled: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Dados para gráfico de pizza (distribuição de status)
  const statusDistribution = tasks ? [
    { name: 'Concluídas', value: tasks.filter(t => t.status === 'completed').length, color: '#10B981' },
    { name: 'Em execução', value: tasks.filter(t => t.status === 'running').length, color: '#3B82F6' },
    { name: 'Pendentes', value: tasks.filter(t => t.status === 'pending').length, color: '#F59E0B' },
    { name: 'Falhas', value: tasks.filter(t => t.status === 'failed').length, color: '#EF4444' },
  ] : [];

  // Dados para gráfico de barras (tasks por provider)
  const tasksByProvider = tasks ? 
    Object.entries(
      tasks.reduce((acc, task) => {
        acc[task.provider] = (acc[task.provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([provider, count]) => ({
      provider,
      count,
      completed: tasks.filter(t => t.provider === provider && t.status === 'completed').length,
      failed: tasks.filter(t => t.provider === provider && t.status === 'failed').length,
    })) : [];

  if (statsLoading || metricsLoading || tasksLoading) {
    return <LoadingState message="Carregando métricas do sistema..." />;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Métricas do Sistema</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análise detalhada de performance e utilização do servidor MCP
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            title="Período de análise"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      {/* {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Uptime do Sistema"
            value={`${stats.uptime.toFixed(2)}%`}
            icon={Server}
            trend={{ value: 0.1, isPositive: true }}
          />
          <StatsCard
            title="Tempo Médio de Resposta"
            value={`${Math.round(stats.avgResponseTime)}ms`}
            icon={Zap}
            trend={{ value: 12, isPositive: false }}
          />
          <StatsCard
            title="Taxa de Sucesso"
            value={`${((stats.completedTasks / stats.totalTasks) * 100 || 0).toFixed(1)}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Tasks por Hora"
            value={Math.round((stats.totalTasks / 24) || 0)}
            icon={Activity}
            trend={{ value: 8, isPositive: true }}
          />
        </div>
      )} */}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Response Time Chart */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tempo de Resposta ({timeRange})
                </h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={/* metrics.data?.responseTime */ [0]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Task Throughput Chart */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Throughput de Tasks ({timeRange})
                </h3>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={/* metrics.taskThroughput */ [0]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  fill="url(#throughputGradient)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Distribuição por Status
              </h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChartComponent>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
            </PieChartComponent>
          </ResponsiveContainer>
        </motion.div>

        {/* Tasks by Provider Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tasks por Provider
              </h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksByProvider}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="provider" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10B981" name="Concluídas" />
              <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Falhas" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Error Rate Chart */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Taxa de Erro ({timeRange})
              </h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Média: {/* (metrics.errorRate.reduce((sum, point) => sum + point.value, 0) / metrics.errorRate.length).toFixed(2) */ 0}%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={/* metrics.errorRate */ [0]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#EF4444" 
                fill="url(#errorGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* System Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumo de Saúde do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {stats ? Math.round(/* stats.uptime */ 0) : 0}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Disponibilidade</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {/* stats ? stats.activeTasks : */ 0}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Tasks Ativas</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {/* stats ? stats.providersConnected : */ 0}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Providers Online</div>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}

// Force dynamic rendering
export async function getServerSideProps() {
  return {
    props: {},
  };
}
