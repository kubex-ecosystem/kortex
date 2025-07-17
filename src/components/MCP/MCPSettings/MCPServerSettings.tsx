import React, { useState } from 'react';
import { MCPServerType } from '../../../types';
import { ServerStatus } from '../../../types/ServerTypes';

interface MCPServerSettingsProps {
  servers: MCPServerType[];
  onServerUpdate: (server: MCPServerType) => void;
  onServerAdd: (server: MCPServerType) => void;
  onServerRemove: (serverId: string) => void;
}

export const MCPServerSettings: React.FC<MCPServerSettingsProps> = ({
  servers,
  onServerUpdate,
  onServerAdd,
  onServerRemove
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    hostname: ''
  });

  const handleAddServer = () => {
    if (newServer.name && newServer.hostname) {
      const server: MCPServerType = {
        id: Date.now().toString(),
        name: newServer.name,
        hostname: newServer.hostname,
        status: 'Offline' as ServerStatus,
        lastUpdated: new Date()
      };
      onServerAdd(server);
      setNewServer({ name: '', hostname: '' });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status?: ServerStatus) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Offline': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Server Settings</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Server'}
        </button>
      </div>

      {/* Add Server Form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add New Server</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={newServer.name}
                onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                placeholder="Enter server name"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hostname
              </label>
              <input
                type="text"
                value={newServer.hostname}
                onChange={(e) => setNewServer({ ...newServer, hostname: e.target.value })}
                placeholder="localhost:8080"
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddServer}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Server
            </button>
          </div>
        </div>
      )}

      {/* Server List */}
      <div className="space-y-4">
        {servers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No servers configured. Click "Add Server" to get started.</p>
          </div>
        ) : (
          servers.map(server => (
            <div
              key={server.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    {server.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                    {server.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const newStatus: ServerStatus = server.status === 'Online' ? 'Offline' : 'Online';
                      onServerUpdate({ ...server, status: newStatus });
                    }}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      server.status === 'Online'
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {server.status === 'Online' ? 'Stop' : 'Start'}
                  </button>
                  <button
                    onClick={() => onServerRemove(server.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Hostname:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {server.hostname || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {server.lastUpdated ? server.lastUpdated.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Server Statistics */}
      {servers.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Servers:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {servers.length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Online:</span>
              <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                {servers.filter(s => s.status === 'Online').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Offline:</span>
              <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                {servers.filter(s => s.status === 'Offline').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Warning:</span>
              <span className="ml-2 font-medium text-yellow-600 dark:text-yellow-400">
                {servers.filter(s => s.status === 'Warning').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
