import {
  Activity,
  AlertCircle,
  CheckCircle,
  Edit,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  XCircle
} from 'lucide-react';

import React, { useState } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { MCPServerType } from '../../types/MCP/Server';
import { ServerStatus } from '../../types/ServerTypes';
import { ServerModal } from '../Servers/ServerModal';

export const ServersPage: React.FC = () => {
  const { 
    servers, 
    logs,
    serverStats,
    addServer, 
    updateServer, 
    removeServer, 
    isLoadingMCP,
    refreshData,
    addTask,
    removeTask,
    updateTask,
    testConnection,
  } = useAppData();
  
  const [error, setError] = useState<string | null>(null);
  const isLoading = isLoadingMCP;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ServerStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServerType | null>(null);

  // Filtrar servidores baseado na busca e status
  const filteredServers = servers.filter((server: MCPServerType) => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (server.hostname && server.hostname.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || server.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleTestConnection = async (server: MCPServerType) => {
    const connected = await testConnection(server);
    console.log(`Connection test for ${server.name}: ${connected ? 'Success' : 'Failed'}`);
  };

  const getStatusIcon = (status: ServerStatus) => {
    switch (status) {
      case 'Online': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Offline': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServerStatus) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Offline': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleEditServer = (server: MCPServerType) => {
    setSelectedServer(server);
    setIsEditModalOpen(true);
  };

  const handleDeleteServer = (serverId: string) => {
    if (window.confirm('Tem certeza que deseja remover este servidor?')) {
      removeServer(serverId);
    }
  };

  const ServerCard: React.FC<{ server: MCPServerType }> = ({ server }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {server.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {server.hostname}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
              {getStatusIcon(server.status)}
              <span className="ml-1 capitalize">{server.status}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {server.tasks.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {server.lastUpdated.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditServer(server)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDeleteServer(server.id)}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-200 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
          <button 
            onClick={() => handleTestConnection(server)}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
          >
            <Activity className="w-4 h-4 mr-1" />
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );

    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MCP Servers
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gerencie seus servidores Model Context Protocol
            </p>
            
            {/* Quick Stats */}
            <div className="mt-3 flex items-center space-x-6">
              <div className="flex items-center space-x-1 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Online: {serverStats.online}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Offline: {serverStats.offline}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Warning: {serverStats.warning}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Server
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search servers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ServerStatus | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Warning">Warning</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            Refresh
          </button>
        </div>

      {/* Servers Grid */}
      {filteredServers.length === 0 ? (
        <div className="text-center py-12">
          <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum servidor encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || selectedStatus !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Comece adicionando seu primeiro servidor MCP'}
          </p>
          {!searchTerm && selectedStatus === 'all' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Server
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server: MCPServerType) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}

      {/* Modals */}
      <ServerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={addServer}
        title="Add New Server"
      />

      <ServerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateServer}
        server={selectedServer || undefined}
        title="Edit Server"
      />
    </div>
  );
};
