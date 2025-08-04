import { cn } from '../../lib/utils';
import { useNavigationStore } from '../../store/navigation';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  const { isSidebarCollapsed } = useNavigationStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          'md:ml-0', // Em mobile não há margem porque sidebar é overlay
          !isSidebarCollapsed ? 'lg:ml-50' : 'lg:ml-20' // Desktop: margem baseada no collapsed
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
