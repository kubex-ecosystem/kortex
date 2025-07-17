import type { AppProps } from 'next/app';
import { AppProvider } from '../context/AppContext';
import React from 'react';
import '../../public/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
    </AppProvider>
  );
}

export default MyApp;
 