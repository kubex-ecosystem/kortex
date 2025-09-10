import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import { useKortex } from '../../contexts/KortexContext';

export default function Header() {
  const { toggleSidebar, notifications, gobeConnection } = useKortex();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          title="Toggle sidebar"
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xl font-bold text-gradient">Kortex</div>
          <div className="text-xs text-slate-400">Mission Control</div>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input
            title="Search"
            type="text"
            placeholder="Search servers, tasks, logs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${gobeConnection?.status === 'connected'
              ? 'bg-green-500'
              : gobeConnection?.status === 'connecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
              }`}
          />
          <span className="text-sm text-slate-400">
            {gobeConnection?.status === 'connected'
              ? 'Connected'
              : gobeConnection?.status === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'
            }
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          title="Settings"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <Settings size={18} />
        </button>

        {/* User Menu */}
        <button
          title="User Menu"
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
