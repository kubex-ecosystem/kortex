import { motion } from 'framer-motion';
import { ChevronRight, Languages, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../providers/i18n-provider';
import { useNavigationStore, type BreadcrumbItem } from '../../store/navigation';

interface TopBarProps {
  className?: string;
}

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { t, currentLanguage, changeLanguage, languages } = useTranslation();
  const router = useRouter();
  const pathname = router.pathname;
  const {
      visibleBreadcrumbs,
      setBreadcrumbs,
      navigationItems,
  } = useNavigationStore();

  // Gerar breadcrumbs baseado na rota atual
  useEffect(() => {
    if (!pathname) 
        return;

    const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
      const breadcrumbItems: BreadcrumbItem[] = [];

      // Sempre começar com Dashboard se não estiver na home
      if (pathname.length > 0) {
        breadcrumbItems.push({
          id: `dashboard`,
          label: t('navigation.dashboard'),
          href: '/dashboard'
        });
      }

      // Encontrar item de navegação correspondente
      const currentNavItem = navigationItems.find(item => 
        pathname === item.href || pathname.startsWith(item.href + '/')
      );

      if (currentNavItem && currentNavItem.href !== '/dashboard') {
        breadcrumbItems.push({
          id: currentNavItem.id,
          label: t(`navigation.${currentNavItem.id}`),
          href: currentNavItem.href
        });
      }

      // Adicionar sub-rotas se existirem
      if (pathname.length > 1) {
        const subPath = pathname.slice(1);
        if (subPath) {
          breadcrumbItems.push({
            id: `${subPath}-sub`,
            label: subPath.charAt(0).toUpperCase() + subPath.slice(1),
            href: `/${subPath}`
          });
        }
      }

      return breadcrumbItems;
    };

    const breadcrumbItems = generateBreadcrumbs(pathname);
    setBreadcrumbs(breadcrumbItems);
  }, [pathname, navigationItems, t]); // Removido setBreadcrumbs das dependências

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme as keyof typeof themeIcons] || Monitor;

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme || 'system');
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const toggleLanguage = () => {
    const nextLang = currentLanguage === 'pt' ? 'en' : 'pt';
    changeLanguage(nextLang);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
        'border-b border-gray-200 dark:border-gray-800',
        'px-6 py-4',
      )}
    >
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2"
          >
            {visibleBreadcrumbs.map((crumb, index) => (
              <motion.div
                key={`${crumb.id}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {crumb.label}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title={t('actions.toggleLanguage')}
          >
            <Languages className="w-4 h-4" />
            <span className="ml-1 text-xs font-medium">
              {languages.find(lang => lang.code === currentLanguage)?.flag}
            </span>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            )}
            title={t('actions.toggleTheme')}
          >
            <ThemeIcon className="w-4 h-4" />
          </motion.button>

          {/* User Menu Placeholder */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center cursor-pointer"
          >
            <span className="text-white text-sm font-medium">U</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
