// src/types/HelmTypes.tsx

export interface HelmRelease {
  name: string;
  namespace: string;
  chart: string;
  status: string;
  revision: number;
  updated: string;
  app_version?: string;
}

export interface HelmDeployRequest {
  release_name: string;
  chart_path: string;
  namespace?: string;
  values?: Record<string, any>;
  dry_run?: boolean;
  create_namespace?: boolean;
  timeout?: number;
}

export interface HelmSystemContext {
  cluster_name: string;
  kubectl_context?: string;
  os_info: string;
  cpu: string;
  memory: string;
  helm_installed: boolean;
  internet_connectivity: boolean;
}

export interface HelmDeployResult {
  success: boolean;
  status: 'deployed' | 'failed';
  release_name?: string;
  chart_path?: string;
  namespace?: string;
  output?: string;
  error?: string;
  suggestion?: string;
  analysis?: {
    error_type: string;
    critical: boolean;
    actionable: boolean;
    description?: string;
  };
  context?: {
    cluster: string;
    os: string;
    helm_installed: boolean;
    internet?: boolean;
  };
  timestamp?: string;
}

export interface HelmReleasesResponse {
  success: boolean;
  releases: HelmRelease[];
  count: number;
  namespace_filter?: string;
  error?: string;
}

export interface HelmContextResponse {
  success: boolean;
  context: HelmSystemContext;
  recommendations: {
    install_helm: boolean;
    check_connectivity: boolean;
    configure_kubectl: boolean;
  };
  error?: string;
}

export interface HelmStatusResponse {
  success: boolean;
  release_name: string;
  namespace: string;
  status_data?: any;
  error?: string;
}

export enum HelmOperationStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout'
}

export interface HelmChartValues {
  [key: string]: any;
}

export interface HelmDeployFormData {
  releaseName: string;
  chartPath: string;
  namespace: string;
  values: string; // YAML string
  dryRun: boolean;
  createNamespace: boolean;
  timeout: number;
}

export interface HelmLog {
  id: string;
  timestamp: string;
  operation: 'deploy' | 'uninstall' | 'status' | 'list';
  release_name?: string;
  namespace?: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  details?: string;
}
