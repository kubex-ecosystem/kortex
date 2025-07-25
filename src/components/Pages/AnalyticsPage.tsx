import {
    Activity,
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle,
    Database,
    Download,
    FileText,
    Loader2,
    PieChart,
    RefreshCw,
    TrendingUp
} from 'lucide-react';
import { JSX } from 'react/jsx-runtime';
import { useRealAnalyticsData } from '../../hooks/useRealAnalyticsData';
import { StatusBadge } from '../UI/StatusBadge';

export const AnalyticsPage = (): JSX.Element => {
  // Get real analytics data from new hook
  const { data: analytics, isLoading, error, lastUpdated, dataSource, refresh } = useRealAnalyticsData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-sm text-red-700 dark:text-red-400">
            Erro ao carregar dados de analytics: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Nenhum dado de analytics disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${dataSource === 'real' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {dataSource === 'real' ? 'Dados reais' : 'Dados demo'} 
              {lastUpdated && ` • Atualizado ${lastUpdated.toLocaleTimeString()}`}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Repositórios', 
            value: analytics.totalRepositories.toString(), 
            change: analytics.trends.repositories, 
            icon: <Database className="h-8 w-8 text-blue-600" /> 
          },
          { 
            title: 'Pull Requests', 
            value: analytics.totalPullRequests.toString(), 
            change: analytics.trends.pullRequests, 
            icon: <CheckCircle className="h-8 w-8 text-green-600" /> 
          },
          { 
            title: 'Pipelines', 
            value: analytics.totalPipelines.toString(), 
            change: analytics.trends.pipelines, 
            icon: <Activity className="h-8 w-8 text-purple-600" /> 
          },
          { 
            title: 'Uptime Servidores', 
            value: `${analytics.serverUptime.toFixed(1)}%`, 
            change: analytics.trends.uptime, 
            icon: <TrendingUp className="h-8 w-8 text-orange-600" /> 
          }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change} vs last month
                </p>
              </div>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Provider Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart size={20} />
            API Provider Usage Distribution
          </h3>
          <div className="space-y-4">
            {analytics.providerStats.length > 0 ? (
              analytics.providerStats.map((provider, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{provider.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{provider.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    {/* Progress bar width needs to be dynamic based on percentage */}
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${provider.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {provider.requests} requests today • ${provider.cost.toFixed(3)} cost
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum provider ativo</p>
              </div>
            )}
          </div>
        </div>

        {/* Server Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Server Performance
          </h3>
          <div className="space-y-4">
            {analytics.serverPerformance.length > 0 ? (
              analytics.serverPerformance.map((server, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{server.name}</span>
                    <StatusBadge status={server.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Processed</p>
                      <p className="font-medium text-gray-900 dark:text-white">{server.processed}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                      <p className="font-medium text-green-600">{server.successRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Avg Response</p>
                      <p className="font-medium text-gray-900 dark:text-white">{server.avgResponse}ms</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum servidor configurado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText size={20} />
          System Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.totalServers}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Servidores</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{analytics.serverUptime.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime dos Servidores</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.totalAPIRequests}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Requisições API Hoje</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{analytics.buildSuccessRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Sucesso Builds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;