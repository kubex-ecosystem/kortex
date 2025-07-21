/**
 * useDynamicMCPConfig Hook - RESILIENT FALLBACK VERSION
 * Hook temporário que sempre funciona, mesmo com MCP offline
 * NUNCA QUEBRA - Retorna fallbacks seguros para todas as operações
 */

import { useEffect, useState } from 'react';

// Tipos locais para compatibilidade
export interface DynamicConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface ConfigStats {
  totalConfigs: number;
  enabledConfigs: number;
  lastUpdate: Date;
}

export interface SystemCommand {
  id: string;
  name: string;
  description: string;
  category: string;
  args: string[];
}

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  duration?: number;
}

export function useDynamicMCPConfig() {
  // RESILIENT FALLBACK - Always works!
  const [isLoading, setIsLoading] = useState(false);

  const fallbackState = {
    // Configuration state
    config: null,
    configStats: {
      totalConfigs: 0,
      enabledConfigs: 0,
      lastUpdate: new Date()
    },
    
    // Commands state  
    availableCommands: {},
    commandCategories: [],
    commandStats: {
      totalCommands: 0,
      totalCategories: 0,
      lastUpdate: new Date()
    },
    
    // Secrets state
    secretsStatus: null,
    
    // Loading states
    isLoading,
    isUpdating: false,
    isExecutingCommand: false,
    
    // Error states
    error: null,
    configError: null,
    commandError: null,
    
    // Last update timestamp
    lastUpdate: null,
  };

  const fallbackActions = {
    // Configuration actions
    refreshConfig: async () => {
      console.log('🔴 useDynamicMCPConfig: refreshConfig (fallback mode - service offline)');
    },
    updateConfig: async () => {
      console.log('🔴 useDynamicMCPConfig: updateConfig (fallback mode - service offline)');
      return false;
    },
    validateConfig: async () => {
      console.log('🔴 useDynamicMCPConfig: validateConfig (fallback mode - service offline)');
      return { valid: false, errors: ['MCP Service offline'] };
    },
    resetConfig: async () => {
      console.log('🔴 useDynamicMCPConfig: resetConfig (fallback mode - service offline)');
      return false;
    },
    
    // Commands actions
    refreshCommands: async () => {
      console.log('🔴 useDynamicMCPConfig: refreshCommands (fallback mode - service offline)');
    },
    executeCommand: async () => {
      console.log('🔴 useDynamicMCPConfig: executeCommand (fallback mode - service offline)');
      return { success: false, error: 'MCP Service offline' };
    },
    validateCommand: async () => {
      console.log('🔴 useDynamicMCPConfig: validateCommand (fallback mode - service offline)');
      return { success: false, error: 'MCP Service offline' };
    },
    getCommandHelp: async () => {
      console.log('🔴 useDynamicMCPConfig: getCommandHelp (fallback mode - service offline)');
      return null;
    },
    
    // Secrets actions
    refreshSecrets: async () => {
      console.log('🔴 useDynamicMCPConfig: refreshSecrets (fallback mode - service offline)');
    },
    updateSecrets: async () => {
      console.log('🔴 useDynamicMCPConfig: updateSecrets (fallback mode - service offline)');
      return false;
    },
    
    // Backup actions
    createBackup: async () => {
      console.log('🔴 useDynamicMCPConfig: createBackup (fallback mode - service offline)');
      return null;
    },
    listBackups: async () => {
      console.log('🔴 useDynamicMCPConfig: listBackups (fallback mode - service offline)');
      return [];
    },
    restoreBackup: async () => {
      console.log('🔴 useDynamicMCPConfig: restoreBackup (fallback mode - service offline)');
      return false;
    },
  };

  // Initialize with fallback immediately
  useEffect(() => {
    console.log('🛡️ useDynamicMCPConfig: Initialized in fallback mode (MCP service offline)');
    setIsLoading(false);
  }, []);

  // Return tuple - EXPLICIT FORMAT!
  return [fallbackState, fallbackActions];
}
