import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  Database,
  ExternalLink,
  GitBranch,
  LayoutDashboard,
  Monitor,
  Package,
  Play,
  Server,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export const DashboardPageComplete: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stats] = useState({
    // System Overview
    totalServers: 4,
    activeServers: 3,
    totalRepositories: 24,
    totalPullRequests: 18,
    totalPipelines: 7,
    helmReleases: 12,
    
    // Activity Stats
    successfulPipelines: 5,
    failedPipelines: 2,
    openPRs: 12,
    draftPRs: 6,
    connectedSources: 3,
    
    // Performance
    averageResponseTime: 245,
    uptime: 99.2,
    apiCallsToday: 1247,
    storageUsed: 67
  });

  const [recentActivity] = useState([
    { id: 1, type: 'deploy', message: 'Helm chart "nginx-app" deployed successfully', time: '2 min ago', status: 'success' },
    { id: 2, type: 'pr', message: 'Pull request #234 merged into main branch', time: '8 min ago', status: 'success' },
    { id: 3, type: 'alert', message: 'API rate limit warning for GitHub provider', time: '15 min ago', status: 'warning' },
    { id: 4, type: 'server', message: 'MCP Server reconnected after brief downtime', time: '1 hour ago', status: 'info' },
    { id: 5, type: 'backup', message: 'System backup completed successfully', time: '3 hours ago', status: 'success' }
  ]);

  useEffect(() => {
    // Simulate initial load
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const primaryCards = [
    { 
      label: 'Active Servers', 
      value: `${stats.activeServers}/${stats.totalServers}`, 
      icon: <Server className="h-6 w-6" />, 
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      subtitle: `${((stats.activeServers/stats.totalServers)*100).toFixed(1)}% uptime`,
      action: () => router.push('/servers')
    },
    { 
      label: 'Repositories', 
      value: stats.totalRepositories, 
      icon: <Database className="h-6 w-6" />, 
      color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      subtitle: 'GitHub integrations',
      action: () => router.push('/analytics')
    },
    { 
      label: 'Active Pipelines', 
      value: stats.totalPipelines, 
      icon: <Activity className="h-6 w-6" />, 
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      subtitle: `${stats.successfulPipelines} success, ${stats.failedPipelines} failed`,
      action: () => router.push('/analytics')
    },
    { 
      label: 'Helm Releases', 
      value: stats.helmReleases, 
      icon: <Package className="h-6 w-6" />, 
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      subtitle: 'Kubernetes deployments',
      action: () => router.push('/helm')
    }
  ];

  const quickStats = [
    { label: 'Response Time', value: `${stats.averageResponseTime}ms`, trend: '+5%', color: 'text-blue-600' },
    { label: 'API Calls', value: stats.apiCallsToday.toLocaleString(), trend: '+12%', color: 'text-green-600' },
    { label: 'Storage Used', value: `${stats.storageUsed}%`, trend: '+3%', color: 'text-orange-600' },
    { label: 'Uptime', value: `${stats.uptime}%`, trend: '+0.1%', color: 'text-emerald-600' }
  ];

  const quickActions = [
    { label: 'Deploy Helm Chart', icon: <Play className="w-4 h-4" />, color: 'bg-blue-600 hover:bg-blue-700', action: () => router.push('/helm') },
    { label: 'View Analytics', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-green-600 hover:bg-green-700', action: () => router.push('/analytics') },
    { label: 'Monitor System', icon: <Monitor className="w-4 h-4" />, color: 'bg-purple-600 hover:bg-purple-700', action: () => router.push('/monitor') },
    { label: 'Manage APIs', icon: <Zap className="w-4 h-4" />, color: 'bg-orange-600 hover:bg-orange-700', action: () => router.push('/api-config') }
  ];

  const getActivityIcon = (type: string, status: string) => {
    const iconClass = status === 'success' ? 'text-green-500' : 
                     status === 'warning' ? 'text-yellow-500' : 
                     status === 'error' ? 'text-red-500' : 'text-blue-500';
    
    switch(type) {
      case 'deploy': return <Package className={`w-4 h-4 ${iconClass}`} />;
      case 'pr': return <GitBranch className={`w-4 h-4 ${iconClass}`} />;
      case 'alert': return <AlertCircle className={`w-4 h-4 ${iconClass}`} />;
      case 'server': return <Server className={`w-4 h-4 ${iconClass}`} />;
      default: return <Activity className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                KubeX ecosystem overview and system monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryCards.map((card, index) => (
          <div 
            key={index} 
            onClick={card.action}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {card.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {card.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</div>
                <div className={`text-xs font-medium ${stat.color}`}>{stat.trend}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`w-full flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-lg transition-colors text-sm font-medium`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <button 
              onClick={() => router.push('/monitor')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              View all →
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Server Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">MCP Kosmos</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Synex Hub</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Horizon CLI</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">Idle</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">API Health</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">GitHub API</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Claude API</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">Ready</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Kubernetes</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Getting Started</h4>
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                New to Kortex? Get started with our comprehensive documentation.
              </p>
              <a
                href="https://kortex.rafa-mori.dev/getting-started/quick-start/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              >
                Quick Start Guide
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="text-sm space-y-1">
              <a 
                href="https://kortex.rafa-mori.dev/guide/configuration/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                → Configuration Guide
              </a>
              <a 
                href="https://kortex.rafa-mori.dev/features/extraction/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                → Feature Overview
              </a>
              <a 
                href="https://kortex.rafa-mori.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                → Full Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
