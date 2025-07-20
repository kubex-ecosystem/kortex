/**
 * useDynamicMCPConfig Hook
 * Hook React para gerenciar configuração dinâmica do MCP Server v2.0
 * Integra com as novas funcionalidades de configuração remota e secrets criptografados
 */

import { useState, useEffect, useCallback } from 'react';
import { mcpService, DynamicConfig, ConfigStats, SystemCommand, CommandResult } from '../lib/mcpService';

interface DynamicMCPConfigState {
  // Configuration state
  config: DynamicConfig | null;
  configStats: ConfigStats | null;
  
  // Commands state
  availableCommands: Record<string, SystemCommand[]>;
  commandCategories: string[];
  commandStats: any;
  
  // Secrets state
  secretsStatus: Record<string, { exists: boolean; masked_value?: string }> | null;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isExecutingCommand: boolean;
  
  // Error states
  error: string | null;
  configError: string | null;
  commandError: string | null;
  
  // Last update timestamp
  lastUpdate: Date | null;
}

interface DynamicMCPConfigActions {
  // Configuration actions
  refreshConfig: () => Promise<void>;
  updateConfig: (config: Partial<DynamicConfig>, secrets?: Record<string, string>) => Promise<boolean>;
  validateConfig: (config: Partial<DynamicConfig>) => Promise<{ valid: boolean; errors?: string[] }>;
  resetConfig: (section?: 'all' | 'server' | 'providers' | 'features') => Promise<boolean>;
  
  // Commands actions
  refreshCommands: () => Promise<void>;
  executeCommand: (command: string, args?: string[], confirm?: boolean, timeout?: number) => Promise<CommandResult>;
  validateCommand: (command: string, args?: string[]) => Promise<CommandResult>;
  getCommandHelp: (command: string) => Promise<SystemCommand | null>;
  
  // Secrets actions
  refreshSecrets: () => Promise<void>;
  updateSecrets: (secrets: Record<string, string>) => Promise<boolean>;
  
  // Backup actions
  createBackup: () => Promise<{ backup_path: string } | null>;
  listBackups: () => Promise<Array<{ filename: string; created_at: string; size_kb: number }> | null>;
  restoreBackup: (filename: string) => Promise<boolean>;
  
  // Utility actions
  clearErrors: () => void;
  clearCommandError: () => void;
}

