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