import React, { useState } from 'react';
import { AppProvider } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { DashboardPage } from '../../pages/DashboardPage';
import { MonitorPage } from '../../pages/MonitorPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';

const App: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'monitor': return <MonitorPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'servers': return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-2xl font-bold mb-4">MCP Servers</h2>
          <p>Server management interface coming soon...</p>
        </div>
      );
      case 'api': return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <h2 className="text-2xl font-bold mb-4">API Configuration</h2>
          <p>API configuration panel coming soon...</p>
        </div>
      );
      case 'settings': return <MCPSettings />;
      default: return <DashboardPage />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      monitor: 'Live Monitor',
      analytics: 'Analytics',
      servers: 'Servers',
      api: 'API Config',
      settings: 'Settings'
    };
    return titles[currentPage as keyof typeof titles] || 'Dashboard';
  };

  return (
    <AppProvider>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex h-screen">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
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
                  {renderCurrentPage()}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default App;
