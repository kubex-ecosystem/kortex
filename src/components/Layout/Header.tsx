import { AlertCircle, Bell, BookOpen, Menu, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../../src/context/AppContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { NotificationCenter } from '../UI/NotificationCenter';
import { SearchBar } from '../UI/SearchBar';
import { UserMenu } from '../UI/UserMenu';

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
  const { isConnected, alerts } = useWebSocket('ws://localhost:3001/ws');
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications?.filter(n => !n.read).length;
  const hasActiveAlerts = alerts.length > 0;

  const handleMenuClick = () => {
    onMenuClick();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            title='Menu'
            onClick={handleMenuClick} 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Korte<span className="text-blue-600">X</span>
          </h1>
          <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
            / {currentPage}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="hidden sm:block">
            <SearchBar />
          </div>

          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isConnected 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
            }`}>
              {isConnected ? (
                <>
                  <Wifi size={12} />
                  <span className="hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
            
            {hasActiveAlerts && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 animate-pulse">
                <AlertCircle size={12} />
                <span className="hidden sm:inline">{alerts.length}</span>
              </div>
            )}
          </div>
          
          {/* Documentation Link */}
          <a
            href="https://kortex.rafa-mori.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            title="Open Documentation"
          >
            <BookOpen size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </a>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              {(unreadCount || 0) > 0 && (
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
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
