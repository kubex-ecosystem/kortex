import { ArrowRight, Search } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useSearch } from '../../hooks/useSearch';

export const SearchBar: React.FC = () => {
  const { query, setQuery, results, isOpen, setIsOpen, handleResultClick } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fechar search quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Atalho Cmd+K / Ctrl+K para focar na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  const getCategoryColor = (category: string) => {
    const colors = {
      page: 'bg-primary-subtle dark:bg-primary/20/30 text-primary-foreground dark:text-primary',
      server: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      task: 'bg-accent-subtle dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
      log: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
    };
    return colors[category as keyof typeof colors] || colors.page;
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 w-64 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-gray-600">
        <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search... (⌘K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none flex-1 min-w-0"
        />
        {query && (
          <button 
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length > 0 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {results.length === 0 && query.length > 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {query.length > 0 && (
                <div className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </div>
              )}
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                  >
                    <span className="text-lg flex-shrink-0">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {result.title}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(result.category)}`}>
                          {result.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              
              {query.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">Escape</kbd> to close
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
