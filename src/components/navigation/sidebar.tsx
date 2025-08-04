import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Puzzle,
  Settings,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../providers/i18n-provider';
import { useNavigationStore } from '../../store/navigation';

const iconMap = {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  Puzzle,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    isSidebarCollapsed,
    navigationItems,
    toggleSidebar,
    setSidebarCollapsed,
    setSidebarHover,
    setActiveItem,
  } = useNavigationStore();

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Atualizar path atual
  useEffect(() => {
    if (pathname) {
      setActiveItem(pathname);
    }
  }, [pathname]); // Removido setActiveItem das dependências

  // Fechar sidebar em mobile quando navegar
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: -320,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const contentVariants = {
    expanded: {
      width: isMobile ? 280 : 320,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      width: 80,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const renderNavigationItem = (item: any, index: number) => {
    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
    const isActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            isActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            !isActive && 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
          )}
          title={isSidebarCollapsed ? t(`navigation.${item.id}`) : undefined}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
          
          {/* Icon */}
          <div className="flex-shrink-0">
            {IconComponent && (
              <IconComponent 
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                )} 
              />
            )}
          </div>
          
          {/* Label */}
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-sm truncate"
              >
                {t(`navigation.${item.id}`)}
              </motion.span>
            )}
          </AnimatePresence>
          
          {/* Badge */}
          {item.badge && !isSidebarCollapsed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.25rem] text-center"
            >
              {item.badge}
            </motion.span>
          )}
        </Link>
      </motion.div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={isMobile ? sidebarVariants : contentVariants}
        animate={isMobile ? (isSidebarOpen ? 'open' : 'closed') : (isSidebarCollapsed ? 'collapsed' : 'expanded')}
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50',
          'flex flex-col shadow-lg',
          isMobile ? 'md:relative md:z-auto' : 'relative z-auto',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">KubeX</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            {!isMobile && (
              <button
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={t('actions.toggleSidebar')}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            
            {isMobile && (
              <button
                title='Close Sidebar'
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navigationItems.map((item: any, index: number) => renderNavigationItem(item, index))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-gray-500 dark:text-gray-400 text-center"
              >
                KubeX MCP v1.0.0
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      {isMobile && !isSidebarOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 md:hidden"
          aria-label={t('actions.toggleSidebar')}
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
      )}
    </>
  );
}
