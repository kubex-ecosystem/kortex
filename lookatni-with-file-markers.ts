/// src/types/index.ts ///
export type TaskStatus = 'Running' | 'Completed' | 'Failed' | 'Pending';
export type ServerStatus = 'Online' | 'Offline' | 'Warning';
export type ConnectionStatus = 'Connected' | 'Disconnected' | 'Testing';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  estimatedTime: string;
  progress?: number;
  startedAt?: string;
  server?: string;
  model?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  taskId: string;
  model: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  duration?: string;
  server?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  hostname: string;
  status: ServerStatus;
  capacity: number;
  currentTasks: number;
  avgResponseTime: number;
  uptime: string;
  totalProcessed: number;
  successRate: number;
}

export interface APIProvider {
  id: string;
  name: string;
  provider: string;
  keyPreview: string;
  status: ConnectionStatus;
  lastTested: string;
  requestsToday: number;
  monthlyLimit: number;
  costPerRequest: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AppSettings {
  language: string;
  timezone: string;
  autoReload: boolean;
  defaultTheme: string;
  notifications: boolean;
  emailReports: boolean;
  logRetentionDays: number;
  refreshInterval: number;
}

/// src/hooks/useTheme.ts ///
import { useState } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  return { isDark, toggleTheme };
};

/// src/context/AppContext.tsx ///
import React, { createContext, useContext, useState } from 'react';
import { Task, MCPServer, APIProvider, Notification, AppSettings, LogEntry } from '../types';

