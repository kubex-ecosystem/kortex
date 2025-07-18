import React from 'react';
import { Layout } from '../components/Layout/Layout';
import { DashboardPage } from '../components/Pages/DashboardPage';

export default function Home() {
  return (
    <Layout>
      <DashboardPage />
    </Layout>
  );
}
