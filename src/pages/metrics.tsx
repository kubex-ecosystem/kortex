import { AppLayout } from '../components/navigation/app-layout';
import Metrics from '../pages/metricsPage';

export default function MetricsPage() {
  return (
    <AppLayout>
      <Metrics />
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