interface AppContextType {
  tasks: Task[];
  servers: MCPServer[];
  providers: APIProvider[];
  notifications: Notification[];
  settings: AppSettings;
  logs: LogEntry[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1', name: 'Sentiment Analysis - Customer Reviews', status: 'Running',
      estimatedTime: '2m 34s', progress: 0.67, startedAt: '2024-07-10T14:30:00Z',
      server: 'MCP-01', model: 'Claude'
    },
    {
      id: '2', name: 'Generate Q2 Financial Report', status: 'Completed',
      estimatedTime: '45s', startedAt: '2024-07-10T14:15:00Z',
      server: 'MCP-02', model: 'GPT-4'
    },
    {
      id: '3', name: 'Database Backup Process', status: 'Failed',
      estimatedTime: '5m 12s', startedAt: '2024-07-10T14:20:00Z',
      server: 'MCP-01', model: 'Claude'
    },
    {
      id: '4', name: 'PDF Document Indexing', status: 'Pending',
      estimatedTime: '1m 20s', server: 'MCP-03', model: 'Gemini'
    },
    {
      id: '5', name: 'ML Model Training', status: 'Running',
      estimatedTime: '8m 45s', progress: 0.23, startedAt: '2024-07-10T14:35:00Z',
      server: 'MCP-02', model: 'GPT-4'
    }
  ]);

  const [servers] = useState<MCPServer[]>([
    {
      id: '1', name: 'MCP-01', hostname: '192.168.1.100:8080', status: 'Online',
      capacity: 10, currentTasks: 7, avgResponseTime: 1.2, uptime: '15d 8h',
      totalProcessed: 1247, successRate: 94.2
    },
    {
      id: '2', name: 'MCP-02', hostname: '192.168.1.101:8080', status: 'Online',
      capacity: 8, currentTasks: 3, avgResponseTime: 0.9, uptime: '22d 14h',
      totalProcessed: 892, successRate: 97.1
    },
    {
      id: '3', name: 'MCP-03', hostname: '192.168.1.102:8080', status: 'Warning',
      capacity: 12, currentTasks: 11, avgResponseTime: 3.1, uptime: '5d 2h',
      totalProcessed: 456, successRate: 89.3
    }
  ]);

  const [providers] = useState<APIProvider[]>([
    {
      id: '1', name: 'Production OpenAI', provider: 'OpenAI', keyPreview: 'sk-...J9K2',
      status: 'Connected', lastTested: '2 minutes ago', requestsToday: 1247,
      monthlyLimit: 100000, costPerRequest: 0.002
    },
    {
      id: '2', name: 'Anthropic Claude', provider: 'Anthropic', keyPreview: 'sk-ant-...X7Y1',
      status: 'Connected', lastTested: '5 minutes ago', requestsToday: 892,
      monthlyLimit: 50000, costPerRequest: 0.008
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1', type: 'error', title: 'Task Failed', 
      message: 'Database Backup Process failed after 30s', 
      timestamp: new Date().toISOString(), read: false
    },
    {
      id: '2', type: 'success', title: 'Task Completed',
      message: 'Q2 Financial Report generated successfully',
      timestamp: new Date(Date.now() - 300000).toISOString(), read: false
    }
  ]);

  const [settings, setSettings] = useState<AppSettings>({
    language: 'en', timezone: 'UTC-3', autoReload: true, defaultTheme: 'system',
    notifications: true, emailReports: false, logRetentionDays: 30, refreshInterval: 5
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider value={{
      tasks, servers, providers, notifications, settings, logs,
      updateTask, addNotification, markNotificationRead, updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

/// src/components/ui/StatusBadge.tsx ///
import React from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const configs = {
    Running: { icon: <Loader2 size={12} className="animate-spin" />, classes: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
    Online: { icon: <CheckCircle size={12} />, classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
    Completed: { icon: <CheckCircle size={12} />, classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
    Connected: { icon: <Wifi size={12} />, classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
    Failed: { icon: <XCircle size={12} />, classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
    Offline: { icon: <WifiOff size={12} />, classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
    Pending: { icon: <Clock size={12} />, classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
    Warning: { icon: <AlertTriangle size={12} />, classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' }
  };
  
  const config = configs[status as keyof typeof configs] || configs.Pending;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${config.classes} ${className}`}>
      {config.icon}
      <span>{status}</span>
    </span>
  );
};

/// src/components/ui/ProgressBar.tsx ///
import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = '', 
  animated = true 
}) => {
  const percentage = Math.min(Math.max(progress * 100, 0), 100);
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/// src/components/ui/NotificationCenter.tsx ///
import React from 'react';
import { X, XCircle, CheckCircle, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notifications ({unreadCount} unread)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => markNotificationRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${notif.type === 'error' ? 'text-red-500' : notif.type === 'success' ? 'text-green-500' : 'text-blue-500'}`}>
                  {notif.type === 'error' ? <XCircle size={16} /> : 
                   notif.type === 'success' ? <CheckCircle size={16} /> : 
                   <Bell size={16} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{notif.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{notif.message}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/// src/components/layout/Header.tsx ///
import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, Search, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationCenter } from '../ui/NotificationCenter';

interface HeaderProps {
  isDark: boolean;
  onToggle: () => void;
  onMenuClick: () => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  isDark, 
  onToggle, 
  onMenuClick, 
  currentPage 
}) => {
  const { notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            LookAt<span className="text-blue-600">ni</span>
          </h1>
          <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
            / {currentPage}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-64">
            <Search size={16} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>
          
          <button 
            onClick={onToggle} 
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

/// src/components/layout/Sidebar.tsx ///
import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  Activity, 
  Cpu, 
  Database, 
  Settings, 
  Plus,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  onPageChange 
}) => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', id: 'dashboard' },
    { icon: <Activity size={20} />, label: 'Live Monitor', id: 'monitor' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', id: 'analytics' },
    { icon: <Cpu size={20} />, label: 'Servers', id: 'servers' },
    { icon: <Database size={20} />, label: 'API Config', id: 'api' },
    { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              LookAt<span className="text-blue-600">ni</span>
            </h2>
            <button 
              onClick={onClose} 
              className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onPageChange(item.id); onClose(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left transform hover:scale-105
                  ${currentPage === item.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105">
              <Plus size={16} />
              <span className="font-medium">New Task</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

/// src/components/dashboard/TaskCard.tsx ///
import React from 'react';
import { X, Play, Eye, Server } from 'lucide-react';
import { Task } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressBar } from '../ui/ProgressBar';

interface TaskCardProps {
  task: Task;
  onAction?: (taskId: string, action: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onAction }) => {
  const getActionButton = () => {
    const actions = {
      Running: { text: 'Cancel', color: 'red', icon: <X size={12} /> },
      Failed: { text: 'Retry', color: 'blue', icon: <Play size={12} /> },
      Pending: { text: 'Start', color: 'green', icon: <Play size={12} /> },
      Completed: { text: 'View', color: 'gray', icon: <Eye size={12} /> }
    };
    
    const action = actions[task.status as keyof typeof actions];
    if (!action) return null;
    
    return (
      <button
        onClick={() => onAction?.(task.id, action.text.toLowerCase())}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
          bg-${action.color}-50 dark:bg-${action.color}-900/20 
          text-${action.color}-700 dark:text-${action.color}-400 
          border border-${action.color}-200 dark:border-${action.color}-800 
          rounded-md hover:bg-${action.color}-100 dark:hover:bg-${action.color}-900/30 
          transition-colors`}
      >
        {action.icon}
        {action.text}
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 transform hover:scale-105">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
            {task.name}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {task.estimatedTime}
            </p>
            {task.server && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <Server size={10} className="inline mr-1" />
                {task.server}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>
      
      {task.status === 'Running' && typeof task.progress === 'number' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(task.progress * 100)}%</span>
          </div>
          <ProgressBar progress={task.progress} animated />
        </div>
      )}
      
      <div className="flex justify-end">
        {getActionButton()}
      </div>
    </div>
  );
};

/// src/pages/DashboardPage.tsx ///
import React from 'react';
import { LayoutDashboard, Play, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/dashboard/TaskCard';

export const DashboardPage: React.FC = () => {
  const { tasks } = useApp();
  
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsCards = [
    { 
      label: 'Total Tasks', 
      value: tasks.length, 
      icon: <LayoutDashboard className="h-8 w-8 text-blue-600" />, 
      color: 'gray' 
    },
    { 
      label: 'Running', 
      value: statusCounts.Running || 0, 
      icon: <Play className="h-8 w-8 text-blue-600" />, 
      color: 'blue' 
    },
    { 
      label: 'Completed', 
      value: statusCounts.Completed || 0, 
      icon: <CheckCircle className="h-8 w-8 text-green-600" />, 
      color: 'green' 
    },
    { 
      label: 'Failed', 
      value: statusCounts.Failed || 0, 
      icon: <XCircle className="h-8 w-8 text-red-600" />, 
      color: 'red' 
    }
  ];

  const handleTaskAction = (taskId: string, action: string) => {
    console.log(`Action '${action}' executed on task ${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${
                  stat.color === 'gray' 
                    ? 'text-gray-900 dark:text-white' 
                    : `text-${stat.color}-600`
                }`}>
                  {stat.value}
                </p>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Tasks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.slice(0, 6).map(task => (
            <TaskCard key={task.id} task={task} onAction={handleTaskAction} />
          ))}
        </div>
      </div>
    </div>
  );
};

/// src/pages/MonitorPage.tsx ///
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Pause, 
  Play, 
  Download, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogEntry } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';

export const MonitorPage: React.FC = () => {
  const { addNotification } = useApp();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [speed, setSpeed] = useState(2000);
  const [filters, setFilters] = useState({
    status: 'all',
    model: 'all',
    server: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isMonitoring) return;

    const generateLog = (): LogEntry => {
      const models = ['Claude', 'GPT-4', 'Gemini', 'LLaMA'];
      const servers = ['MCP-01', 'MCP-02', 'MCP-03'];
      const statuses = ['queued', 'running', 'completed', 'failed'] as const;
      
      const taskId = `Task-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      if (status === 'failed') {
        setTimeout(() => {
          addNotification({
            type: 'error',
            title: 'Task Failed',
            message: `${taskId} failed to complete`,
            read: false
          });
        }, 500);
      }
      
      return {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        taskId,
        model: models[Math.floor(Math.random() * models.length)],
        status,
        server: servers[Math.floor(Math.random() * servers.length)],
        duration: status === 'completed' ? `${Math.floor(Math.random() * 60) + 1}s` : undefined
      };
    };

    const interval = setInterval(() => {
      setLogs(prev => [generateLog(), ...prev.slice(0, 199)]);
    }, speed);

    return () => clearInterval(interval);
  }, [isMonitoring, speed, addNotification]);

  const filteredLogs = logs.filter(log => {
    const matchesStatus = filters.status === 'all' || log.status === filters.status;
    const matchesModel = filters.model === 'all' || log.model === filters.model;
    const matchesServer = filters.server === 'all' || log.server === filters.server;
    const matchesSearch = searchTerm === '' || 
      log.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesModel && matchesServer && matchesSearch;
  });

  const exportLogs = () => {
    const csv = [
      'Timestamp,Task ID,Model,Status,Server,Duration',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.taskId},${log.model},${log.status},${log.server || ''},${log.duration || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={500}>Fast</option>
              <option value={2000}>Normal</option>
              <option value={5000}>Slow</option>
            </select>
          </div>
          
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
              value={filters.model} 
              onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Models</option>
              <option value="Claude">Claude</option>
              <option value="GPT-4">GPT-4</option>
              <option value="Gemini">Gemini</option>
              <option value="LLaMA">LLaMA</option>
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
                      {log.server && (
                        <>
                          <span className="text-xs text-gray-500 dark:text-gray-400">|</span>
                          <span className="text-sm text-purple-600 dark:text-purple-400">{log.server}</span>
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
                    {filteredLogs.filter(l => l.status === status).length}
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
                  {logs.length > 0 ? Math.round((logs.filter(l => l.status === 'completed').length / logs.length) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">1.8s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/// src/pages/AnalyticsPage.tsx ///
import React from 'react';
import { 
  Calendar, 
  Download, 
  Target, 
  CheckCircle, 
  Timer, 
  TrendingUp,
  PieChart,
  BarChart3,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';

export const AnalyticsPage: React.FC = () => {
  const { servers } = useApp();
  
  const analytics = {
    totalTasks: 2847,
    completedToday: 142,
    avgExecutionTime: '2.3s',
    successRate: 94.2,
    topModels: [
      { name: 'Claude', usage: 45, requests: 1247 },
      { name: 'GPT-4', usage: 32, requests: 892 },
      { name: 'Gemini', usage: 23, requests: 654 }
    ],
    serverStats: servers.map(s => ({
      name: s.name,
      processed: s.totalProcessed,
      successRate: s.successRate,
      avgResponse: s.avgResponseTime
    }))
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Tasks', value: analytics.totalTasks.toLocaleString(), change: '+12%', icon: <Target className="h-8 w-8 text-blue-600" /> },
          { title: 'Completed Today', value: analytics.completedToday, change: '+8%', icon: <CheckCircle className="h-8 w-8 text-green-600" /> },
          { title: 'Avg Execution', value: analytics.avgExecutionTime, change: '-15%', icon: <Timer className="h-8 w-8 text-purple-600" /> },
          { title: 'Success Rate', value: `${analytics.successRate}%`, change: '+2%', icon: <TrendingUp className="h-8 w-8 text-orange-600" /> }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change} vs last month
                </p>
              </div>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Model Usage Distribution
          </h3>
          <div className="space-y-4">
            {analytics.topModels.map((model, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{model.usage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${model.usage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{model.requests} requests</p>
              </div>
            ))}
          </div>
        </div>

        {/* Server Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Server Performance
          </h3>
          <div className="space-y-4">
            {analytics.serverStats.map((server, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{server.name}</span>
                  <StatusBadge status="Online" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Processed</p>
                    <p className="font-medium text-gray-900 dark:text-white">{server.processed}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className="font-medium text-green-600">{server.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Avg Response</p>
                    <p className="font-medium text-gray-900 dark:text-white">{server.avgResponse}s</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText size={20} />
          Recent Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">47</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed Last Hour</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">1.8s</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/// src/App.tsx ///
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { MonitorPage } from './pages/MonitorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'monitor': return <MonitorPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'servers': return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-2xl font-bold mb-4">MCP Servers</h2>
          <p>Server management interface coming soon...</p>
        </div>
      );
      case 'api': return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-2xl font-bold mb-4">API Configuration</h2>
          <p>API configuration panel coming soon...</p>
        </div>
      );
      case 'settings': return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p>Settings panel coming soon...</p>
        </div>
      );
      default: return <DashboardPage />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      monitor: 'Live Monitor',
      analytics: 'Analytics',
      servers: 'Servers',
      api: 'API Config',
      settings: 'Settings'
    };
    return titles[currentPage as keyof typeof titles] || 'Dashboard';
  };

  return (
    <AppProvider>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex h-screen">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
              <Header 
                isDark={isDark} 
                onToggle={toggleTheme} 
                onMenuClick={() => setSidebarOpen(true)}
                currentPage={getPageTitle()}
              />
              
              <main className="flex-1 overflow-y-auto p-6">
                <div className="animate-in fade-in duration-500">
                  {renderCurrentPage()}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;

/// package.json ///
{
  "name": "lookatni-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8"
  }
}

/// tailwind.config.js ///
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

/// next.config.js ///
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig

/// README.md ///
# LookAtni Dashboard

Sistema de monitoramento para tarefas AI executadas em servidores MCP.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/
│   │   ├── StatusBadge.tsx
│   │   ├── ProgressBar.tsx
│   │   └── NotificationCenter.tsx
│   └── dashboard/
│       └── TaskCard.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── MonitorPage.tsx
│   └── AnalyticsPage.tsx
├── context/
│   └── AppContext.tsx
├── hooks/
│   └── useTheme.ts
├── types/
│   └── index.ts
└── App.tsx
```

## 🎯 Funcionalidades

- ✅ Dashboard com estatísticas em tempo real
- ✅ Live Monitor com logs simulados e filtros
- ✅ Analytics com KPIs e gráficos
- ✅ Sistema de notificações integrado
- ✅ Context API para estado global
- ✅ Tema claro/escuro
- ✅ Layout 100% responsivo
- ✅ Animações e microinterações

## 🛠️ Extração de Arquivos

Para extrair os arquivos deste código, use o script de extração v2.0:

```bash
# Listar todos os arquivos
grep "^///" codigo.txt | sed 's/^\/\/m\/ \(.*\) \/m\/\/$/\1/'

# Extrair com o script v2.0 (fornecido separadamente)
./extract-files.sh codigo.txt ./meu-projeto
```

⚠️ **Formato dos marcadores**: `/// caminho/arquivo ///`

## 🚀 Deploy

O projeto está configurado para build estático com Next.js:

```bash
npm run build
# Os arquivos estarão em ./out/
```

## 🧩 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Estado global

## 🔧 Sistema de Marcadores v2.0

Este projeto usa marcadores únicos para decomposição:
- **Formato**: `/// caminho/arquivo ///`
- **Vantagem**: Nunca conflita com código JavaScript/TypeScript
- **Compatível**: grep, sed, awk e ferramentas Unix