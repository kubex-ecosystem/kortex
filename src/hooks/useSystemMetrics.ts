import { useCallback, useEffect, useMemo, useState } from 'react';
import { resilientMCPService } from '../lib/resilientMcpService';
import {
  MCPDataSource,
  SystemMetrics,
  SystemMetricsApiPayload,
  SystemMetricsState,
} from '../types/MCP/SystemMetrics';

const FALLBACK_METRICS: SystemMetrics = {
  cpu: {
    usage: 12.5,
    cores: 4,
  },
  memory: {
    used: 6.5,
    total: 16,
    percentage: 40.6,
  },
  disk: {
    used: 128,
    total: 256,
    percentage: 50,
  },
  network: {
    bytesIn: 0,
    bytesOut: 0,
    packetsIn: 0,
    packetsOut: 0,
  },
  uptime: 3_600,
  loadAverage: [0.8, 0.6, 0.4],
  processes: 142,
};

const FALLBACK_PAYLOAD: SystemMetricsApiPayload = {
  status: 'fallback',
  data: FALLBACK_METRICS,
  timestamp: Math.floor(Date.now() / 1000),
};

const INITIAL_STATE: SystemMetricsState = {
  metrics: FALLBACK_METRICS,
  dataSource: 'fallback',
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const SECONDS_TO_MS = 1000;

const formatUptime = (uptimeSeconds: number): string => {
  if (!uptimeSeconds || uptimeSeconds < 0) {
    return '0s';
  }

  const days = Math.floor(uptimeSeconds / 86_400);
  const hours = Math.floor((uptimeSeconds % 86_400) / 3_600);
  const minutes = Math.floor((uptimeSeconds % 3_600) / 60);

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);

  if (parts.length === 0) {
    parts.push(`${Math.floor(uptimeSeconds)}s`);
  }

  return parts.join(' ');
};

type NormalizeResult = {
  metrics: SystemMetrics;
  timestamp: Date;
};

const isSystemMetrics = (value: unknown): value is SystemMetrics => {
  return !!value && typeof value === 'object' && 'cpu' in (value as Record<string, unknown>);
};

const normalizePayload = (payload: SystemMetricsApiPayload | SystemMetrics | undefined | null): NormalizeResult | null => {
  if (!payload) {
    return null;
  }

  if (isSystemMetrics(payload)) {
    return {
      metrics: payload,
      timestamp: new Date(),
    };
  }

  const apiPayload = payload as SystemMetricsApiPayload;
  if (isSystemMetrics(apiPayload.data)) {
    const timestamp = typeof apiPayload.timestamp === 'number'
      ? new Date(apiPayload.timestamp * SECONDS_TO_MS)
      : new Date();

    return {
      metrics: apiPayload.data,
      timestamp,
    };
  }

  return null;
};

interface UseSystemMetricsOptions {
  refreshIntervalMs?: number;
}

export function useSystemMetrics(options?: UseSystemMetricsOptions) {
  const { refreshIntervalMs = 60_000 } = options ?? {};
  const [state, setState] = useState<SystemMetricsState>(INITIAL_STATE);

  const fetchMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await resilientMCPService.safeRequest<SystemMetricsApiPayload>(
        '/api/v1/mcp/system/metrics',
        {},
        {
          fallbackData: FALLBACK_PAYLOAD,
          cacheTimeout: 60_000,
        },
      );

      const normalized = normalizePayload(response.data);
      const dataSource: MCPDataSource = response.isFromFallback
        ? 'fallback'
        : response.isFromCache
          ? 'cached'
          : 'real';

      if (normalized) {
        setState({
          metrics: normalized.metrics,
          dataSource,
          isLoading: false,
          error: null,
          lastUpdated: normalized.timestamp,
        });
        return;
      }

      setState({
        metrics: FALLBACK_METRICS,
        dataSource: 'fallback',
        isLoading: false,
        error: 'Dados de métricas do sistema indisponíveis',
        lastUpdated: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar métricas do sistema';
      setState({
        metrics: FALLBACK_METRICS,
        dataSource: 'fallback',
        isLoading: false,
        error: message,
        lastUpdated: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (refreshIntervalMs <= 0 || typeof window === 'undefined') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchMetrics();
    }, refreshIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [fetchMetrics, refreshIntervalMs]);

  const uptimeHuman = useMemo(
    () => formatUptime(state.metrics.uptime),
    [state.metrics.uptime],
  );

  const cpuUtilization = state.metrics.cpu.usage;
  const memoryUtilization = state.metrics.memory.percentage;
  const diskUtilization = state.metrics.disk.percentage;

  return {
    metrics: state.metrics,
    dataSource: state.dataSource,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refresh: fetchMetrics,
    uptimeHuman,
    cpuUtilization,
    memoryUtilization,
    diskUtilization,
  };
}

export type UseSystemMetricsReturn = ReturnType<typeof useSystemMetrics>;
