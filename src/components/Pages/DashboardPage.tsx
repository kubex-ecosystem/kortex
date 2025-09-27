import {
  Activity,
  Award,
  Clock,
  Cpu,
  Gauge,
  HardDrive,
  RefreshCw,
  Server,
  Users,
  XCircle,
} from 'lucide-react';
import { JSX, useMemo } from 'react';
import { useResilientApp } from '../../context/ResilientAppContext';
import { useRealAPIData } from '../../hooks/useRealAPIData';
import { useSystemMetrics } from '../../hooks/useSystemMetrics';
import { Task } from '../../types';
import { TaskCard } from '../Dashboard/TaskCard';
import { LiveActivityFeed } from '../RealTime/LiveActivityFeed';
import { RealTimeStatus } from '../Status/RealTimeStatus';

interface MetricRowProps {
  label: string;
  value: string;
}

const MetricRow = ({ label, value }: MetricRowProps): JSX.Element => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-medium text-gray-900 dark:text-gray-200">{value}</span>
  </div>
);

export const DashboardPage = (): JSX.Element => {
  const { tasks } = useResilientApp();
  const {
    stats,
    isLoading,
    error,
    isRealData,
    isFallbackData,
    lastUpdated,
    refreshData,
    scorecard,
    aiMetrics,
    providers,
    analyzerConfig,
  } = useRealAPIData();
  const {
    metrics: systemMetrics,
    dataSource: systemDataSource,
    isLoading: isLoadingSystemMetrics,
    error: systemMetricsError,
    lastUpdated: systemMetricsUpdatedAt,
    refresh: refreshSystemMetrics,
    uptimeHuman,
    cpuUtilization,
    memoryUtilization,
    diskUtilization,
  } = useSystemMetrics({ refreshIntervalMs: 120_000 });

  const formatPercentage = (value: number | null | undefined, fractionDigits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }
    const percent = value > 1 ? value : value * 100;
    return `${percent.toFixed(fractionDigits)}%`;
  };

  const formatHours = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }
    if (value >= 24) {
      const days = value / 24;
      return `${days.toFixed(1)}d`;
    }
    return `${value.toFixed(1)}h`;
  };

  const formatNumber = (value: number | null | undefined, fractionDigits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(fractionDigits);
  };

  const chiScoreDisplay = useMemo(() => {
    if (stats.chiScore === null || stats.chiScore === undefined || Number.isNaN(stats.chiScore)) {
      return 'N/A';
    }
    return `${stats.chiScore.toFixed(0)}`;
  }, [stats.chiScore]);
  
  const statusCounts = (tasks || []).reduce((acc, task) => {
    const status = (task as any)?.status || (task as any)?.definition?.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsCards = [
    {
      label: 'CHI Score',
      value: chiScoreDisplay,
      icon: <Award className="h-8 w-8 text-blue-600" />,
      color: 'blue',
      subtitle: scorecard.repoLabel ? `Repo ${scorecard.repoLabel}` : 'Aguardando dados',
      trend: scorecard.generatedAt
        ? `Atualizado ${scorecard.generatedAt.toLocaleDateString()}`
        : undefined,
    },
    {
      label: 'Lead Time P95',
      value: formatHours(stats.leadTimeP95Hours),
      icon: <Clock className="h-8 w-8 text-green-600" />,
      color: 'green',
      subtitle: `Deploys/semana ${formatNumber(stats.deploymentFrequencyWeek, 1)}`,
      trend: isRealData ? 'Dados do GoBE' : 'Modo resiliência',
    },
    {
      label: 'Human Input Ratio',
      value: formatPercentage(stats.hir),
      icon: <Gauge className="h-8 w-8 text-purple-600" />,
      color: 'purple',
      subtitle: `AAC ${formatPercentage(stats.aac)}`,
      trend: aiMetrics.periodDays ? `${aiMetrics.periodDays} dias` : undefined,
    },
    {
      label: 'Provedores Ativos',
      value: stats.connectedProviders,
      icon: <Users className="h-8 w-8 text-orange-600" />,
      color: 'orange',
      subtitle: `Total cadastrados ${stats.totalProviders}`,
      trend: stats.connectedProviders > 0 ? 'Integrações prontas' : 'Nenhum provider online',
    },
  ];

  const systemCards = [
    {
      label: 'CPU Uso',
      value: Number.isFinite(cpuUtilization) ? `${cpuUtilization.toFixed(1)}%` : 'N/A',
      subtitle: `${systemMetrics.cpu.cores} cores`,
      icon: <Cpu className="w-6 h-6 text-purple-500" />,
    },
    {
      label: 'Memória',
      value: Number.isFinite(memoryUtilization) ? `${memoryUtilization.toFixed(1)}%` : 'N/A',
      subtitle: `${systemMetrics.memory.used.toFixed(1)} GB / ${systemMetrics.memory.total.toFixed(1)} GB`,
      icon: <Gauge className="w-6 h-6 text-blue-500" />,
    },
    {
      label: 'Disco',
      value: Number.isFinite(diskUtilization) ? `${diskUtilization.toFixed(1)}%` : 'N/A',
      subtitle: `${systemMetrics.disk.used.toFixed(1)} GB / ${systemMetrics.disk.total.toFixed(1)} GB`,
      icon: <HardDrive className="w-6 h-6 text-emerald-500" />,
    },
  ];

  const formattedLoadAverage = systemMetrics.loadAverage?.length
    ? systemMetrics.loadAverage.map((value) => value.toFixed(2)).join(' • ')
    : 'N/A';

  const formatBytes = (value: number) => {
    if (!value || value < 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let output = value;

    while (output >= 1024 && unitIndex < units.length - 1) {
      output /= 1024;
      unitIndex += 1;
    }

    const decimals = unitIndex === 0 ? 0 : output < 10 ? 1 : 0;
    return `${output.toFixed(decimals)} ${units[unitIndex]}`;
  };

  const networkInbound = formatBytes(systemMetrics.network.bytesIn);
  const networkOutbound = formatBytes(systemMetrics.network.bytesOut);

  const systemSourceBadge = (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${
        systemDataSource === 'real'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200'
          : systemDataSource === 'cached'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-1 ${
          systemDataSource === 'real'
            ? 'bg-green-500'
            : systemDataSource === 'cached'
              ? 'bg-blue-500'
              : 'bg-yellow-500'
        }`}
      />
      {systemDataSource === 'real'
        ? 'GoBE'
        : systemDataSource === 'cached'
          ? 'Cache'
          : 'Fallback'}
    </span>
  );

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

      {/* System Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Métricas do Servidor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Uptime {uptimeHuman} • Processos {systemMetrics.processes}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Load average: {formattedLoadAverage}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {systemSourceBadge}
            {systemMetricsUpdatedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Atualizado: {systemMetricsUpdatedAt.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshSystemMetrics}
              disabled={isLoadingSystemMetrics}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingSystemMetrics ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {systemMetricsError && (
          <div className="mb-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
            {systemMetricsError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemCards.map((card) => (
            <div
              key={card.label}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className={`text-2xl font-semibold text-gray-900 dark:text-white ${
                    isLoadingSystemMetrics ? 'animate-pulse' : ''
                  }`}>
                    {isLoadingSystemMetrics ? '...' : card.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {card.subtitle}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Load Average (1m / 5m / 15m)
            </p>
            <p className={`text-lg font-medium text-gray-900 dark:text-white ${
              isLoadingSystemMetrics ? 'animate-pulse' : ''
            }`}>
              {formattedLoadAverage}
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Tráfego de Rede
            </p>
            <p className={`text-lg font-medium text-gray-900 dark:text-white ${
              isLoadingSystemMetrics ? 'animate-pulse' : ''
            }`}>
              In {networkInbound}
            </p>
            <p className={`text-sm text-gray-500 dark:text-gray-400 ${
              isLoadingSystemMetrics ? 'animate-pulse' : ''
            }`}>
              Out {networkOutbound}
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Processos Ativos
            </p>
            <p className={`text-2xl font-semibold text-gray-900 dark:text-white ${
              isLoadingSystemMetrics ? 'animate-pulse' : ''
            }`}>
              {isLoadingSystemMetrics ? '...' : systemMetrics.processes}
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Connection Status
          </h2>
          <RealTimeStatus showDetails />
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <LiveActivityFeed maxEvents={8} />
        </div>
      </div>

      {/* Scorecard & AI Metrics Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scorecard Snapshot
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {scorecard.repoLabel || 'Configuração padrão'}
              </p>
            </div>
            {scorecard.generatedAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {scorecard.generatedAt.toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <MetricRow label="CHI Score" value={chiScoreDisplay} />
            <MetricRow
              label="Duplicação"
              value={formatPercentage(scorecard.duplicationPct)}
            />
            <MetricRow
              label="Cobertura de Testes"
              value={formatPercentage(scorecard.testCoveragePct)}
            />
            <MetricRow
              label="Lead Time (P95)"
              value={formatHours(scorecard.leadTimeP95Hours)}
            />
            <MetricRow
              label="Deploys/semana"
              value={formatNumber(scorecard.deploymentFrequencyWeek, 2)}
            />
            <MetricRow
              label="Change Fail Rate"
              value={formatPercentage(scorecard.changeFailRatePercent ?? null)}
            />
            <MetricRow label="Bus Factor" value={formatNumber(scorecard.busFactor, 0)} />
          </div>

          {scorecard.fallback && scorecard.placeholderItems && (
            <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-xs text-yellow-800 dark:text-yellow-200">
              Exibindo dados de placeholder enquanto o Analyzer não responde.
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Metrics Overview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Período: {aiMetrics.periodDays ? `${aiMetrics.periodDays} dias` : 'indefinido'}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs ${
              aiMetrics.fallback
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200'
            }`}>
              {aiMetrics.fallback ? 'Fallback' : 'Analyzer'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <MetricRow label="HIR" value={formatPercentage(aiMetrics.hir)} />
            <MetricRow label="AAC" value={formatPercentage(aiMetrics.aac)} />
            <MetricRow label="TPH" value={formatNumber(aiMetrics.tph, 2)} />
            <MetricRow label="Horas Humanas" value={formatNumber(aiMetrics.humanHours, 1)} />
            <MetricRow label="Horas de IA" value={formatNumber(aiMetrics.aiHours, 1)} />
          </div>

          {aiMetrics.contributors && aiMetrics.contributors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Principais Contribuidores
              </h3>
              <div className="space-y-2">
                {aiMetrics.contributors.slice(0, 3).map((contributor, index) => (
                  <div
                    key={`${contributor.user || 'contributor'}-${index}`}
                    className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {contributor.user || 'Desconhecido'}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span>HIR {formatPercentage(contributor.hir)}</span>
                      <span>AAC {formatPercentage(contributor.aac)}</span>
                      <span>TPH {formatNumber(contributor.tph, 2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Providers overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Providers do Gateway
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fonte: {isRealData ? 'GoBE Analyzer' : 'Fallback'} — repo alvo {analyzerConfig.repo}
            </p>
          </div>
          <div className={`px-2 py-1 text-xs rounded-full ${
            stats.connectedProviders > 0
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {stats.connectedProviders} ativos de {stats.totalProviders}
          </div>
        </div>

        {providers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum provider disponível ainda. Configure as integrações no GoBE para habilitar este painel.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {providers.slice(0, 6).map((provider) => (
              <div
                key={provider.name}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {provider.name}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    provider.available
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-red-500'
                  }`} />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  {provider.type || 'desconhecido'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Modelo: {provider.default_model || 'default'}
                </p>
                {provider.last_error && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                    {provider.last_error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
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
