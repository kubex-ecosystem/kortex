import React, { useState } from 'react'; 
import { useRouter } from 'next/router';
import { useTheme } from '../../hooks/useTheme';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/monitor': 'Live Monitor',
      '/analytics': 'Analytics',
      '/servers': 'Servers',
      '/api': 'API Config',
      '/settings': 'Settings'
    };
    return titles[router.pathname] || 'Dashboard';
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex h-screen">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
            <Header 
              isDark={isDark} 
              onToggle={toggleTheme} 
              onMenuClick={() => setSidebarOpen(true)}
              currentPage={getPageTitle()}
            />
            
            <main className="flex-1 overflow-y-auto p-6">
              <div className="animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
