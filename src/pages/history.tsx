import { AppLayout } from '../components/navigation/app-layout';
import History from '../pages/historyPage';

export default function HistoryPage() {
  return (
    <AppLayout>
      <History />
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
