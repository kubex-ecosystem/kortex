'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'degraded' | 'pending' | 'running' | 'completed' | 'failed';
  children: React.ReactNode;
  className?: string;
}

const statusConfig = {
  online: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  offline: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  degraded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  running: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[status]} ${className}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'online' || status === 'completed' ? 'bg-green-500 animate-pulse' :
        status === 'running' ? 'bg-purple-500 animate-pulse' :
        status === 'pending' ? 'bg-blue-500 animate-pulse' :
        status === 'failed' || status === 'offline' ? 'bg-red-500' :
        'bg-yellow-500'
      }`} />
      {children}
    </motion.span>
  );
}
