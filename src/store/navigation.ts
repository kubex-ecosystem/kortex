import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}

interface NavigationState {
  // Sidebar state
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  
  // Current navigation
  currentPath: string;
  visibleBreadcrumbs: BreadcrumbItem[];
  
  // Navigation items
  navigationItems: NavigationItem[];
  
  // Actions
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentPath: (path: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setNavigationItems: (items: NavigationItem[]) => void;
}

export const useNavigationStore = () => create<NavigationState>(
  (set, get) => ({
    // Estado inicial
    isSidebarOpen: true,
    isSidebarCollapsed: false,
    currentPath: '/dashboard',
    visibleBreadcrumbs: [{ id: 'dashboard', label: 'Dashboard', href: '/dashboard' }] as BreadcrumbItem[],
    navigationItems: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard',
        description: 'Visão geral do sistema'
      },
      {
        id: 'discord',
        label: 'Discord',
        href: '/discord',
        icon: 'MessageSquare',
        description: 'Gestão do bot Discord'
      },
      {
        id: 'tasks',
        label: 'Tasks',
        href: '/tasks',
        icon: 'CheckSquare',
        description: 'Aprovação de tarefas'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        href: '/analytics',
        icon: 'BarChart3',
        description: 'Métricas e relatórios'
      },
      {
        id: 'config',
        label: 'Configurações',
        href: '/config',
        icon: 'Settings',
        description: 'Configurações do sistema'
      },
      {
        id: 'custom',
        label: 'Personalizado',
        href: '/custom',
        icon: 'Puzzle',
        description: 'Integrações personalizadas'
      }
    ] as NavigationItem[],

    // Ações
    toggleSidebar: () => {set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))},
    toggleSidebarCollapse: () => {set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }))},
    setSidebarOpen: (open: boolean) => {set((state) => {state.isSidebarOpen = open; state.isSidebarCollapsed = !open; return state;})},
    setSidebarCollapsed: (collapsed: boolean) => {set((state) => {state.isSidebarCollapsed = collapsed; state.isSidebarOpen = !collapsed; return state;})},
    setCurrentPath: (path: string) => {set((state) => {state.currentPath = path || ''; return state;})},
    setNavigationItems: (items: NavigationItem[]) => {set((state) => {state.navigationItems = items; return state;})},
    setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => {set((state) => {state.visibleBreadcrumbs = breadcrumbs; return state;})},
  })
)();