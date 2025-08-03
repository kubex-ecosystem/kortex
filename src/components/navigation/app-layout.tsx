'use client';

import { useNavigationStore } from '@/store/navigation';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isSidebarOpen, isSidebarCollapsed } = useNavigationStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          'md:ml-0', // Em mobile não há margem porque sidebar é overlay
          isSidebarOpen ? 'lg:ml-50' : 'lg:ml-20' // Desktop: margem baseada no estado
        )}
      >
        {/* TopBar */}
        <TopBar />
        
        {/* Page Content */}
        <main className={cn('flex-1 overflow-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
