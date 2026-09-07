import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ExchangeName } from '../api/market/market';

interface ExchangeContextValue {
  exchange: ExchangeName;
  setExchange: (ex: ExchangeName) => void;
}

const ExchangeContext = createContext<ExchangeContextValue | undefined>(undefined);

const STORAGE_KEY = 'selected_exchange';

export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [exchange, setExchangeState] = useState<ExchangeName>('BINANCE');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ExchangeName;
    if (saved && saved !== exchange) {
      setExchangeState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, exchange);
  }, [exchange]);

  return (
    <ExchangeContext.Provider value={{ exchange, setExchange: setExchangeState }}>
      {children}
    </ExchangeContext.Provider>
  );
}

export function useExchange() {
  const ctx = useContext(ExchangeContext);
  if (!ctx) {
    throw new Error('useExchange must be used within ExchangeProvider');
  }
  return ctx;
}
