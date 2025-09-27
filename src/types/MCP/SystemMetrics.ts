export type MCPDataSource = 'real' | 'fallback' | 'cached';

export interface SystemMetricsCPU {
  usage: number;
  cores: number;
  temperature?: number;
}

export interface SystemMetricsMemory {
  used: number;
  total: number;
  percentage: number;
}

export interface SystemMetricsDisk {
  used: number;
  total: number;
  percentage: number;
}

export interface SystemMetricsNetwork {
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
}

export interface SystemMetrics {
  cpu: SystemMetricsCPU;
  memory: SystemMetricsMemory;
  disk: SystemMetricsDisk;
  network: SystemMetricsNetwork;
  uptime: number;
  loadAverage: number[];
  processes: number;
}

export interface SystemMetricsApiPayload {
  status?: string;
  data?: SystemMetrics;
  timestamp?: number;
}

export interface SystemMetricsState {
  metrics: SystemMetrics;
  dataSource: MCPDataSource;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
