import { createContext, useContext } from 'react';
import type { Translation, Locale } from './types';

export interface I18nContextValue {
  locale: Locale;
  t: Translation;
  toggleLocale: () => void;
  isRTL: boolean;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
