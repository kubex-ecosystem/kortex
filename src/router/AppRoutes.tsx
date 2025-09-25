import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const DashboardPage = React.lazy(() => import('../pages/index'));
const DashboardAltPage = React.lazy(() => import('../pages/dashboard'));
const MonitorPage = React.lazy(() => import('../pages/monitor'));
const AnalyticsPage = React.lazy(() => import('../pages/analytics'));
const HelmPage = React.lazy(() => import('../pages/helm'));
const ServersPage = React.lazy(() => import('../pages/servers'));
const ApiConfigPage = React.lazy(() => import('../pages/api-config'));
const SettingsPage = React.lazy(() => import('../pages/settings'));
const LoginPage = React.lazy(() => import('../pages/login'));
const PromptEngineeringPage = React.lazy(() => import('../pages/prompt-engineering'));

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      <p className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Carregando...</p>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardAltPage />} />
      <Route path="/monitor" element={<MonitorPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/helm" element={<HelmPage />} />
      <Route path="/servers" element={<ServersPage />} />
      <Route path="/api-config" element={<ApiConfigPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/prompt-engineering" element={<PromptEngineeringPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  </Suspense>
);
