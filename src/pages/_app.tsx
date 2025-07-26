import type { AppProps } from 'next/app';
import React from 'react';
import '../../public/styles/globals.css';
import { ToastProvider } from '../components/UI/ToastProvider';
import { AppProvider } from '../context/AppContext';
import { ResilientAppProvider } from '../context/ResilientAppContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <ResilientAppProvider>
        <AppProvider>
          <ToastProvider>
              <Component {...pageProps} />
          </ToastProvider>
        </AppProvider>
      </ResilientAppProvider>
    </React.StrictMode>
  );
}

export default MyApp;
 