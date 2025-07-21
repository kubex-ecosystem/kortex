import type { AppProps } from 'next/app';
import React from 'react';
import '../../public/styles/globals.css';
import { ToastProvider } from '../components/UI/ToastProvider';
import { ResilientAppProvider } from '../context/ResilientAppContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ResilientAppProvider>
      <ToastProvider>
        <React.StrictMode>
          <Component {...pageProps} />
        </React.StrictMode>
      </ToastProvider>
    </ResilientAppProvider>
  );
}

export default MyApp;
 