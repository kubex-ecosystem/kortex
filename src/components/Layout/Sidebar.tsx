import {
    Activity,
    BarChart3,
    BookOpen,
    Cpu,
    Database,
    ExternalLink,
    LayoutDashboard,
    Package,
    Plus,
    Settings,
    X
} from 'lucide-react';
import { useRouter } from 'next/router';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose
}) => {
  const router = useRouter();
  const currentPath = router.pathname;

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Activity size={20} />, label: 'Live Monitor', path: '/monitor' },
    { icon: <BarChart3 size={20} />, label: 'Analytics', path: '/analytics' },
    { icon: <Package size={20} />, label: 'Helm Charts', path: '/helm' },
    { icon: <Cpu size={20} />, label: 'Servers', path: '/servers' },
    { icon: <Database size={20} />, label: 'API Config', path: '/api-config' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  const externalLinks = [
    { 
      icon: <BookOpen size={20} />, 
      label: 'Documentation', 
      url: 'https://kortex.rafa-mori.dev/',
      description: 'Complete user guide and API reference'
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

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
              Kube<span className="text-blue-600">X</span>            </h2>
            <button 
              title='Close Sidebar'
              onClick={onClose} 
              className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left transform hover:scale-105
                  ${currentPath === item.path 
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
          
          {/* External Links Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3">
              Resources
            </h3>
            <div className="space-y-1">
              {externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left transform hover:scale-105 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  {link.icon}
                  <span className="font-medium flex-1">{link.label}</span>
                  <ExternalLink size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </a>
              ))}
            </div>
          </div>
          
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
