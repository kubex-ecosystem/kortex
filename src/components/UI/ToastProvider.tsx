import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastNotification, Toast } from './ToastNotification';

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration + 300); // Add animation time
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Helper functions for common toast types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'error', title, message, duration: 8000, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'info', title, message, ...options }),
    
    // Special for WebSocket events
    wsReconnected: () => 
      addToast({ 
        type: 'success', 
        title: 'WebSocket Reconnected',
        message: 'Real-time updates are now active',
        duration: 3000 
      }),
    
    wsDisconnected: () => 
      addToast({ 
        type: 'warning', 
        title: 'Connection Lost',
        message: 'Attempting to reconnect...',
        duration: 0 // Don't auto-dismiss
      }),
    
    rateLimitWarning: (provider: string, percentage: number) => 
      addToast({ 
        type: 'warning', 
        title: `Rate Limit Warning`,
        message: `${provider} usage at ${percentage.toFixed(1)}%`,
        duration: 6000,
        action: {
          label: 'View Details',
          onClick: () => window.location.hash = '#settings'
        }
      }),
    
    autoPaused: (provider: string) => 
      addToast({ 
        type: 'error', 
        title: `Auto-Paused: ${provider}`,
        message: 'Rate limit threshold reached',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'Settings',
          onClick: () => window.location.hash = '#settings'
        }
      })
  };
};
