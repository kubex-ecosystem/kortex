/**
 * DynamicConfigPanel Component
 * Painel de configuração dinâmica do MCP Server v2.0
 * Permite alteração em tempo real de configurações, gerenciamento de secrets e comandos
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Terminal,
  Download,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Play,
  Square,
} from 'lucide-react';
import { useDynamicMCPConfig } from '../../hooks/useDynamicMCPConfig';

interface DynamicConfigPanelProps {
  className?: string;
}

const DynamicConfigPanel: React.FC<DynamicConfigPanelProps> = ({ className = '' }) => {
  const [configState, configActions] = useDynamicMCPConfig();
  const [activeTab, setActiveTab] = useState<'config' | 'secrets' | 'commands' | 'backups'>('config');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [secretsData, setSecretsData] = useState<Record<string, string>>({});
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [commandArgs, setCommandArgs] = useState<string>('');

  const handleSecretsUpdate = (key: string, value: string) => {
    setSecretsData(prev => ({ ...prev, [key]: value }));
  };

  const executeCommand = async () => {
    if (!selectedCommand) return;
    
    const args = commandArgs.trim() ? commandArgs.split(' ') : [];
    const result = await configActions.executeCommand(selectedCommand, args, true);
    
    console.log('Command result:', result);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const createBackup = async () => {
    const result = await configActions.createBackup();
    if (result) {
      console.log('Backup created:', result.backup_path);
    }
  };

  const tabs = [
    { id: 'config', label: 'Configuração', icon: Settings },
    { id: 'secrets', label: 'Secrets', icon: Shield },
    { id: 'commands', label: 'Comandos', icon: Terminal },
    { id: 'backups', label: 'Backups', icon: Download },
  ];

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuração Dinâmica MCP
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={configActions.refreshConfig}
            disabled={configState.isLoading}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            title="Atualizar configuração"
            aria-label="Atualizar configuração"
          >
            <RefreshCw className={`w-4 h-4 ${configState.isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => configActions.updateConfig(configState.config || {}, secretsData)}
            disabled={configState.isUpdating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {configState.isUpdating ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {(configState.configError || configState.commandError || configState.error) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-300 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {configState.configError || configState.commandError || configState.error}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {configState.config && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Status da Configuração</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Servidor</div>
                    <div className="text-white font-mono">
                      {configState.config.server?.host}:{configState.config.server?.port}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Provedores Ativos</div>
                    <div className="text-white font-mono">
                      {configState.config.providers ? 
                        Object.keys(configState.config.providers).length : 0}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-medium text-white mb-2">Configuração Atual</h4>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(configState.config, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <motion.div
            key="secrets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Gerenciamento de Secrets</h3>
              <button
                onClick={() => configActions.updateSecrets(secretsData)}
                disabled={Object.keys(secretsData).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Atualizar Secrets
              </button>
            </div>

            {configState.secretsStatus && Object.entries(configState.secretsStatus).map(([key, status]) => (
              <div key={key} className="p-4 bg-gray-800 rounded border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-white capitalize">{key.replace('_', ' ')}</label>
                  <div className="flex items-center gap-2">
                    {status.exists && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <button
                      onClick={() => toggleSecretVisibility(key)}
                      className="p-1 text-gray-400 hover:text-white"
                      title={showSecrets[key] ? 'Ocultar secret' : 'Mostrar secret'}
                      aria-label={showSecrets[key] ? 'Ocultar secret' : 'Mostrar secret'}
                    >
                      {showSecrets[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <input
                  type={showSecrets[key] ? 'text' : 'password'}
                  value={secretsData[key] || ''}
                  onChange={(e) => handleSecretsUpdate(key, e.target.value)}
                  placeholder={status.exists ? 'Valor atual configurado' : 'Digite o novo valor'}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  title={`Secret para ${key}`}
                />
                
                {status.masked_value && (
                  <div className="mt-1 text-xs text-gray-400">
                    Atual: {status.masked_value}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* Commands Tab */}
        {activeTab === 'commands' && (
          <motion.div
            key="commands"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Comandos do Sistema</h3>
              <button
                onClick={configActions.refreshCommands}
                disabled={configState.isLoading}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                title="Atualizar lista de comandos"
                aria-label="Atualizar lista de comandos"
              >
                <RefreshCw className={`w-4 h-4 ${configState.isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Comando</label>
                <select
                  value={selectedCommand}
                  onChange={(e) => setSelectedCommand(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  title="Selecionar comando para executar"
                  aria-label="Selecionar comando"
                >
                  <option value="">Selecione um comando</option>
                  {configState.commandCategories.map(category => (
                    <optgroup key={category} label={category}>
                      {configState.availableCommands[category]?.map(cmd => (
                        <option key={cmd.name} value={cmd.name}>
                          {cmd.name} - {cmd.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Argumentos</label>
                <input
                  type="text"
                  value={commandArgs}
                  onChange={(e) => setCommandArgs(e.target.value)}
                  placeholder="argumentos separados por espaço"
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  title="Argumentos do comando"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={executeCommand}
                disabled={!selectedCommand || configState.isExecutingCommand}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {configState.isExecutingCommand ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {configState.isExecutingCommand ? 'Executando...' : 'Executar'}
              </button>

              <button
                onClick={() => configActions.validateCommand(selectedCommand, commandArgs.split(' '))}
                disabled={!selectedCommand}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Validar
              </button>
            </div>

            {/* Command Stats */}
            {configState.commandStats && (
              <div className="mt-6 p-4 bg-gray-800 rounded">
                <h4 className="font-medium text-white mb-2">Estatísticas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Total de Comandos</div>
                    <div className="text-white font-mono">{configState.commandStats.total_commands || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Categorias</div>
                    <div className="text-white font-mono">{configState.commandCategories.length}</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <motion.div
            key="backups"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Backup & Restore</h3>
              <button
                onClick={createBackup}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Criar Backup
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => configActions.listBackups()}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Listar Backups
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Display */}
      {configState.configStats && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h4 className="font-medium text-white mb-2">Status da Configuração</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Última Atualização</div>
              <div className="text-white font-mono">
                {configState.lastUpdate?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Total Secrets</div>
              <div className="text-white font-mono">
                {configState.secretsStatus ? Object.keys(configState.secretsStatus).length : 0}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Secrets Configurados</div>
              <div className="text-white font-mono">
                {configState.secretsStatus ? 
                  Object.values(configState.secretsStatus).filter(s => s.exists).length : 0}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <div className="text-green-400 font-mono">
                {configState.isLoading ? 'Carregando...' : 'Online'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicConfigPanel;
