import { AppLayout } from '../components/navigation/app-layout';
import Dashboard from './dashboardPage';

export default function Home() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
