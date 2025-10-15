import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const getToastConfig = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-200',
        iconColor: 'text-success'
      };
    case 'error':
      return {
        icon: AlertCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-800 dark:text-red-200',
        iconColor: 'text-danger'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        iconColor: 'text-warning'
      };
    case 'info':
    default:
      return {
        icon: Info,
        bgColor: 'bg-primary-subtle dark:bg-primary-foreground/20',
        borderColor: 'border-primary dark:border-primary',
        textColor: 'text-primary-foreground dark:text-primary',
        iconColor: 'text-primary'
      };
  }
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  useEffect(() => {
    // Fade in animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto close
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg p-4 shadow-lg max-w-sm w-full
        pointer-events-auto
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              {toast.message && (
                <p className="text-sm mt-1 opacity-90">{toast.message}</p>
              )}
            </div>
            
            <button
              onClick={handleClose}
              title="Close notification"
              className="ml-2 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                  toast.type === 'success'
                    ? 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700'
                    : toast.type === 'error'
                    ? 'bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700'
                    : toast.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700'
                    : 'bg-primary-subtle dark:bg-primary-foreground/30 hover:bg-primary dark:hover:bg-primary-hover'
                }`}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
