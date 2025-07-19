import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, TestTube, Check, AlertCircle } from 'lucide-react';
import { APIProvider } from '../../types/APITypes';
import { mcpService } from '../../lib/mcpService';

interface APIProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: APIProvider) => void;
  provider?: APIProvider | null; // null = add mode, provider = edit mode
}

export function APIProviderModal({ isOpen, onClose, onSave, provider }: APIProviderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'OpenAI',
    keyPreview: '',
    status: 'Disconnected' as 'Connected' | 'Disconnected' | 'Testing',
    requestsToday: 0,
    monthlyLimit: 10000,
    costPerRequest: 0.002,
    // MCP specific fields
    mcpEndpoint: 'http://127.0.0.1:3002',
    githubToken: '',
    azureToken: '',
    azureOrg: '',
    azureProject: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showAzureToken, setShowAzureToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with provider data if editing
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        provider: provider.provider || 'OpenAI',
        keyPreview: provider.keyPreview || '',
        status: provider.status || 'Disconnected',
        requestsToday: provider.requestsToday || 0,
        monthlyLimit: provider.monthlyLimit || 10000,
        costPerRequest: provider.costPerRequest || 0.002,
        mcpEndpoint: provider.mcpEndpoint || 'http://127.0.0.1:3002',
        githubToken: provider.githubToken || '',
        azureToken: provider.azureToken || '',
        azureOrg: provider.azureOrg || '',
        azureProject: provider.azureProject || ''
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        provider: 'OpenAI',
        keyPreview: '',
        status: 'Disconnected',
        requestsToday: 0,
        monthlyLimit: 10000,
        costPerRequest: 0.002,
        mcpEndpoint: 'http://127.0.0.1:3002',
        githubToken: '',
        azureToken: '',
        azureOrg: '',
        azureProject: ''
      });
    }
    setErrors({});
    setTestResult(null);
  }, [provider, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.keyPreview.trim()) {
      newErrors.keyPreview = 'API Key é obrigatória';
    }

    if (formData.provider === 'StatusRafa MCP') {
      if (!formData.mcpEndpoint.trim()) {
        newErrors.mcpEndpoint = 'Endpoint MCP é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      if (formData.provider === 'StatusRafa MCP' && formData.mcpEndpoint) {
        // Test MCP connection
        const connected = await mcpService.testConnection();
        if (connected) {
          const status = await mcpService.getStatus();
          setTestResult(`✅ MCP Server conectado com sucesso! ${status?.memory_entries || 0} entradas na memória.`);
          handleInputChange('status', 'Connected');
        } else {
          setTestResult('❌ Falha ao conectar com MCP Server. Verifique se está rodando na porta 3002.');
          handleInputChange('status', 'Disconnected');
        }
      } else {
        // Simulate API provider test
        setTimeout(() => {
          const success = Math.random() > 0.3; // 70% success rate for demo
          if (success) {
            setTestResult(`✅ Conexão com ${formData.provider} bem-sucedida!`);
            handleInputChange('status', 'Connected');
          } else {
            setTestResult(`❌ Falha na conexão com ${formData.provider}. Verifique a API key.`);
            handleInputChange('status', 'Disconnected');
          }
          setIsTesting(false);
        }, 2000);
        return;
      }
    } catch (error) {
      setTestResult(`❌ Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      handleInputChange('status', 'Disconnected');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newProvider: APIProvider = {
      id: provider?.id || Date.now().toString(),
      name: formData.name,
      provider: formData.provider,
      keyPreview: formData.keyPreview,
      status: formData.status,
      lastTested: new Date().toISOString(),
      requestsToday: formData.requestsToday,
      monthlyLimit: formData.monthlyLimit,
      costPerRequest: formData.costPerRequest,
      mcpEndpoint: formData.mcpEndpoint,
      githubToken: formData.githubToken,
      azureToken: formData.azureToken,
      azureOrg: formData.azureOrg,
      azureProject: formData.azureProject
    };

    onSave(newProvider);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {provider ? 'Editar API Provider' : 'Adicionar API Provider'}
          </h2>
          <button
            title='Fechar Modal'
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Provider
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: OpenAI Production, MCP Server Local"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Provider
              </label>
              <select
                name="provider"
                title='Selecione o tipo de provider'
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="OpenAI">OpenAI</option>
                <option value="Anthropic">Anthropic</option>
                <option value="StatusRafa MCP">StatusRafa MCP</option>
                <option value="Local">Local</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  name="keyPreview"
                  title='Chave da API'
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.keyPreview}
                  onChange={(e) => handleInputChange('keyPreview', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md dark:bg-gray-700 dark:text-white ${
                    errors.keyPreview ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="sk-..."
                />
                <button
                  title='Mostrar/ocultar chave da API'
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.keyPreview && <p className="text-red-500 text-xs mt-1">{errors.keyPreview}</p>}
            </div>
          </div>

          {/* MCP Configuration */}
          {formData.provider === 'StatusRafa MCP' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Configuração MCP</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Endpoint MCP
                </label>
                <input
                  title='Endpoint do MCP Server'
                  name="mcpEndpoint"
                  type="text"
                  value={formData.mcpEndpoint}
                  onChange={(e) => handleInputChange('mcpEndpoint', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white ${
                    errors.mcpEndpoint ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="http://127.0.0.1:3002"
                />
                {errors.mcpEndpoint && <p className="text-red-500 text-xs mt-1">{errors.mcpEndpoint}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub Token
                </label>
                <div className="relative">
                  <input
                    title='Token do GitHub para autenticação'
                    name="githubToken"
                    type={showGithubToken ? 'text' : 'password'}
                    value={formData.githubToken}
                    onChange={(e) => handleInputChange('githubToken', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="ghp_..."
                  />
                  <button
                    title='Mostrar/ocultar token do GitHub'
                    type="button"
                    onClick={() => setShowGithubToken(!showGithubToken)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showGithubToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Azure DevOps Token
                </label>
                <div className="relative">
                  <input
                    title='Token do Azure DevOps para autenticação'
                    name="azureToken"
                    type={showAzureToken ? 'text' : 'password'}
                    value={formData.azureToken}
                    onChange={(e) => handleInputChange('azureToken', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Azure DevOps PAT"
                  />
                  <button
                    title='Mostrar/ocultar token do Azure DevOps'
                    type="button"
                    onClick={() => setShowAzureToken(!showAzureToken)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showAzureToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Azure Organization
                  </label>
                  <input
                    title='Organização do Azure DevOps'
                    name="azureOrg"
                    type="text"
                    value={formData.azureOrg}
                    onChange={(e) => handleInputChange('azureOrg', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="rafa-mori"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Azure Project
                  </label>
                  <input
                    title='Projeto do Azure DevOps'
                    name="azureProject"
                    type="text"
                    value={formData.azureProject}
                    onChange={(e) => handleInputChange('azureProject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="kubex"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Configuração</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Limite Mensal
                </label>
                <input
                  title='Limite mensal de requisições'
                  name="monthlyLimit"
                  type="number"
                  value={formData.monthlyLimit}
                  onChange={(e) => handleInputChange('monthlyLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custo por Request
                </label>
                <input
                  title='Custo por requisição em dólares'
                  name="costPerRequest"
                  type="number"
                  step="0.001"
                  value={formData.costPerRequest}
                  onChange={(e) => handleInputChange('costPerRequest', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requests Hoje
                </label>
                <input
                  title='Número de requisições feitas hoje'
                  name="requestsToday"
                  type="number"
                  value={formData.requestsToday}
                  onChange={(e) => handleInputChange('requestsToday', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Connection Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Teste de Conexão</h3>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={testConnection}
                disabled={isTesting}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
              >
                <TestTube className={`h-4 w-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testando...' : 'Testar Conexão'}
              </button>
              
              <div className={`flex items-center space-x-1 ${
                formData.status === 'Connected' ? 'text-green-600' : 
                formData.status === 'Testing' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  formData.status === 'Connected' ? 'bg-green-500' : 
                  formData.status === 'Testing' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">{formData.status}</span>
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-md text-sm ${
                testResult.startsWith('✅') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              <Check className="h-4 w-4 mr-2" />
              {provider ? 'Atualizar' : 'Adicionar'} Provider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
