import { I18nProvider } from '@/providers/i18n-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (novo nome do cacheTime)
      retry: 2,
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
      refetchOnMount: false, // Não refetch ao montar se há dados em cache
      refetchOnReconnect: true, // Só refetch quando reconectar
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
