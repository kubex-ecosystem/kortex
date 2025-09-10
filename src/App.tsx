import Dashboard from './components/Dashboard/Dashboard';
import Layout from './components/Layout/Layout';
import { KortexProvider, useKortex } from './contexts/KortexContext';
import Servers from './components/Servers/Servers';
import Tasks from './components/Tasks/Tasks';
import Logs from './components/Logs/Logs';
import { VIEWS } from './constants';

function AppRoutes() {
  const { currentView } = useKortex();
  switch (currentView) {
    case VIEWS.SERVERS:
      return <Servers />;
    case VIEWS.TASKS:
      return <Tasks />;
    case VIEWS.LOGS:
      return <Logs />;
    case VIEWS.DASHBOARD:
    default:
      return <Dashboard />;
  }
}

function App() {
  return (
    <KortexProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </KortexProvider>
  );
}

export default App;
