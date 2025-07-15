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