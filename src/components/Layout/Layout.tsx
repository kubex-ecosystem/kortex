import { ReactNode } from 'react';
import { useKortex } from '@contexts/KortexContext';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useKortex();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-200 ${
            sidebarOpen ? 'ml-280' : 'ml-16'
          }`}
          style={{ paddingTop: '64px' }}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
