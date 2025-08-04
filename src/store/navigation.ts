import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  children?: NavigationItem[];
}

export interface NavigationState {
  // Sidebar state
  isSidebarCollapsed: boolean;
  sidebarHoverState: boolean;
  
  // Breadcrumbs
  visibleBreadcrumbs: BreadcrumbItem[];
  
  // Navigation items
  navigationItems: NavigationItem[];
  
  // Current active item
  activeItem: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarHover: (hover: boolean) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  setActiveItem: (itemId: string) => void;
  setNavigationItems: (items: NavigationItem[]) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      // Initial state
      isSidebarCollapsed: false,
      sidebarHoverState: false,
      visibleBreadcrumbs: [{ id: 'dashboard', label: 'Dashboard', href: '/dashboard' }],
      navigationItems: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          id: 'tasks',
          label: 'Tasks',
          href: '/tasks',
        },
        {
          id: 'discord',
          label: 'Discord',
          href: '/discord',
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/settings',
        }
      ],
      activeItem: null,
      
      // Actions
      toggleSidebar: () => set((state) => ({ 
        isSidebarCollapsed: !state.isSidebarCollapsed 
      })),
      
      setSidebarCollapsed: (collapsed: boolean) => set({ 
        isSidebarCollapsed: collapsed 
      }),
      
      setSidebarHover: (hover: boolean) => set({ 
        sidebarHoverState: hover 
      }),
      
      setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => set((state) =>{ 
        state.visibleBreadcrumbs = breadcrumbs;
        return state;
      }),
      
      setActiveItem: (itemId: string) => set((state) =>{ 
        state.activeItem = itemId;
        return state;
      }),

      setNavigationItems: (items: NavigationItem[]) => set((state) =>{ 
        state.navigationItems = items;
        return state;
      }),
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        activeItem: state.activeItem,
      }),
    }
  )
);