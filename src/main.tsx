import {
  StrictMode,
} from 'react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {
  createRoot,
} from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { ExchangeProvider } from './contexts/ExchangeContext';

import './index.css';

const queryClient =
  new QueryClient();

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <QueryClientProvider
      client={queryClient}
    >
      <BrowserRouter>
        <I18nProvider>
          <ExchangeProvider>
            <App />
          </ExchangeProvider>
        </I18nProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);