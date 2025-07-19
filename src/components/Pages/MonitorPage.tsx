import React, { useState } from 'react';
import { 
  Activity, 
  Pause, 
  Play, 
  Download, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { LogEntry } from '../../types';
import { StatusBadge } from '../UI/StatusBadge';
import { useMCPLogs } from '../../hooks/useMCPLogs';

export const MonitorPage: React.FC = () => {
  const { 
    logs, 
    isMonitoring, 
    setIsMonitoring, 
    stats, 
    clearLogs, 
    exportLogs 
  } = useMCPLogs();

  const [speed, setSpeed] = useState(3000);
  const [filters, setFilters] = useState({
    status: 'all',
    model: 'all',
    server: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique values for filters
  const uniqueModels = Array.from(new Set(logs.map(log => log.model).filter(Boolean)));
  const uniqueServers = Array.from(new Set(logs.map(log => log.serverId).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    const matchesModel = filters.model === 'all' || log.model === filters.model;
    const matchesServer = filters.server === 'all' || log.serverId === filters.server;
    const matchesSearch = searchTerm === '' || 
      log.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesModel && matchesServer && matchesSearch;
  });

  const getLogIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock size={16} className="text-yellow-500" />;
      case 'running': return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Monitor</h2>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Speed:</label>
            <select 
              aria-label="Speed Control"
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={1000}>Fast</option>
              <option value={3000}>Normal</option>
              <option value={5000}>Slow</option>
            </select>
          </div>
          
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Clear Logs
          </button>
          
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              isMonitoring ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMonitoring ? <Pause size={16} /> : <Play size={16} />}
            {isMonitoring ? 'Pause' : 'Start'} Monitor
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select 
              aria-label="Status Filter"
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="queued">Queued</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            
            <select 
              aria-label="Model Filter"
              value={filters.model} 
              onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Models</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            
            <select 
              aria-label="Server Filter"
              value={filters.server} 
              onChange={(e) => setFilters(prev => ({ ...prev, server: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Servers</option>
              {uniqueServers.map(server => (
                <option key={server} value={server}>{server}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Log Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity size={20} />
                Activity Log ({filteredLogs.length} entries)
              </h3>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No matching logs...</p>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                      {getLogIcon(log.status)}
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">[{log.timestamp}]</span>
                      <span className="text-sm text-gray-900 dark:text-white">{log.taskId}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{log.model}</span>
                      {log.serverId && (
                        <>
                          <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
                          <span className="text-sm text-purple-600 dark:text-purple-400">{log.serverId}</span>
                        </>
                      )}
                      {log.duration && <span className="text-xs text-gray-500 dark:text-gray-400">({log.duration})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Real-time Stats</h3>
            <div className="space-y-3">
              {['running', 'queued', 'completed', 'failed'].map(status => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                  <span className={`text-lg font-bold ${
                    status === 'running' ? 'text-blue-600' :
                    status === 'queued' ? 'text-yellow-600' :
                    status === 'completed' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats[status as keyof typeof stats] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.successRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.avgResponseTime}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stats.uptime}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorPage;