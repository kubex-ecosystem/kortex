import { BookOpen, ChevronDown, LogOut, Settings, User, UserCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock user data - replace with real user data
  const user = {
    name: 'Admin User',
    email: 'admin@kubex.local',
    avatar: null,
    role: 'Administrator'
  };

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action: string) => {
    setIsOpen(false);

    switch (action) {
      case 'profile':
        // Navegar para perfil - por enquanto vai para settings
        router.push('/settings');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'documentation':
        // Abrir documentação em nova aba
        window.open('https://docs.kubex.world/pulse/', '_blank', 'noopener,noreferrer');
        break;
      case 'login':
        router.push('/login');
        break;
      case 'logout':
        // Implementar logout quando tiver backend
        console.log('Logout clicked - implementar com backend');
        router.push('/login');
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      id: 'profile',
      label: 'View Profile',
      icon: <UserCircle size={16} />,
      description: 'Manage your account'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      description: 'Application preferences'
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: <BookOpen size={16} />,
      description: 'User guide and API reference'
    },
    {
      id: 'login',
      label: 'Login Page',
      icon: <User size={16} />,
      description: 'Access login screen'
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={16} className="text-white" />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {user.role}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
            }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuAction(item.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-2">
            <button
              onClick={() => handleMenuAction('logout')}
              className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 text-red-600 dark:text-red-400"
            >
              <LogOut size={16} />
              <div className="flex-1">
                <div className="font-medium text-sm">
                  Sign Out
                </div>
                <div className="text-xs opacity-75">
                  Exit your session
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
