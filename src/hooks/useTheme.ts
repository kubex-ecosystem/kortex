import { useEffect, useState } from 'react';

export const useTheme = () => {
  // Start with false to prevent hydration mismatch, then detect client-side
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Client-side theme detection and initialization
  useEffect(() => {
    setIsClient(true);
    
    // Detecta tema do sistema e carrega preferência salva (apenas no cliente)
    const savedTheme = localStorage.getItem('kortex-theme');
    let initialTheme = false;
    
    if (savedTheme) {
      initialTheme = savedTheme === 'dark';
    } else {
      // Auto-detecta tema do sistema como fallback
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDark(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme);
  }, []);
  
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
  
  // Sistema de escuta para mudanças no tema do sistema (apenas no cliente)
  useEffect(() => {
    if (!isClient) return;
    
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
  }, [isClient]);
  
  return { isDark, toggleTheme };
};
