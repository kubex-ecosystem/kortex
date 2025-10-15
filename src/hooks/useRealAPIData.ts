/**
 * useRealAPIData Hook
 * Faz a ponte do dashboard do Pulse com o Gateway real do GoBE / Analyzer.
 * Normaliza scorecards, métricas de IA e provedores para consumo na UI,
 * mantendo fallback resiliente quando os serviços não estiverem disponíveis.
 */

import { useCallback, useEffect, useState } from 'react';
import { resilientGatewayService } from '../lib/resilientGatewayService';

const envRecord = import.meta.env as Record<string, string | boolean | undefined>;

const DEFAULT_ANALYZER_REPO = (() => {
  const raw = (envRecord.VITE_ANALYZER_REPOSITORY ?? envRecord.NEXT_PUBLIC_ANALYZER_REPOSITORY ?? 'kubex-ecosystem/gobe') as string;
  return raw?.trim() || 'kubex-ecosystem/gobe';
})();

const DEFAULT_ANALYZER_USER = (() => {
  const raw = (envRecord.VITE_ANALYZER_USER ?? envRecord.NEXT_PUBLIC_ANALYZER_USER ?? 'pulse-dashboard') as string;
  return raw?.trim() || 'pulse-dashboard';
})();

const DEFAULT_ANALYZER_PERIOD = (() => {
  const rawValue = (envRecord.VITE_ANALYZER_PERIOD ?? envRecord.NEXT_PUBLIC_ANALYZER_PERIOD ?? '60') as string;
  const parsed = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? 60 : parsed;
})();

type DataSourceKind = 'real' | 'fallback' | 'cached';

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isFromCache?: boolean;
  isFromFallback?: boolean;
  timestamp: number;
}

// Legacy gateway placeholder types ---------------------------------------

interface ScorecardEntry {
  id: string;
  title: string;
  description: string;
  score: number;
  updated_at: string;
  tags?: string[];
}

interface GatewayScorecardResponse {
  items?: ScorecardEntry[];
  version?: string;
}

interface GatewayMetricsResponse {
  metrics?: Record<string, unknown>;
  version?: string;
}

interface GatewayProviderItem {
  name: string;
  type?: string;
  org?: string;
  default_model?: string;
  available?: boolean;
  last_error?: string;
  metadata?: Record<string, unknown>;
}

// Analyzer enriched types ------------------------------------------------

interface AnalyzerScorecardRepository {
  owner?: string;
  name?: string;
  full_name?: string;
}

interface AnalyzerScorecardDORA {
  lead_time_p95_hours?: number;
  deployment_frequency_per_week?: number;
  change_fail_rate_pct?: number;
  mttr_hours?: number;
  period_days?: number;
}

interface AnalyzerScorecardCHI {
  chi_score?: number;
  duplication_pct?: number;
  cyclomatic_avg?: number;
  test_coverage_pct?: number;
  maintainability_index?: number;
  technical_debt_hours?: number;
  period_days?: number;
}

interface AnalyzerScorecardAI {
  hir?: number;
  aac?: number;
  tph?: number;
  human_hours?: number;
  ai_hours?: number;
  period_days?: number;
}

interface AnalyzerScorecardConfidence {
  dora?: number;
  chi?: number;
  ai?: number;
  group?: number;
}

interface AnalyzerScorecard {
  schema_version?: string;
  repository?: AnalyzerScorecardRepository;
  dora?: AnalyzerScorecardDORA;
  chi?: AnalyzerScorecardCHI;
  ai?: AnalyzerScorecardAI;
  bus_factor?: number;
  first_review_p50_hours?: number;
  confidence?: AnalyzerScorecardConfidence;
  generated_at?: string;
}

interface AnalyzerContributorHours {
  human?: number;
  ai?: number;
}

interface AnalyzerContributor {
  user?: string;
  hir?: number;
  aac?: number;
  tph?: number;
  hours?: AnalyzerContributorHours;
  commits?: number;
}

interface AnalyzerAggregateMetrics {
  hir_p50?: number;
  hir_p90?: number;
  aac?: number;
  tph_p50?: number;
}

