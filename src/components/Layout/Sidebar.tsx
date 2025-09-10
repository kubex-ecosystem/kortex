import {
  Activity,
  BarChart3,
  FileText,
  Home,
  Server,
  Settings,
  Zap
} from 'lucide-react';
import { VIEWS } from '../../constants/index';
import { useKortex } from '../../contexts/KortexContext';

export default function Sidebar() {
  const { sidebarOpen, currentView, setCurrentView, metrics } = useKortex();

  const navigationItems = [
    {
      id: VIEWS.DASHBOARD,
      label: 'Dashboard',
      icon: Home,
      count: null,
    },
    {
      id: VIEWS.SERVERS,
      label: 'MCP Servers',
      icon: Server,
      count: metrics.totalServers,
    },
    {
      id: VIEWS.TASKS,
      label: 'Tasks',
      icon: Activity,
      count: metrics.activeTasks,
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: BarChart3,
      count: null,
    },
    {
      id: VIEWS.LOGS,
      label: 'Logs',
      icon: FileText,
      count: null,
    },
    {
      id: VIEWS.SETTINGS,
      label: 'Settings',
      icon: Settings,
      count: null,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-slate-800 border-r border-slate-700 transition-all duration-200 ${sidebarOpen ? 'w-[280px]' : 'w-16'
        }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fadeIn">
              <div className="font-semibold text-white">Kortex</div>
              <div className="text-xs text-slate-400">v2.0.0</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              title={item.label}
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <Icon size={18} />
              {sidebarOpen && (
                <div className="flex-1 flex items-center justify-between animate-fadeIn">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.count !== null && item.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-600 text-slate-300'
                      }`}>
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Section */}
      {sidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4 animate-fadeIn">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
            <div className="text-xs text-slate-400 mb-2">System Status</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Health</span>
                <span className={`text-xs px-2 py-1 rounded-full ${metrics.systemHealth === 'healthy'
                  ? 'bg-green-500/20 text-green-400'
                  : metrics.systemHealth === 'warning'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}>
                  {metrics.systemHealth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Online</span>
                <span className="text-xs text-green-400">
                  {metrics.onlineServers}/{metrics.totalServers}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
