import { Activity, AlertCircle, CheckCircle, Clock, Package, Play, Server, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  HelmContextResponse,
  HelmDeployRequest,
  HelmDeployResult,
  HelmRelease,
  HelmReleasesResponse,
  HelmSystemContext
} from '../types';

const HelmPage: React.FC = () => {
  const [releases, setReleases] = useState<HelmRelease[]>([]);
  const [systemContext, setSystemContext] = useState<HelmSystemContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [deployFormVisible, setDeployFormVisible] = useState(false);
  const [deployForm, setDeployForm] = useState<HelmDeployRequest>({
    release_name: '',
    chart_path: '',
    namespace: 'default',
    values: undefined,
    dry_run: false,
    create_namespace: true,
    timeout: 300
  });
  const [valuesYaml, setValuesYaml] = useState<string>('');
  const [lastOperation, setLastOperation] = useState<string>('');

  // Carregar dados iniciais
  useEffect(() => {
    loadSystemContext();
    loadReleases();
  }, []);

  // Recarregar releases quando namespace muda
  useEffect(() => {
    loadReleases();
  }, [selectedNamespace]);

  const loadSystemContext = async () => {
    try {
      const response = await fetch('/api/helm/context');
      const data: HelmContextResponse = await response.json();
      
      if (data.success) {
        setSystemContext(data.context);
      } else {
        setError(data.error || 'Erro ao carregar contexto do sistema');
      }
    } catch (err) {
      setError('Erro de conectividade ao carregar contexto');
      console.error('Erro ao carregar contexto:', err);
    }
  };

  const loadReleases = async () => {
    try {
      setLoading(true);
      const url = selectedNamespace 
        ? `/api/helm/releases?namespace=${selectedNamespace}`
        : '/api/helm/releases';
      
      const response = await fetch(url);
      const data: HelmReleasesResponse = await response.json();
      
      if (data.success) {
        setReleases(data.releases);
        setError('');
      } else {
        setError(data.error || 'Erro ao carregar releases');
      }
    } catch (err) {
      setError('Erro de conectividade ao carregar releases');
      console.error('Erro ao carregar releases:', err);
    } finally {
      setLoading(false);
    }
  };

  const deployChart = async () => {
    if (!deployForm.release_name || !deployForm.chart_path) {
      setError('Nome do release e caminho do chart são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      setLastOperation(`Deploying ${deployForm.release_name}...`);

      // Parse values YAML se fornecido
      let values = undefined;
      if (valuesYaml.trim()) {
        try {
          values = JSON.parse(valuesYaml); // Assumindo JSON por simplicidade
        } catch {
          // Se não for JSON válido, mandar como string e deixar o backend lidar
          values = { yaml_content: valuesYaml };
        }
      }

      const deployRequest = { ...deployForm, values };
      
      const response = await fetch('/api/helm/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployRequest),
      });

      const result: HelmDeployResult = await response.json();
      
      if (result.success) {
        setLastOperation(`✅ ${deployForm.release_name} deployed successfully`);
        setDeployFormVisible(false);
        // Reset form
        setDeployForm({
          release_name: '',
          chart_path: '',
          namespace: 'default',
          values: undefined,
          dry_run: false,
          create_namespace: true,
          timeout: 300
        });
        setValuesYaml('');
        // Reload releases
        await loadReleases();
      } else {
        setLastOperation(`❌ Deploy failed: ${result.error}`);
        setError(result.error || 'Deploy falhou');
      }
    } catch (err) {
      setLastOperation(`❌ Deploy error: ${err}`);
      setError('Erro de conectividade durante deploy');
      console.error('Erro no deploy:', err);
    } finally {
      setLoading(false);
    }
  };

  const uninstallRelease = async (releaseName: string, namespace: string) => {
    if (!confirm(`Tem certeza que deseja remover o release "${releaseName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setLastOperation(`Uninstalling ${releaseName}...`);

      const response = await fetch(`/api/helm/releases/${releaseName}?namespace=${namespace}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setLastOperation(`✅ ${releaseName} uninstalled successfully`);
        await loadReleases();
      } else {
        setLastOperation(`❌ Uninstall failed: ${result.error}`);
        setError(result.error || 'Falha ao remover release');
      }
    } catch (err) {
      setLastOperation(`❌ Uninstall error: ${err}`);
      setError('Erro de conectividade durante remoção');
      console.error('Erro na remoção:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending-install':
      case 'pending-upgrade':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUniqueNamespaces = () => {
    const namespaces = releases.map(r => r.namespace);
    return ['', ...Array.from(new Set(namespaces))];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Helm Chart Manager
            </h1>
          </div>
          
          {/* System Context */}
          {systemContext && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <h3 className="font-semibold text-gray-900 dark:text-white">System Context</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Cluster:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemContext.cluster_name}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">OS:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{systemContext.os_info}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Helm:</span>
                  <p className={`font-medium ${systemContext.helm_installed ? 'text-green-600' : 'text-red-600'}`}>
                    {systemContext.helm_installed ? '✅ Installed' : '❌ Not Found'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Internet:</span>
                  <p className={`font-medium ${systemContext.internet_connectivity ? 'text-green-600' : 'text-red-600'}`}>
                    {systemContext.internet_connectivity ? '✅ Online' : '❌ Offline'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setDeployFormVisible(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <Play className="w-4 h-4" />
            Deploy Chart
          </button>
          
          <button
            onClick={loadReleases}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            <Activity className="w-4 h-4" />
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          <select
            title='Filter by Namespace'
            name="namespace"
            id="namespace"
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Namespaces</option>
            {getUniqueNamespaces().slice(1).map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>

        {/* Last Operation */}
        {lastOperation && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">{lastOperation}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Deploy Form Modal */}
        {deployFormVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Deploy Helm Chart</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Release Name *
                  </label>
                  <input
                    type="text"
                    value={deployForm.release_name}
                    onChange={(e) => setDeployForm({...deployForm, release_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="my-app"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chart Path *
                  </label>
                  <input
                    type="text"
                    value={deployForm.chart_path}
                    onChange={(e) => setDeployForm({...deployForm, chart_path: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="oci://ghcr.io/user/chart or ./local-chart"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Namespace
                    </label>
                    <input
                      type="text"
                      value={deployForm.namespace}
                      onChange={(e) => setDeployForm({...deployForm, namespace: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      title='Filter by Namespace'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={deployForm.timeout}
                      onChange={(e) => setDeployForm({...deployForm, timeout: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      title='Set Timeout in Seconds'
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Values (JSON/YAML)
                  </label>
                  <textarea
                    value={valuesYaml}
                    onChange={(e) => setValuesYaml(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder='{"image": {"tag": "v1.0.0"}}'
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={deployForm.dry_run}
                      onChange={(e) => setDeployForm({...deployForm, dry_run: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dry Run (simulate only)</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={deployForm.create_namespace}
                      onChange={(e) => setDeployForm({...deployForm, create_namespace: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Create Namespace</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={deployChart}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Deploying...' : 'Deploy'}
                </button>
                
                <button
                  onClick={() => setDeployFormVisible(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Releases List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Helm Releases ({releases.length})
            </h2>
          </div>

          {releases.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {loading ? 'Loading releases...' : 'No Helm releases found'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {releases.map((release) => (
                <div key={`${release.namespace}-${release.name}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(release.status)}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {release.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {release.chart} • {release.namespace}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        release.status === 'deployed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : release.status === 'failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {release.status}
                      </span>
                      
                      <button
                        onClick={() => uninstallRelease(release.name, release.namespace)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        disabled={loading}
                        title="Uninstall release"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-3 gap-4">
                    <span>Rev: {release.revision}</span>
                    <span>Updated: {new Date(release.updated).toLocaleDateString()}</span>
                    <span>App: {release.app_version || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelmPage;
