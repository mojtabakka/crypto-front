import { useState, useRef, useEffect } from 'react';
import type { ExchangeName } from '../api/market/market';
import { ExchangeLogo } from './ExchangeLogo';
import './ExchangeDropdown.css';

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
    <div className="exchange-dropdown header-control" ref={dropdownRef}>
      <button
        className="exchange-dropdown-trigger"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <ExchangeLogo exchange={current.value} size={20} />
        <span className="exchange-dropdown-label">{current.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`exchange-dropdown-arrow ${open ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="exchange-dropdown-menu">
          {EXCHANGES.map((ex) => (
            <button
              key={ex.value}
              className={`exchange-dropdown-item ${selected === ex.value ? 'active' : ''}`}
              onClick={() => {
                onChange(ex.value);
                setOpen(false);
              }}
              type="button"
            >
              <ExchangeLogo exchange={ex.value} size={20} />
              <span>{ex.label}</span>
              {selected === ex.value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="exchange-dropdown-check"
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
