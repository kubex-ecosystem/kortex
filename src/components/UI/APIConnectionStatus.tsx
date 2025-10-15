/**
 * 🔗 APIConnectionStatus Component
 * Componente para exibir status em tempo real das conexões API
 */

import React from 'react';
import { Wifi, WifiOff, Activity, AlertCircle, Clock } from 'lucide-react';
import { APIProvider } from '../../types/APITypes';

interface APIConnectionStatusProps {
  provider: APIProvider;
  showDetails?: boolean;
  compact?: boolean;
}

const getStatusIcon = (status: APIProvider['status']) => {
  const iconProps = { size: 16, className: "inline" };

  switch (status) {
    case 'Connected':
      return <Wifi {...iconProps} className="inline text-success" />;
    case 'Disconnected':
      return <WifiOff {...iconProps} className="inline text-danger" />;
    case 'Testing':
      return <Activity {...iconProps} className="inline text-primary animate-pulse" />;
    default:
      return <AlertCircle {...iconProps} className="inline text-slate-400" />;
  }
};

const getStatusColor = (status: APIProvider['status']) => {
  switch (status) {
    case 'Connected':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Disconnected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Testing':
      return 'bg-primary-subtle text-primary border-primary';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const formatLastTested = (lastTested: string) => {
  const date = new Date(lastTested);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function APIConnectionStatus({ 
  provider, 
  showDetails = false, 
  compact = false 
}: APIConnectionStatusProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(provider.status)}
        <span className={`text-sm font-medium ${
          provider.status === 'Connected' ? 'text-success' :
          provider.status === 'Disconnected' ? 'text-danger' :
          'text-primary'
        }`}>
          {provider.status === 'Testing' ? 'Testando...' : provider.status}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(provider.status)}
            <h3 className="font-semibold text-text-head dark:text-white">
              {provider.name}
            </h3>
          </div>

          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(provider.status)}`}>
            {provider.status === 'Testing' ? 'Testando...' : provider.status}
          </span>
        </div>

        <div className="text-sm text-text-body dark:text-slate-400">
          {provider.provider}
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 text-sm text-text-body dark:text-slate-400">
          {/* Last tested */}
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>Último teste: {formatLastTested(provider.lastTested)}</span>
          </div>

          {/* Key preview */}
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs">
              {provider.keyPreview}
            </span>
          </div>

          {/* Usage stats */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
            <span>Requests hoje: <strong>{provider.requestsToday}</strong></span>
            <span>Custo: <strong>$</strong><strong>{(provider.requestsToday * provider.costPerRequest).toFixed(4)}</strong></span>
          </div>

          {/* Progress bar for monthly limit */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Limite mensal</span>
              <span>{provider.requestsToday} / {provider.monthlyLimit}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  (provider.requestsToday / provider.monthlyLimit) > 0.8
                    ? 'bg-danger'
                    : (provider.requestsToday / provider.monthlyLimit) > 0.6
                    ? 'bg-warning'
                    : 'bg-success'
                }`}
                style={{
                  width: `${Math.min(100, (provider.requestsToday / provider.monthlyLimit) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* MCP specific details */}
          {provider.provider === 'StatusRafa MCP' && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 space-y-1">
              <div className="text-xs font-medium text-text-head dark:text-slate-300">
                MCP Configuration:
              </div>
              {provider.mcpEndpoint && (
                <div className="text-xs">Endpoint: {provider.mcpEndpoint}</div>
              )}
              {provider.githubToken && (
                <div className="text-xs">GitHub: {provider.githubToken}</div>
              )}
              {provider.azureOrg && (
                <div className="text-xs">Azure: {provider.azureOrg}/{provider.azureProject}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default APIConnectionStatus;
