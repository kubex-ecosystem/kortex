import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import { AppRoutes } from './router/AppRoutes';
import { ResilientAppProvider } from './context/ResilientAppContext';
import { ToastProvider } from './components/UI/ToastProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ResilientAppProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </ResilientAppProvider>
  </React.StrictMode>
);
