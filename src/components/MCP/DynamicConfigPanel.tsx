/**
 * DynamicConfigPanel Component
 * Painel de configuração dinâmica do MCP Server v2.0
 * Permite alteração em tempo real de configurações, gerenciamento de secrets e comandos
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Play,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Square,
  Terminal,
} from 'lucide-react';
import React, { useState } from 'react';
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
  const objConfigActions = (configActions || {executeCommand: undefined}) as {
    refreshConfig?: () => Promise<void>;
    executeCommand?: (command: string, args: string[], silent?: boolean) => Promise<any>;
    refreshCommands?: () => Promise<void>;
    listBackups?: () => Promise<any>;
    createBackup?: () => Promise<any>;
    updateSecrets?: (secrets: Record<string, string>) => Promise<void>;
    validateCommand?: (command: string, args: string[]) => Promise<any>;
    updateConfig?: (config: Record<string, any>, secrets: Record<string, string>) => Promise<void>;
  }
  const objConfigState = (configState || {isLoading: false, isUpdating: false}) as {
    isLoading?: boolean;
    isUpdating?: boolean;
    isExecutingCommand?: boolean;
    config?: Record<string, any>;
    lastUpdate?: Date;
    configStats?: {
      totalConfigs?: number;
      enabledConfigs?: number;
      lastUpdate?: Date;
    };
    commandCategories?: string[];
    availableCommands?: Record<string, {name: string; description: string}[]>;
    configError?: string;
    commandError?: string;
    commandStats?: {
      total_commands: number;
      total_categories: number;
      lastUpdate: Date;
    };
    secretsStatus?: Record<string, { exists: boolean; masked_value?: string }>;
    error?: string;
  }

  const handleSecretsUpdate = (key: string, value: string) => {
    setSecretsData(prev => ({ ...prev, [key]: value }));
  };

  const executeCommand = async () => {
    if (!selectedCommand) return;
    
    const args = commandArgs.trim() ? commandArgs.split(' ') : [];
    if (!objConfigActions.executeCommand) {
      console.warn('🔴 executeCommand action is not available in fallback mode');
      return;
    }
    const result = await (objConfigActions.executeCommand as Function)(selectedCommand, args, true);
    
    console.log('Command result:', result);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const createBackup = async () => {
    if (!objConfigActions.createBackup) {
      console.warn('🔴 createBackup action is not available in fallback mode');
      return;
    }
    const result = await (objConfigActions.createBackup as Function)();
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
            onClick={() => ((objConfigActions || {refreshConfig: undefined}).refreshConfig as Function)()}
            disabled={objConfigState.isLoading}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            title="Atualizar configuração"
            aria-label="Atualizar configuração"
          >
            <RefreshCw className={`w-4 h-4 ${objConfigState.isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => (objConfigActions.updateConfig as Function)(objConfigState.config || {}, secretsData)}
            disabled={objConfigState.isUpdating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {objConfigState.isUpdating ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {(objConfigState.configError || objConfigState.commandError || objConfigState.error) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-300 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {objConfigState.configError || objConfigState.commandError || objConfigState.error}
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
            {objConfigState.config && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Status da Configuração</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Servidor</div>
                    <div className="text-white font-mono">
                      {objConfigState.config.server?.host}:{objConfigState.config.server?.port}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 rounded">
                    <div className="text-gray-400 text-sm">Provedores Ativos</div>
                    <div className="text-white font-mono">
                      {objConfigState.config.providers ?
                        Object.keys(objConfigState.config.providers).length : 0}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-800 rounded">
                  <h4 className="font-medium text-white mb-2">Configuração Atual</h4>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(objConfigState.config, null, 2)}
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
                onClick={() => (objConfigActions.updateSecrets as Function)(secretsData)}
                disabled={Object.keys(secretsData).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Atualizar Secrets
              </button>
            </div>

            {objConfigState.secretsStatus && Object.entries(objConfigState.secretsStatus).map(([key, status]) => (
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
                onClick={objConfigActions.refreshCommands}
                disabled={objConfigState.isLoading}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                title="Atualizar lista de comandos"
                aria-label="Atualizar lista de comandos"
              >
                <RefreshCw className={`w-4 h-4 ${objConfigState.isLoading ? 'animate-spin' : ''}`} />
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
                  {(objConfigState.commandCategories || []).map(category => (
                    <optgroup key={category} label={category}>
                      {(objConfigState.availableCommands || {})[category]?.map(cmd => (
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
                disabled={!selectedCommand || objConfigState.isExecutingCommand}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {objConfigState.isExecutingCommand ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {objConfigState.isExecutingCommand ? 'Executando...' : 'Executar'}
              </button>

              <button
                title="Validar comando"
                onClick={() => ((objConfigActions || {validateCommand: () => {}}).validateCommand as Function)(selectedCommand, commandArgs.split(' '))}
                disabled={!selectedCommand}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Validar
              </button>
            </div>

            {/* Command Stats */}
            {objConfigState.commandStats && (
              <div className="mt-6 p-4 bg-gray-800 rounded">
                <h4 className="font-medium text-white mb-2">Estatísticas</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Total de Comandos</div>
                    <div className="text-white font-mono">{objConfigState.commandStats.total_commands || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Categorias</div>
                    <div className="text-white font-mono">{(objConfigState.commandCategories || []).length}</div>
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
                onClick={() => ((objConfigActions || {listBackups: () => {}}).listBackups as Function)()}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Listar Backups
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Display */}
      {objConfigState.configStats && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h4 className="font-medium text-white mb-2">Status da Configuração</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Última Atualização</div>
              <div className="text-white font-mono">
                {objConfigState.lastUpdate?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Total Secrets</div>
              <div className="text-white font-mono">
                {objConfigState.secretsStatus ? Object.keys(objConfigState.secretsStatus).length : 0}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Secrets Configurados</div>
              <div className="text-white font-mono">
                {objConfigState.secretsStatus ?
                  Object.values(objConfigState.secretsStatus).filter(s => s.exists).length : 0}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Status</div>
              <div className="text-green-400 font-mono">
                {objConfigState.isLoading ? 'Carregando...' : 'Online'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicConfigPanel;
