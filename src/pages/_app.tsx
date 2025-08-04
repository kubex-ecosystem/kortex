import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import React from 'react';
import '../../public/styles/globals.css';
import { ToastProvider } from '../components/UI/ToastProvider';
import { AppProvider } from '../context/AppContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ToastProvider>
              <Component {...pageProps} />
          </ToastProvider>
        </AppProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default MyApp;
 