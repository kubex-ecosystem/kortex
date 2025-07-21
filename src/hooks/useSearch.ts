import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'page' | 'server' | 'task' | 'log';
  path?: string;
  icon?: string;
}

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Dados de exemplo para busca - substitua por dados reais da API
  const searchData = useMemo(() => [
    { id: '1', title: 'Dashboard', description: 'Main dashboard overview', category: 'page' as const, path: '/', icon: '📊' },
    { id: '2', title: 'Live Monitor', description: 'Real-time system monitoring', category: 'page' as const, path: '/monitor', icon: '📡' },
    { id: '3', title: 'Analytics', description: 'Data analytics and insights', category: 'page' as const, path: '/analytics', icon: '📈' },
    { id: '4', title: 'Helm Charts', description: 'Kubernetes Helm deployments', category: 'page' as const, path: '/helm', icon: '⛵' },
    { id: '5', title: 'Servers', description: 'MCP server management', category: 'page' as const, path: '/servers', icon: '🖥️' },
    { id: '6', title: 'API Config', description: 'API configuration settings', category: 'page' as const, path: '/api-config', icon: '⚙️' },
    { id: '7', title: 'Settings', description: 'Application settings', category: 'page' as const, path: '/settings', icon: '🔧' },
    { id: '8', title: 'MCP-01', description: 'Production server - Online', category: 'server' as const, icon: '✅' },
    { id: '9', title: 'MCP-02', description: 'Staging server - Offline', category: 'server' as const, icon: '⚠️' },
    { id: '10', title: 'Deploy Task', description: 'Helm chart deployment', category: 'task' as const, icon: '🚀' },
  ], []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    return searchData.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    ).slice(0, 8); // Limite de 8 resultados
  }, [query, searchData]);

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      router.push(result.path);
    }
    setQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    handleResultClick
  };
};
