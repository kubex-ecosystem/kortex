import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Detecta tema do sistema e carrega preferência salva
  const getInitialTheme = () => {
    if (typeof window === 'undefined') return false;
    
    const savedTheme = localStorage.getItem('kortex-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    // Auto-detecta tema do sistema como fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  const [isDark, setIsDark] = useState(getInitialTheme);
  
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Persiste preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('kortex-theme', newTheme ? 'dark' : 'light');
      
      // Aplica classe no documento para transições suaves
      document.documentElement.classList.toggle('dark', newTheme);
    }
  };
  
  // Aplica tema inicial
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
      
      // Escuta mudanças no tema do sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('kortex-theme');
        if (!savedTheme) {
          setIsDark(e.matches);
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [isDark]);
  
  return { isDark, toggleTheme };
};