interface AnalyzerConfidenceMetrics {
  hir?: number;
  aac?: number;
  tph?: number;
}

interface AnalyzerAIMetricsResponse {
  schema_version?: string;
  owner?: string;
  repo?: string;
  period_days?: number;
  contributors?: AnalyzerContributor[];
  aggregates?: AnalyzerAggregateMetrics;
  provenance?: { sources?: string[]; };
  confidence?: AnalyzerConfidenceMetrics;
}

// Normalised structures used by the Dashboard ----------------------------

interface NormalizedScorecard {
  schemaVersion: string;
  repoLabel: string | null;
  chiScore: number | null;
  duplicationPct: number | null;
  cyclomaticAvg: number | null;
  testCoveragePct: number | null;
  maintainabilityIndex: number | null;
  technicalDebtHours: number | null;
  leadTimeP95Hours: number | null;
  deploymentFrequencyWeek: number | null;
  changeFailRatePercent: number | null;
  mttrHours: number | null;
  busFactor: number | null;
  firstReviewP50Hours: number | null;
  confidence: AnalyzerScorecardConfidence | undefined;
  generatedAt: Date | null;
  fallback: boolean;
  raw: AnalyzerScorecard | GatewayScorecardResponse | null;
  placeholderItems?: ScorecardEntry[];
}

interface NormalizedAIMetrics {
  schemaVersion: string;
  hir: number | null;
  aac: number | null;
  tph: number | null;
  humanHours: number | null;
  aiHours: number | null;
  periodDays: number | null;
  contributors: AnalyzerContributor[];
  aggregates?: AnalyzerAggregateMetrics;
  confidence?: AnalyzerConfidenceMetrics;
  fallback: boolean;
  raw: AnalyzerAIMetricsResponse | GatewayMetricsResponse | null;
  legacyMetrics?: Record<string, unknown>;
}

