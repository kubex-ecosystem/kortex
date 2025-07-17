import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AppProvider } from '../context/AppContext'; // ajusta o path se necessário
import React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppProvider
    children={
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
    }
    />
  );
}
