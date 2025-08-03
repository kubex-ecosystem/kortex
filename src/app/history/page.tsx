'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Filter,
  Search,
  Download,
  Eye
} from 'lucide-react';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { LoadingState } from '../../components/UI/LoadingSpinner';
import { mcpService } from '../../lib/mcpService';
import { Task } from '../../types/MCP';

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => mcpService.getAllTasks(),
    refetchInterval: 120000, // Histórico muda menos, 2 minutos
    enabled: true,
  });

  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const taskDate = new Date(task.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Agrupar tasks por data
  const groupedTasks = filteredTasks?.reduce((groups, task) => {
    const date = new Date(task.createdAt).toLocaleDateString('pt-BR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDuration = (task: Task) => {
    if (!task.createdAt || !task.updatedAt) return 'N/A';
    const start = new Date(task.createdAt);
    const end = new Date(task.updatedAt);
    const duration = end.getTime() - start.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${minutes}min ${seconds}s`;
  };

  if (isLoading) {
    return <LoadingState message="Carregando histórico de tasks..." />;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Histórico de Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize o histórico completo de execução de tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </motion.button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTasks?.length || 0} tasks encontradas
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filtrar por status"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="completed">Concluída</option>
            <option value="failed">Falhou</option>
            <option value="running">Em execução</option>
            <option value="pending">Pendente</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filtrar por período"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todo o período</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
        </div>
      </motion.div>

      {/* Tasks History */}
      <div className="space-y-6">
        {groupedTasks && Object.keys(groupedTasks).length > 0 ? (
          Object.entries(groupedTasks)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dateTasks], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{date}</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {dateTasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: taskIndex * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getStatusIcon(task.status)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </h3>
                              <StatusBadge status={task.status}>{task.status}</StatusBadge>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {task.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                                <p className="text-gray-600 dark:text-gray-400">{task.provider}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Target:</span>
                                <p className="text-gray-600 dark:text-gray-400">{task.target}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Duração:</span>
                                <p className="text-gray-600 dark:text-gray-400">{formatDuration(task)}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Iniciado:</span>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {new Date(task.createdAt).toLocaleTimeString('pt-BR')}
                                </p>
                              </div>
                            </div>
                            
                            {task.result && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resultado:</span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.result}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma task encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há tasks no histórico que correspondam aos filtros aplicados.
            </p>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
}
