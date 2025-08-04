import { AppLayout } from '../components/navigation/app-layout';
import Tasks from '../pages/tasksPage';

export default function TasksPage() {
  return (
    <AppLayout>
      <Tasks />
    </AppLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