interface GatewayDashboardStats {
  chiScore: number | null;
  leadTimeP95Hours: number | null;
  deploymentFrequencyWeek: number | null;
  changeFailRatePercent: number | null;
  mttrHours: number | null;
  hir: number | null;
  aac: number | null;
  tph: number | null;
  busFactor: number | null;
  connectedProviders: number;
  totalProviders: number;
  schemaVersion: string;
  dataSource: DataSourceKind;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

type GatewayFetchResult<T> = {
  data: T;
  raw: ServiceResponse<T>;
};

// Helpers ----------------------------------------------------------------

const isPlaceholderScorecard = (value: unknown): value is GatewayScorecardResponse =>
  !!value && typeof value === 'object' && Array.isArray((value as GatewayScorecardResponse).items);

const isAnalyzerScorecard = (value: unknown): value is AnalyzerScorecard =>
  !!value && typeof value === 'object' && 'repository' in (value as AnalyzerScorecard);

const isPlaceholderMetrics = (value: unknown): value is GatewayMetricsResponse =>
  !!value && typeof value === 'object' && 'metrics' in (value as GatewayMetricsResponse);

const isAnalyzerMetrics = (value: unknown): value is AnalyzerAIMetricsResponse =>
  !!value && typeof value === 'object' && 'aggregates' in (value as AnalyzerAIMetricsResponse);

const normalizeScorecard = (
  payload: AnalyzerScorecard | GatewayScorecardResponse | undefined
): NormalizedScorecard => {
  if (!payload) {
    return createFallbackScorecard();
  }

  if (isAnalyzerScorecard(payload)) {
    const repoLabel = payload.repository?.full_name ||
      [payload.repository?.owner, payload.repository?.name].filter(Boolean).join('/');

    return {
      schemaVersion: payload.schema_version || 'scorecard@1.0.0',
      repoLabel: repoLabel || null,
      chiScore: toNumber(payload.chi?.chi_score),
      duplicationPct: toNumber(payload.chi?.duplication_pct),
      cyclomaticAvg: toNumber(payload.chi?.cyclomatic_avg),
      testCoveragePct: toNumber(payload.chi?.test_coverage_pct),
      maintainabilityIndex: toNumber(payload.chi?.maintainability_index),
      technicalDebtHours: toNumber(payload.chi?.technical_debt_hours),
      leadTimeP95Hours: toNumber(payload.dora?.lead_time_p95_hours),
      deploymentFrequencyWeek: toNumber(payload.dora?.deployment_frequency_per_week),
      changeFailRatePercent: toNumber(payload.dora?.change_fail_rate_pct),
      mttrHours: toNumber(payload.dora?.mttr_hours),
      busFactor: toNumber(payload.bus_factor, null),
      firstReviewP50Hours: toNumber(payload.first_review_p50_hours),
      confidence: payload.confidence,
      generatedAt: payload.generated_at ? new Date(payload.generated_at) : null,
      fallback: false,
      raw: payload,
      placeholderItems: undefined,
    };
  }

  // Legacy placeholder
  const items = payload.items ?? [];
  const firstItem = items[0];
  const avgScore =
    items.length > 0
      ? items.reduce((sum, item) => sum + (typeof item.score === 'number' ? item.score : 0), 0) /
      items.length
      : null;

  return {
    schemaVersion: payload.version || 'gateway-placeholder-1',
    repoLabel: 'demo/repository',
    chiScore: avgScore !== null ? avgScore * 100 : null,
    duplicationPct: null,
    cyclomaticAvg: null,
    testCoveragePct: null,
    maintainabilityIndex: null,
    technicalDebtHours: null,
    leadTimeP95Hours: null,
    deploymentFrequencyWeek: null,
    changeFailRatePercent: null,
    mttrHours: null,
    busFactor: null,
    firstReviewP50Hours: null,
    confidence: undefined,
    generatedAt: firstItem?.updated_at ? new Date(firstItem.updated_at) : null,
    fallback: true,
    raw: payload,
    placeholderItems: items,
  };
};

const normalizeAIMetrics = (
  payload: AnalyzerAIMetricsResponse | GatewayMetricsResponse | undefined
): NormalizedAIMetrics => {
  if (!payload) {
    return createFallbackAIMetrics();
  }

  if (isAnalyzerMetrics(payload)) {
    const contributor = payload.contributors?.[0];
    return {
      schemaVersion: payload.schema_version || 'ai_metrics@1.0.0',
      hir: toNumber(payload.aggregates?.hir_p50, contributor?.hir ?? null),
      aac: toNumber(payload.aggregates?.aac, contributor?.aac ?? null),
      tph: toNumber(payload.aggregates?.tph_p50, contributor?.tph ?? null),
      humanHours: toNumber(contributor?.hours?.human, null),
      aiHours: toNumber(contributor?.hours?.ai, null),
      periodDays: toNumber(payload.period_days, null),
      contributors: payload.contributors ?? [],
      aggregates: payload.aggregates,
      confidence: payload.confidence,
      fallback: false,
      raw: payload,
      legacyMetrics: undefined,
    };
  }

  return {
    schemaVersion: payload.version || 'gateway-placeholder-1',
    hir: null,
    aac: null,
    tph: null,
    humanHours: null,
    aiHours: null,
    periodDays: null,
    contributors: [],
    aggregates: undefined,
    confidence: undefined,
    fallback: true,
    raw: payload,
    legacyMetrics: payload.metrics ?? {},
  };
};

const normalizeProviders = (items?: GatewayProviderItem[]): GatewayProviderItem[] => {
  if (!items || items.length === 0) {
    return [];
  }
  return items.map((provider) => ({
    ...provider,
    available: provider.available !== false,
  }));
};

const toNumber = (value: unknown, fallback: number | null = 0): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const buildStats = (
  scorecard: NormalizedScorecard,
  metrics: NormalizedAIMetrics,
  providers: GatewayProviderItem[],
  overrides: Partial<GatewayDashboardStats> = {}
): GatewayDashboardStats => {
  const connectedProviders = providers.filter((provider) => provider.available !== false).length;

  const derivedDataSource: DataSourceKind = scorecard.fallback && metrics.fallback
    ? 'fallback'
    : !scorecard.fallback || !metrics.fallback
      ? 'real'
      : 'fallback';

  return {
    chiScore: scorecard.chiScore,
    leadTimeP95Hours: scorecard.leadTimeP95Hours,
    deploymentFrequencyWeek: scorecard.deploymentFrequencyWeek,
    changeFailRatePercent: scorecard.changeFailRatePercent,
    mttrHours: scorecard.mttrHours,
    hir: metrics.hir,
    aac: metrics.aac,
    tph: metrics.tph,
    busFactor: scorecard.busFactor,
    connectedProviders,
    totalProviders: providers.length,
    schemaVersion: overrides.schemaVersion || scorecard.schemaVersion || metrics.schemaVersion,
    dataSource: overrides.dataSource || derivedDataSource,
    lastUpdated: overrides.lastUpdated ?? null,
    isLoading: overrides.isLoading ?? false,
    error: overrides.error ?? null,
  };
};

const createFallbackScorecard = (): NormalizedScorecard => ({
  schemaVersion: 'gateway-placeholder-1',
  repoLabel: 'demo/repository',
  chiScore: 75,
  duplicationPct: null,
  cyclomaticAvg: null,
  testCoveragePct: null,
  maintainabilityIndex: null,
  technicalDebtHours: null,
  leadTimeP95Hours: null,
  deploymentFrequencyWeek: null,
  changeFailRatePercent: null,
  mttrHours: null,
  busFactor: null,
  firstReviewP50Hours: null,
  confidence: undefined,
  generatedAt: new Date(),
  fallback: true,
  raw: {
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
  },
  placeholderItems: [
    {
      id: 'demo',
      title: 'AI Governance',
      description: 'Scorecard placeholder enquanto o Analyzer não responde',
      score: 0.75,
      updated_at: new Date().toISOString(),
      tags: ['placeholder', 'todo'],
    },
  ],
});

const createFallbackAIMetrics = (): NormalizedAIMetrics => ({
  schemaVersion: 'gateway-placeholder-1',
  hir: null,
  aac: null,
  tph: null,
  humanHours: null,
  aiHours: null,
  periodDays: null,
  contributors: [],
  aggregates: undefined,
  confidence: undefined,
  fallback: true,
  raw: {
    metrics: {
      requests_last_hour: 0,
      avg_latency_ms: 0,
      success_rate: 1,
    },
    version: 'gateway-placeholder-1',
  },
  legacyMetrics: {
    requests_last_hour: 0,
    avg_latency_ms: 0,
    success_rate: 1,
  },
});

const FALLBACK_SCORECARD = createFallbackScorecard();
const FALLBACK_AI_METRICS = createFallbackAIMetrics();
const FALLBACK_PROVIDERS: GatewayProviderItem[] = [];

const FALLBACK_STATS = buildStats(FALLBACK_SCORECARD, FALLBACK_AI_METRICS, FALLBACK_PROVIDERS, {
  dataSource: 'fallback',
  lastUpdated: null,
  isLoading: false,
});

const ANALYZER_QUERY = (() => {
  const params = new URLSearchParams();
  if (DEFAULT_ANALYZER_REPO) params.set('repo', DEFAULT_ANALYZER_REPO);
  if (DEFAULT_ANALYZER_USER) params.set('user', DEFAULT_ANALYZER_USER);
  if (DEFAULT_ANALYZER_PERIOD) params.set('period', String(DEFAULT_ANALYZER_PERIOD));
  const query = params.toString();
  return query.length > 0 ? `?${query}` : '';
})();

// Hook -------------------------------------------------------------------

export function useRealAPIData() {
  const [stats, setStats] = useState<GatewayDashboardStats>(FALLBACK_STATS);
  const [scorecard, setScorecard] = useState<NormalizedScorecard>(FALLBACK_SCORECARD);
  const [aiMetrics, setAIMetrics] = useState<NormalizedAIMetrics>(FALLBACK_AI_METRICS);
  const [providers, setProviders] = useState<GatewayProviderItem[]>(FALLBACK_PROVIDERS);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchScorecard = useCallback(async (): Promise<GatewayFetchResult<AnalyzerScorecard | GatewayScorecardResponse>> => {
    const endpoint = `/api/v1/scorecard${ANALYZER_QUERY}`;
    const response = (await resilientGatewayService.safeRequest<AnalyzerScorecard | GatewayScorecardResponse>(
      endpoint
    )) as ServiceResponse<AnalyzerScorecard | GatewayScorecardResponse>;

    if (response.success && response.data) {
      return { data: response.data, raw: response };
    }

    const fallback = createFallbackScorecard().raw as GatewayScorecardResponse;
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

  const fetchMetrics = useCallback(async (): Promise<GatewayFetchResult<AnalyzerAIMetricsResponse | GatewayMetricsResponse>> => {
    const endpoint = `/api/v1/metrics/ai${ANALYZER_QUERY}`;
    const response = (await resilientGatewayService.safeRequest<AnalyzerAIMetricsResponse | GatewayMetricsResponse>(
      endpoint
    )) as ServiceResponse<AnalyzerAIMetricsResponse | GatewayMetricsResponse>;

    if (response.success && response.data) {
      return { data: response.data, raw: response };
    }

    const fallback = createFallbackAIMetrics().raw as GatewayMetricsResponse;
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

  const fetchProviders = useCallback(async (): Promise<GatewayFetchResult<{ providers?: GatewayProviderItem[]; timestamp?: string; }>> => {
    const response = (await resilientGatewayService.safeRequest<{ providers?: GatewayProviderItem[]; timestamp?: string; }>(
      '/providers'
    )) as ServiceResponse<{ providers?: GatewayProviderItem[]; timestamp?: string; }>;

    if (response.success && response.data) {
      return { data: response.data, raw: response };
    }

    const fallback = { providers: FALLBACK_PROVIDERS, timestamp: new Date().toISOString() };
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
    setError(null);

    try {
      const [scorecardResult, metricsResult, providersResult] = await Promise.all([
        fetchScorecard(),
        fetchMetrics(),
        fetchProviders(),
      ]);

      const responses = [scorecardResult.raw, metricsResult.raw, providersResult.raw];

      const isFallback = responses.some((resp) => !resp?.success || resp?.isFromFallback);
      const isCached = responses.some((resp) => resp?.isFromCache);

      const normalizedScorecard = normalizeScorecard(scorecardResult.data);
      const normalizedMetrics = normalizeAIMetrics(metricsResult.data);
      const normalizedProviders = normalizeProviders(providersResult.data?.providers);

      setScorecard(normalizedScorecard);
      setAIMetrics(normalizedMetrics);
      setProviders(normalizedProviders);

      const dataSource: DataSourceKind = isFallback ? 'fallback' : isCached ? 'cached' : 'real';

      const nextStats = buildStats(normalizedScorecard, normalizedMetrics, normalizedProviders, {
        dataSource,
        schemaVersion:
          normalizedScorecard.schemaVersion ||
          normalizedMetrics.schemaVersion ||
          scorecard.schemaVersion,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });

      setStats(nextStats);
      console.log(`✅ Gateway data loaded (source: ${dataSource})`, nextStats);
    } catch (err) {
      console.error('🔴 Error fetching gateway data:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch gateway data';
      setError(message);
      setStats((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
        dataSource: 'fallback',
      }));
    }
  }, [fetchMetrics, fetchProviders, fetchScorecard, isClient, scorecard.schemaVersion]);

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
    error: error || stats.error,
    isRealData: stats.dataSource === 'real',
    isFallbackData: stats.dataSource === 'fallback',
    lastUpdated: stats.lastUpdated,
    refreshData,
    scorecard,
    aiMetrics,
    providers,
    analyzerConfig: {
      repo: DEFAULT_ANALYZER_REPO,
      user: DEFAULT_ANALYZER_USER,
      period: DEFAULT_ANALYZER_PERIOD,
    },
  };
}

export default useRealAPIData;
