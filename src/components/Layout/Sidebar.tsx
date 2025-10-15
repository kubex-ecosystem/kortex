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
  currentPage?: string;
  isOpen?: boolean;
  onPageChange: (page: string) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onPageChange = () => { },
  currentPage = 'Dashboard'
}) => {
  const router = useRouter();
  const isActive = (path: string) => currentPage === path || router.pathname === path;
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
      url: 'https://pulse.kubex.world/docs',
      description: 'Complete user guide and API reference'
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleMenuAction = (action: string) => {
    onClose();
    switch (action) {
      case 'documentation':
        handleExternalLink('https://api.kubex.world');
        break;
      default:
        break;
    }
  };

  const handleMenuItemClick = (path: string) => {
    onPageChange(path);
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
        fixed left-0 top-0 h-full w-64 bg-surface dark:bg-slate-900
        border-r border dark:border-slate-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-display font-bold text-text-head dark:text-white">
              Pul<span className="text-primary">se</span>
            </h2>
            <button
              title='Close Sidebar'
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
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
                    ? 'bg-primary-subtle dark:bg-primary/20 text-primary-foreground dark:text-primary shadow-md'
                    : 'text-text-body dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* External Links Section */}
          <div className="mt-6 pt-4 border-t border dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-3">
              Resources
            </h3>
            <div className="space-y-1">
              {externalLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left transform hover:scale-105 text-text-body dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 group"
                >
                  {link.icon}
                  <span className="font-medium flex-1">{link.label}</span>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border dark:border-slate-800">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white rounded-lg transition-all duration-200 transform hover:scale-105 font-medium">
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
