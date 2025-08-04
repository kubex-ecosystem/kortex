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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 overflow-auto">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          'md:ml-11 md:mr-11', // Em mobile não há margem porque sidebar é overlay
          // Não precisou de margem, a tela sem ela ocupou todo espaço sem 
          // sobrepor, sem desagrados.. rsrs 
          // !isSidebarCollapsed ? 'lg:ml-5' : 'lg:ml-5' // Desktop: margem baseada no collapsed
        )}
      >
        {/* TopBar */}
        <TopBar />
        
        {/* Page Content */}
        <main className={cn('flex-1', className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
