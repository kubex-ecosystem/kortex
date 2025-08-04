import { motion } from 'framer-motion';
import { Bot, Globe, MessageCircle, Shield, Users, Wifi, WifiOff, Zap } from 'lucide-react';
import React from 'react';
import toast from 'react-hot-toast';
import { useStableQuery } from '../../hooks/useStableQuery';
import { mcpService } from '../../lib/mcpService';

interface DiscordStatusProps {
  className?: string;
}

export const DiscordStatus: React.FC<DiscordStatusProps> = ({ className = '' }) => {
  const { data: discordStatus, isLoading, isRefetching, refetch } = useStableQuery({
    queryKey: ['discord-status'],
    queryFn: () => mcpService.getDiscordStatus(),
    refetchInterval: 45000, // Refetch a cada 45 segundos
    enabled: true,
  });

  const status = discordStatus?.data;

  const handleTestConnection = async () => {
    try {
      const result = await mcpService.testDiscordConnection();
      if (result.success) {
        toast.success(result.message || 'Conexão Discord testada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao testar conexão');
      }
    } catch (error) {
      toast.error('Erro ao testar conexão Discord');
    }
  };

  const getStatusColor = (online: boolean) => {
    return online ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  if (isLoading && !status) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discord Status</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header com Status Principal */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discord Status</h3>
          {isRefetching && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status?.bot?.online)}`}>
          {status?.bot?.online ? (
            <>
              <Wifi className="w-4 h-4" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              Offline
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {status && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Globe className="w-5 h-5 mx-auto mb-2 text-blue-600" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {status.guilds?.length || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Servidores</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Users className="w-5 h-5 mx-auto mb-2 text-green-600" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {status.guilds?.[0]?.memberCount || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Membros</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <MessageCircle className="w-5 h-5 mx-auto mb-2 text-purple-600" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {status.stats?.totalMessages || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Mensagens</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Shield className="w-5 h-5 mx-auto mb-2 text-orange-600" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {status.stats?.approvalsHandled || 0}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Aprovações</p>
          </div>
        </div>
      )}

      {/* Connection Info */}
      {status?.connections && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Latência:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {status.connections.latency}ms
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {status.stats?.uptime || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTestConnection}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          <Zap className="w-4 h-4" />
          Testar Conexão
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
        >
          🔄
        </motion.button>
      </div>

      {/* Data Source Indicator */}
      {discordStatus && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          {discordStatus.isRealData ? '📡 Dados reais' : '🧪 Modo mock'} • 
          Atualizado: {new Date(discordStatus.timestamp).toLocaleTimeString('pt-BR')}
        </div>
      )}
    </motion.div>
  );
};
