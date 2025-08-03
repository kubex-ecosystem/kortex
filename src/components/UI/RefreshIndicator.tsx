'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface RefreshIndicatorProps {
  isRefetching?: boolean;
  lastUpdated?: Date;
  isOnline?: boolean;
}

export function RefreshIndicator({ 
  isRefetching = false, 
  lastUpdated,
  isOnline = true 
}: RefreshIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <AnimatePresence>
        {isRefetching && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg mb-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Atualizando...</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg shadow-sm">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {lastUpdated ? (
            <span>
              Atualizado às {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          ) : (
            <span>Carregando...</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
