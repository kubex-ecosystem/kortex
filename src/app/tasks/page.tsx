'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Search,
  User,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LoadingState } from '../../components/UI/LoadingSpinner';
import { RefreshIndicator } from '../../components/UI/RefreshIndicator';
import { StatusBadge } from '../../components/UI/StatusBadge';
import { useStableQuery } from '../../hooks/useStableQuery';
import { mcpService } from '../../lib/mcpService';
import { ApprovalRequest } from '../../types/MCP';

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<ApprovalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: approvals, isLoading, isRefetching } = useStableQuery({
    queryKey: ['pending-approvals'],
    enabled: true,
    queryFn: () => mcpService.getPendingApprovals(),
    refetchInterval: 30000, // Reduzido para 30 segundos
  });

  const approveMutation = useMutation({
    mutationFn: ({ approvalId, taskId }: { approvalId: string; taskId: string }) =>
      mcpService.approveTask(approvalId, taskId),
    onSuccess: () => {
      toast.success('Task aprovada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['mcp-stats'] });
    },
    onError: () => {
      toast.error('Erro ao aprovar task');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ approvalId, reason }: { approvalId: string; reason: string }) =>
      mcpService.rejectTask(approvalId, reason),
    onSuccess: () => {
      toast.success('Task rejeitada');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelectedTask(null);
      setRejectionReason('');
    },
    onError: () => {
      toast.error('Erro ao rejeitar task');
    },
  });

  const filteredApprovals = approvals?.filter(approval => {
    const matchesSearch = approval.task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleApprove = (approval: ApprovalRequest) => {
    approveMutation.mutate({ approvalId: approval.id, taskId: approval.taskId });
  };

  const handleReject = () => {
    if (selectedTask && rejectionReason.trim()) {
      rejectMutation.mutate({ approvalId: selectedTask.id, reason: rejectionReason });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return <LoadingState message="Carregando aprovações pendentes..." />;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aprovação de Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie e aprove tasks solicitadas pelo sistema Discord
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full"
        >
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-400 text-sm font-medium">
            {filteredApprovals?.length || 0} pendentes
          </span>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            title="Filtrar por prioridade"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </motion.div>

      {/* Approval Requests */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredApprovals?.map((approval, index) => (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {approval.task.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                      {approval.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {approval.task.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Solicitado por: {approval.requestedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(approval.requestedAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Razão:</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{approval.reason}</p>
                  </div>
                </div>
              </div>

              {/* Task Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Provider:</span>
                  <p className="text-gray-900 dark:text-white">{approval.task.provider}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target:</span>
                  <p className="text-gray-900 dark:text-white">{approval.task.target}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <StatusBadge status={approval.task.status}>{approval.task.status}</StatusBadge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApprove(approval)}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  {approveMutation.isPending ? 'Aprovando...' : 'Aprovar'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTask(approval)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeitar
                </motion.button>
              </div>
            </motion.div>
          )) || (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma aprovação pendente
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todas as tasks foram processadas. Verifique novamente mais tarde.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rejection Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rejeitar Task
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Você está prestes a rejeitar a task "{selectedTask.task.title}". 
                Por favor, forneça uma razão para a rejeição:
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Razão da rejeição..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <div className="flex items-center gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || rejectMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectMutation.isPending ? 'Rejeitando...' : 'Confirmar Rejeição'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Indicator */}
      <RefreshIndicator 
        isRefetching={isRefetching}
        lastUpdated={new Date()}
        isOnline={true}
      />
    </motion.main>
  );
}
