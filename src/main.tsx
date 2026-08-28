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
      <I18nProvider>
        <App />
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>,
);