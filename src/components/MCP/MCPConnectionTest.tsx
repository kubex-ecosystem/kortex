import React, { useState, useEffect } from 'react';
import { mcpService, MCPStatus } from '../../lib/mcpService';
import { CheckCircle, XCircle, Clock, Server, Database } from 'lucide-react';

interface MCPConnectionTestProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function MCPConnectionTest({ onConnectionChange }: MCPConnectionTestProps) {
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await mcpService.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        const serverStatus = await mcpService.getStatus();
        setStatus(serverStatus);
      } else {
        setStatus(null);
        setError('Não foi possível conectar ao MCP Server em http://127.0.0.1:3002');
      }
      
      onConnectionChange?.(connected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsConnected(false);
      setStatus(null);
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(testConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <Clock className="h-5 w-5 text-blue-600 animate-spin" />
        <span className="text-blue-700 dark:text-blue-300">Testando conexão...</span>
      </div>
    );
  }

  if (!isConnected || error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
        <div className="flex items-center space-x-2 mb-2">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700 dark:text-red-300 font-medium">MCP Server Desconectado</span>
        </div>
        <p className="text-red-600 dark:text-red-400 text-sm mb-3">
          {error || 'Servidor não está respondendo'}
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm">
          <p className="text-gray-600 dark:text-gray-300 mb-2">Para iniciar o servidor:</p>
          <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded block mb-1">
            uv run --env-file ../.env mcp/api_server.py
          </code>
          <code className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded block">
            uv run --env-file ./.env ./timecraft_ai/mcp/server.py
          </code>
        </div>
        <button
          onClick={testConnection}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
      <div className="flex items-center space-x-2 mb-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-green-700 dark:text-green-300 font-medium">MCP Server Conectado</span>
      </div>
      
      {status && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-300">
              {status.server} - {status.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-300">
              {status.memory_entries} entradas na memória
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`flex items-center space-x-1 ${status.github_configured ? 'text-green-600' : 'text-yellow-600'}`}>
              <div className={`w-2 h-2 rounded-full ${status.github_configured ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs">GitHub</span>
            </div>
            
            <div className={`flex items-center space-x-1 ${status.azure_configured ? 'text-green-600' : 'text-yellow-600'}`}>
              <div className={`w-2 h-2 rounded-full ${status.azure_configured ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs">Azure DevOps</span>
            </div>
          </div>
          
          {status.azure_configured && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Azure: {status.azure_org}/{status.azure_project}
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
            <details className="text-xs">
              <summary className="cursor-pointer text-green-600 hover:text-green-700">
                Endpoints disponíveis ({status.endpoints.length})
              </summary>
              <ul className="mt-1 space-y-1 ml-4">
                {status.endpoints.map((endpoint, index) => (
                  <li key={index} className="text-gray-500 dark:text-gray-400">
                    {endpoint}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      )}
      
      <button
        onClick={testConnection}
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
      >
        Atualizar Status
      </button>
    </div>
  );
}