export function useDynamicMCPConfig(): [DynamicMCPConfigState, DynamicMCPConfigActions] {
  const [state, setState] = useState<DynamicMCPConfigState>({
    config: null,
    configStats: null,
    availableCommands: {},
    commandCategories: [],
    commandStats: {},
    secretsStatus: null,
    isLoading: false,
    isUpdating: false,
    isExecutingCommand: false,
    error: null,
    configError: null,
    commandError: null,
    lastUpdate: null,
  });

  // Refresh configuration
  const refreshConfig = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, configError: null }));
    
    try {
      const [config, configStats] = await Promise.all([
        mcpService.getDynamicConfig(),
        mcpService.getConfigStats(),
      ]);

      setState(prev => ({
        ...prev,
        config,
        configStats,
        isLoading: false,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        configError: error instanceof Error ? error.message : 'Erro ao carregar configuração',
      }));
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (
    config: Partial<DynamicConfig>, 
    secrets?: Record<string, string>
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true, configError: null }));
    
    try {
      const success = await mcpService.updateDynamicConfig(config, secrets, true);
      
      if (success) {
        // Refresh configuration after update
        await refreshConfig();
      }
      
      setState(prev => ({ ...prev, isUpdating: false }));
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        configError: error instanceof Error ? error.message : 'Erro ao atualizar configuração',
      }));
      return false;
    }
  }, [refreshConfig]);

  // Validate configuration
  const validateConfig = useCallback(async (config: Partial<DynamicConfig>) => {
    return await mcpService.validateConfig(config);
  }, []);

  // Reset configuration
  const resetConfig = useCallback(async (section: 'all' | 'server' | 'providers' | 'features' = 'all'): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true, configError: null }));
    
    try {
      const success = await mcpService.resetConfig(section);
      
      if (success) {
        await refreshConfig();
      }
      
      setState(prev => ({ ...prev, isUpdating: false }));
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        configError: error instanceof Error ? error.message : 'Erro ao resetar configuração',
      }));
      return false;
    }
  }, [refreshConfig]);

  // Refresh commands
  const refreshCommands = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, commandError: null }));
    
    try {
      const commandsData = await mcpService.getAvailableCommands();
      
      if (commandsData) {
        setState(prev => ({
          ...prev,
          availableCommands: commandsData.commands,
          commandCategories: commandsData.categories,
          commandStats: commandsData.stats,
          isLoading: false,
          lastUpdate: new Date(),
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          commandError: 'Nenhum comando encontrado',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        commandError: error instanceof Error ? error.message : 'Erro ao carregar comandos',
      }));
    }
  }, []);

  // Execute command
  const executeCommand = useCallback(async (
    command: string, 
    args: string[] = [], 
    confirm: boolean = false, 
    timeout?: number
  ): Promise<CommandResult> => {
    setState(prev => ({ ...prev, isExecutingCommand: true, commandError: null }));
    
    try {
      const result = await mcpService.executeCommand(command, args, confirm, timeout);
      
      setState(prev => ({ 
        ...prev, 
        isExecutingCommand: false,
        commandError: !result.success ? result.error || 'Erro na execução' : null
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao executar comando';
      setState(prev => ({
        ...prev,
        isExecutingCommand: false,
        commandError: errorMessage,
      }));
      
      return {
        success: false,
        command,
        error: errorMessage
      };
    }
  }, []);

  // Validate command
  const validateCommand = useCallback(async (command: string, args: string[] = []): Promise<CommandResult> => {
    return await mcpService.validateCommand(command, args);
  }, []);

  // Get command help
  const getCommandHelp = useCallback(async (command: string): Promise<SystemCommand | null> => {
    return await mcpService.getCommandHelp(command);
  }, []);

  // Refresh secrets
  const refreshSecrets = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const secretsStatus = await mcpService.getSecretsStatus();
      setState(prev => ({
        ...prev,
        secretsStatus,
        isLoading: false,
        lastUpdate: new Date(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar secrets',
      }));
    }
  }, []);

  // Update secrets
  const updateSecrets = useCallback(async (secrets: Record<string, string>): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true }));
    
    try {
      const success = await mcpService.updateSecrets(secrets, true);
      
      if (success) {
        await refreshSecrets();
      }
      
      setState(prev => ({ ...prev, isUpdating: false }));
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar secrets',
      }));
      return false;
    }
  }, [refreshSecrets]);

  // Create backup
  const createBackup = useCallback(async () => {
    try {
      return await mcpService.createConfigBackup();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao criar backup',
      }));
      return null;
    }
  }, []);

  // List backups
  const listBackups = useCallback(async () => {
    try {
      return await mcpService.listConfigBackups();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao listar backups',
      }));
      return null;
    }
  }, []);

  // Restore backup
  const restoreBackup = useCallback(async (filename: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isUpdating: true }));
    
    try {
      const success = await mcpService.restoreConfigBackup(filename);
      
      if (success) {
        await refreshConfig();
      }
      
      setState(prev => ({ ...prev, isUpdating: false }));
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: error instanceof Error ? error.message : 'Erro ao restaurar backup',
      }));
      return false;
    }
  }, [refreshConfig]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      configError: null, 
      commandError: null 
    }));
  }, []);

  // Clear command error
  const clearCommandError = useCallback(() => {
    setState(prev => ({ ...prev, commandError: null }));
  }, []);

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        refreshConfig(),
        refreshCommands(),
        refreshSecrets(),
      ]);
    };

    loadInitialData();
  }, [refreshConfig, refreshCommands, refreshSecrets]);

  const actions: DynamicMCPConfigActions = {
    refreshConfig,
    updateConfig,
    validateConfig,
    resetConfig,
    refreshCommands,
    executeCommand,
    validateCommand,
    getCommandHelp,
    refreshSecrets,
    updateSecrets,
    createBackup,
    listBackups,
    restoreBackup,
    clearErrors,
    clearCommandError,
  };

  return [state, actions];
}

export default useDynamicMCPConfig;
