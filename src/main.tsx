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

import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import { AuthProvider } from './contexts/AuthContext';

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
      <AuthProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);