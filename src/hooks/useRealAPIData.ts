/**
 * useRealAPIData Hook
 * Conecta o dashboard do Kortex às rotas reais do GoBE Gateway.
 * Fornece métricas consolidadas do scorecard, health e provedores ativos
 * com fallback resiliente quando o backend está indisponível.
 */

import { useCallback, useEffect, useState } from 'react';
import { resilientGatewayService } from '../lib/resilientGatewayService';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isFromCache?: boolean;
  isFromFallback?: boolean;
  timestamp: number;
}

interface ScorecardEntry {
  id: string;
  title: string;
  description: string;
  score: number;
  updated_at: string;
  tags?: string[];
}

interface ScorecardResponse {
  items?: ScorecardEntry[];
  version?: string;
}

interface ScorecardMetricsResponse {
  metrics?: Record<string, unknown>;
  version?: string;
}

interface ProviderItem {
  name: string;
  type?: string;
  org?: string;
  default_model?: string;
  available?: boolean;
  last_error?: string;
  metadata?: Record<string, unknown>;
}

interface ProvidersResponse {
  providers?: ProviderItem[];
  timestamp?: string;
}

interface RealAPIStats {
  scorecardItems: number;
  averageScore: number;
  requestsLastHour: number;
  avgLatencyMs: number;
  successRate: number;
  connectedProviders: number;
  totalProviders: number;
  version: string;
  lastUpdated: Date | null;
  dataSource: 'real' | 'fallback' | 'cached';
  isLoading: boolean;
  error: string | null;
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const createFallbackScorecard = (): ScorecardResponse => ({
  items: [
    {
      id: 'demo',
      title: 'AI Governance',
      description: 'Scorecard placeholder enquanto o Analyzer não responde',
      score: 0.75,
      updated_at: new Date().toISOString(),
      tags: ['placeholder', 'todo'],
    },
  ],
  version: 'gateway-placeholder-1',
});

const createFallbackMetrics = (): ScorecardMetricsResponse => ({
  metrics: {
    requests_last_hour: 0,
    avg_latency_ms: 0,
    success_rate: 1,
  },
  version: 'gateway-placeholder-1',
});

const createFallbackProviders = (): ProvidersResponse => ({
  providers: [],
  timestamp: new Date().toISOString(),
});

const FALLBACK_SCORECARD = createFallbackScorecard();
const FALLBACK_METRICS = createFallbackMetrics();
const FALLBACK_PROVIDERS = createFallbackProviders();

const FALLBACK_STATS: RealAPIStats = {
  scorecardItems: FALLBACK_SCORECARD.items?.length ?? 0,
  averageScore:
    FALLBACK_SCORECARD.items && FALLBACK_SCORECARD.items.length > 0
      ? FALLBACK_SCORECARD.items.reduce((acc, item) => acc + (item.score ?? 0), 0) /
        FALLBACK_SCORECARD.items.length
      : 0,
  requestsLastHour: toNumber(FALLBACK_METRICS.metrics?.requests_last_hour),
  avgLatencyMs: toNumber(FALLBACK_METRICS.metrics?.avg_latency_ms),
  successRate: toNumber(FALLBACK_METRICS.metrics?.success_rate, 1),
  connectedProviders: FALLBACK_PROVIDERS.providers?.filter((p) => p.available !== false).length ?? 0,
  totalProviders: FALLBACK_PROVIDERS.providers?.length ?? 0,
  version: FALLBACK_SCORECARD.version ?? 'unknown',
  lastUpdated: null,
  dataSource: 'fallback',
  isLoading: false,
  error: null,
};

type GatewayFetchResult<T> = {
  data: T;
  raw: ServiceResponse<T>;
};

export function useRealAPIData() {
  const [stats, setStats] = useState<RealAPIStats>(FALLBACK_STATS);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchScorecard = useCallback(async (): Promise<GatewayFetchResult<ScorecardResponse>> => {
    const response = (await resilientGatewayService.safeRequest<ScorecardResponse>(
      '/api/v1/scorecard'
    )) as ServiceResponse<ScorecardResponse>;

    if (response.success && response.data) {
      return { data: response.data, raw: response };
    }

    const fallback = createFallbackScorecard();
    return {
      data: fallback,
      raw: {
        ...response,
        success: false,
        data: fallback,
        isFromFallback: true,
      },
    };
  }, []);

  const fetchMetrics = useCallback(async (): Promise<GatewayFetchResult<ScorecardMetricsResponse>> => {
    const response = (await resilientGatewayService.safeRequest<ScorecardMetricsResponse>(
      '/api/v1/metrics/ai'
    )) as ServiceResponse<ScorecardMetricsResponse>;

    if (response.success && response.data) {
      return { data: response.data, raw: response };
    }

    const fallback = createFallbackMetrics();
    return {
      data: fallback,
      raw: {
        ...response,
        success: false,
        data: fallback,
        isFromFallback: true,
      },
    };
  }, []);

  const fetchProviders = useCallback(async (): Promise<GatewayFetchResult<ProvidersResponse>> => {
    const response = (await resilientGatewayService.safeRequest<ProvidersResponse>(
      '/providers'
    )) as ServiceResponse<ProvidersResponse>;

    if (response.success && response.data) {
      return { data: response.data, raw: response };
    }

    const fallback = createFallbackProviders();
    return {
      data: fallback,
      raw: {
        ...response,
        success: false,
        data: fallback,
        isFromFallback: true,
      },
    };
  }, []);

  const fetchRealData = useCallback(async () => {
    if (!isClient) return;

    setStats((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [scorecardResult, metricsResult, providersResult] = await Promise.all([
        fetchScorecard(),
        fetchMetrics(),
        fetchProviders(),
      ]);

      const responses = [scorecardResult.raw, metricsResult.raw, providersResult.raw];

      const isFallback = responses.some((resp) => !resp?.success || resp?.isFromFallback);
      const isCached = responses.some((resp) => resp?.isFromCache);

      const dataSource: RealAPIStats['dataSource'] = isFallback ? 'fallback' : isCached ? 'cached' : 'real';

      const items = scorecardResult.data.items ?? [];
      const averageScore =
        items.length > 0
          ? items.reduce((acc, item) => acc + (item.score ?? 0), 0) / items.length
          : 0;

      const metrics = metricsResult.data.metrics ?? {};
      const requestsLastHour = toNumber(metrics.requests_last_hour);
      const avgLatencyMs = toNumber(metrics.avg_latency_ms);
      let successRate = toNumber(metrics.success_rate, 1);

      if (successRate > 1) {
        successRate = successRate / 100;
      }
      successRate = Math.min(Math.max(successRate, 0), 1);

      const providers = providersResult.data.providers ?? [];
      const connectedProviders = providers.filter((provider) => provider.available !== false).length;

      const version =
        metricsResult.data.version || scorecardResult.data.version || stats.version || 'unknown';

      const newStats: RealAPIStats = {
        scorecardItems: items.length,
        averageScore,
        requestsLastHour,
        avgLatencyMs,
        successRate,
        connectedProviders,
        totalProviders: providers.length,
        version,
        lastUpdated: new Date(),
        dataSource,
        isLoading: false,
        error: null,
      };

      setStats(newStats);
      console.log(`✅ Gateway data loaded (source: ${dataSource})`, newStats);
    } catch (error) {
      console.error('🔴 Error fetching gateway data:', error);
      setStats((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch gateway data',
        dataSource: 'fallback',
      }));
    }
  }, [fetchMetrics, fetchProviders, fetchScorecard, isClient, stats.version]);

  useEffect(() => {
    if (!isClient) return;

    fetchRealData();
    const interval = setInterval(fetchRealData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchRealData, isClient]);

  const refreshData = useCallback(async () => {
    await fetchRealData();
  }, [fetchRealData]);

  return {
    stats,
    isLoading: stats.isLoading,
    error: stats.error,
    isRealData: stats.dataSource === 'real',
    isFallbackData: stats.dataSource === 'fallback',
    lastUpdated: stats.lastUpdated,
    refreshData,
  };
}

export default useRealAPIData;
