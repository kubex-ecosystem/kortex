import {
    Activity,
    BarChart3,
    Database,
    Download,
    FileText,
    Loader2,
    PieChart,
    Server,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../UI/StatusBadge';

export const AnalyticsPageOptimized: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // Start false to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false); // Track if we're on client
  const [analytics] = useState({ // Remove setAnalytics to prevent hydration issues
    totalRepositories: 24,
    totalPullRequests: 18,
    totalPipelines: 7,
    connectedSources: 3,
    totalServers: 4,
    onlineServers: 3,
    offlineServers: 1,
    serverUptime: 87.5,
    totalProviders: 5,
    connectedProviders: 4,
    totalAPIRequests: 1247,
    totalAPICost: 23.45
  });

  // Client-side only loading simulation
  useEffect(() => {
    setIsClient(true); // Mark as client-side rendered
    
    // Only show loading on client-side
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced to 300ms for faster loading

    return () => clearTimeout(timer);
  }, []);

  // Show loading only after client-side hydration to prevent SSR mismatch
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const primaryMetrics = [
    { 
      title: 'Total Repositories', 
      value: analytics.totalRepositories, 
      trend: '+12%', 
      icon: <Database className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    { 
      title: 'Active Pull Requests', 
      value: analytics.totalPullRequests, 
      trend: '+8%', 
      icon: <FileText className="h-5 w-5" />,
      color: 'text-green-600' 
    },
    { 
      title: 'Running Pipelines', 
      value: analytics.totalPipelines, 
      trend: '-3%', 
      icon: <Activity className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    { 
      title: 'Server Uptime', 
      value: `${analytics.serverUptime.toFixed(1)}%`, 
      trend: '+2%', 
      icon: <Server className="h-5 w-5" />,
      color: 'text-emerald-600'
    },
  ];

  const serverMetrics = [
    { label: 'Total Servers', value: analytics.totalServers, status: 'info' },
    { label: 'Online', value: analytics.onlineServers, status: 'success' },
    { label: 'Offline', value: analytics.offlineServers, status: 'error' },
    { label: 'API Providers', value: analytics.connectedProviders, status: 'info' },
  ];

  const topRepositories = [
    { name: 'kbx-kosmos', commits: 156, prs: 8, status: 'Active' },
    { name: 'kbx-synex', commits: 89, prs: 5, status: 'Active' },
    { name: 'kortex', commits: 124, prs: 3, status: 'Active' },
    { name: 'kbx-horizon', commits: 67, prs: 2, status: 'Stable' }
  ];

  const recentActivity = [
    { time: '2 min ago', user: 'System', action: 'Pipeline deployment completed', type: 'success' },
    { time: '8 min ago', user: 'Admin', action: 'New Helm chart deployed', type: 'info' },
    { time: '15 min ago', user: 'API', action: 'Rate limit warning triggered', type: 'warning' },
    { time: '1 hour ago', user: 'System', action: 'Backup process finished', type: 'success' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                System performance and insights dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryMetrics.map((metric, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${metric.color}`}>
                {metric.icon}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.trend.startsWith('+') ? 'text-green-600' : 
                metric.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
              }`}>
                <TrendingUp size={14} className={metric.trend.startsWith('-') ? 'rotate-180' : ''} />
                {metric.trend}
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.title}
            </div>
          </div>
        ))}
      </div>

      {/* Server Status & API Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Server Status</h3>
          </div>
          <div className="space-y-3">
            {serverMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{metric.value}</span>
                  <StatusBadge status={metric.status as any} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Usage Chart Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Usage</h3>
          </div>
          <div className="text-center py-8">
            <PieChart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {analytics.totalAPIRequests.toLocaleString()} requests today
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
              Cost: ${analytics.totalAPICost}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-[94%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Performance</span>
                <span className="font-medium text-gray-900 dark:text-white">87%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-[87%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Repositories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Repositories</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topRepositories.map((repo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Database size={16} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{repo.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {repo.commits} commits • {repo.prs} PRs
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={repo.status.toLowerCase() as any} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
