import Dashboard from '@components/Dashboard/Dashboard';
import Layout from '@components/Layout/Layout';
import { KortexProvider } from '@contexts/KortexContext';
import { LanguageProvider } from '@contexts/LanguageContext';
import { NotificationProvider } from '@contexts/NotificationContext';
import AnalyzerView from '@components/Analyzer/AnalyzerView';
import { useKortex } from '@contexts/KortexContext';
import { VIEWS } from '@constants/index';

function AppRoutes() {
  const { currentView } = useKortex();
  switch (currentView) {
    case VIEWS.ANALYZER:
      return <AnalyzerView />;
    case VIEWS.DASHBOARD:
    default:
      return <Dashboard />;
  }
}

function App() {
  return (
    <LanguageProvider>
      <NotificationProvider>
        <KortexProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </KortexProvider>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;
