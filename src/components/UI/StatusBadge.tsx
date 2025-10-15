import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const configs = {
    Running: { icon: <Loader2 size={12} className="animate-spin" />, classes: 'bg-primary-subtle dark:bg-primary-foreground/30 text-primary dark:text-primary' },
    Online: { icon: <CheckCircle size={12} />, classes: 'bg-green-100 dark:bg-green-900/30 text-success dark:text-green-200' },
    Completed: { icon: <CheckCircle size={12} />, classes: 'bg-green-100 dark:bg-green-900/30 text-success dark:text-green-200' },
    Connected: { icon: <Wifi size={12} />, classes: 'bg-green-100 dark:bg-green-900/30 text-success dark:text-green-200' },
    Failed: { icon: <XCircle size={12} />, classes: 'bg-red-100 dark:bg-red-900/30 text-danger dark:text-red-200' },
    Offline: { icon: <WifiOff size={12} />, classes: 'bg-red-100 dark:bg-red-900/30 text-danger dark:text-red-200' },
    Pending: { icon: <Clock size={12} />, classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-warning dark:text-yellow-200' },
    Warning: { icon: <AlertTriangle size={12} />, classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-warning dark:text-yellow-200' }
  };
  
  const config = configs[status as keyof typeof configs] || configs.Pending;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${config.classes} ${className}`}>
      {config.icon}
      <span>{status}</span>
    </span>
  );
};
