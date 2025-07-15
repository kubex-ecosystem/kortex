import { useState } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  return { isDark, toggleTheme };
};