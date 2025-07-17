import React from 'react';
import { AppProvider } from '../context/AppContext';
import App from '../components/App/App';

export default function Home() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
