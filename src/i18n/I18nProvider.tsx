import { useState, useEffect, type ReactNode } from 'react';
import { translations } from './translations';
import { I18nContext, type I18nContextValue } from './I18nContext';
import type { Locale } from './types';

export function I18nProvider({
  children,
}: I18nProviderProps) {
  const [locale, setLocale] =
    useState<Locale>(() => {
      const saved =
        localStorage.getItem(
          'locale',
        ) as Locale | null;
      return saved || 'fa';
    });

  useEffect(() => {
    localStorage.setItem(
      'locale',
      locale,
    );
    document.documentElement.dir =
      locale === 'fa'
        ? 'rtl'
        : 'ltr';
    document.documentElement.lang =
      locale;
  }, [locale]);

  const toggleLocale = () => {
    setLocale((prev) =>
      prev === 'fa' ? 'en' : 'fa',
    );
  };

  const value: I18nContextValue = {
    locale,
    t: translations[locale],
    toggleLocale,
    isRTL: locale === 'fa',
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

interface I18nProviderProps {
  children: ReactNode;
}
