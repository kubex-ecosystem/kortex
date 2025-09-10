import Dashboard from './components/Dashboard/Dashboard';
import Layout from './components/Layout/Layout';
import { KortexProvider } from './contexts/KortexContext';

function App() {
  return (
    <KortexProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </KortexProvider>
  );
}

export default App;
