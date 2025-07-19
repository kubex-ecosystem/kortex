import type { AppProps } from 'next/app';
import { AppProvider } from '../context/AppContext';
import { ToastProvider } from '../components/UI/ToastProvider';
import React from 'react';
import '../../public/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <ToastProvider>
        <React.StrictMode>
          <Component {...pageProps} />
        </React.StrictMode>
      </ToastProvider>
    </AppProvider>
  );
}

export default MyApp;
 