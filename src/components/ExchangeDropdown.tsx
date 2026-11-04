import { useState, useRef, useEffect } from 'react';
import type { ExchangeName } from '../api/market/market';
import { ExchangeLogo } from './ExchangeLogo';

interface ExchangeDropdownProps {
  selected: ExchangeName;
  onChange: (exchange: ExchangeName) => void;
  isRTL?: boolean;
}

const EXCHANGES: { value: ExchangeName; label: string }[] = [
  { value: 'BINANCE', label: 'Binance' },
  { value: 'OKX', label: 'OKX' },
  { value: 'BYBIT', label: 'Bybit' },
  { value: 'MEXC', label: 'MEXC' },
  { value: 'KUCOIN', label: 'KuCoin' },
  { value: 'BINGX', label: 'BingX' },
  { value: 'CRYPTOCOM', label: 'Crypto.com' },
  { value: 'TOOBIT', label: 'Toobit' },
  { value: 'LBANK', label: 'LBank' },
  { value: 'ORBIT', label: 'Orbit' },
];

export function ExchangeDropdown({ selected, onChange }: ExchangeDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = EXCHANGES.find((e) => e.value === selected) ?? EXCHANGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/60 border border-border-subtle text-sm text-text-primary hover:bg-surface/80 transition-colors"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <ExchangeLogo exchange={current.value} size={20} />
        <span>{current.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0f172a]/95 backdrop-blur-xl border border-border-subtle rounded-xl shadow-xl overflow-hidden z-50">
          {EXCHANGES.map((ex) => (
            <button
              key={ex.value}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface/60 transition-colors ${selected === ex.value ? 'bg-surface/40 text-primary' : 'text-text-primary'}`}
              onClick={() => {
                onChange(ex.value);
                setOpen(false);
              }}
              type="button"
            >
              <ExchangeLogo exchange={ex.value} size={20} />
              <span className="flex-1 text-left">{ex.label}</span>
              {selected === ex.value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
