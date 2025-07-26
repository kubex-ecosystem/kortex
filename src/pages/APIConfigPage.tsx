import { useApp } from '../context/AppContext';

export default function APIConfigPage() {
  const { isDark } = useApp();
  const themeClass = isDark ? 'dark-theme' : 'light-theme';
  
  return (
    <div className={themeClass}>
      <h1>API Configuration</h1>
      <p>Configure your API settings here.</p>
    </div>
  );
}
