import { useEffect, useState } from 'react';

export const useTheme = () => {
  // Start with false to prevent hydration mismatch, then detect client-side
  const [isDark, setIsDark] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side theme detection and initialization
  useEffect(() => {
    setIsClient(true);

    // Light-first: carrega preferência salva, padrão é LIGHT
    const savedTheme = localStorage.getItem('pulse-theme');
    const initialTheme = savedTheme === 'dark';

    setIsDark(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    // Persiste preferência no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulse-theme', newTheme ? 'dark' : 'light');

      // Aplica classe no documento para transições suaves
      document.documentElement.classList.toggle('dark', newTheme);
    }
  };

  // Sistema de escuta para mudanças no tema do sistema (apenas no cliente)
  useEffect(() => {
    if (!isClient) return;

    // Escuta mudanças no tema do sistema (só aplica se não houver preferência salva)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('pulse-theme');
      // Nunca sobrescreve preferência do usuário - light-first
      if (!savedTheme) {
        // Mantém light como padrão, não segue sistema
        return;
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isClient]);

  return { isDark, toggleTheme };
};
