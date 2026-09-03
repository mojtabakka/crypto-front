import type { ExchangeName } from '../api/market/market';
import './ExchangeSelector.css';

interface ExchangeSelectorProps {
  selected: ExchangeName;
  onChange: (exchange: ExchangeName) => void;
  isRTL?: boolean;
}

const EXCHANGES: { value: ExchangeName; label: string; color: string }[] = [
  { value: 'BINANCE', label: 'Binance', color: '#f0b90b' },
  { value: 'OKX', label: 'OKX', color: '#000000' },
  { value: 'BYBIT', label: 'Bybit', color: '#f7a600' },
  { value: 'MEXC', label: 'MEXC', color: '#00b897' },
  { value: 'KUCOIN', label: 'KuCoin', color: '#24ae8f' },
  { value: 'BINGX', label: 'BingX', color: '#2354e6' },
  { value: 'CRYPTOCOM', label: 'Crypto.com', color: '#103f68' },
];

export function ExchangeSelector({ selected, onChange, isRTL }: ExchangeSelectorProps) {
  return (
    <div className="exchange-selector">
      <span className="exchange-selector-label">
        {isRTL ? 'صرافی:' : 'Exchange:'}
      </span>
      <div className="exchange-selector-buttons">
        {EXCHANGES.map((ex) => (
          <button
            key={ex.value}
            className={`exchange-btn ${selected === ex.value ? 'active' : ''}`}
            onClick={() => onChange(ex.value)}
            style={{
              borderColor: selected === ex.value ? ex.color : 'transparent',
              background: selected === ex.value ? `${ex.color}20` : 'transparent',
            }}
          >
            <span
              className="exchange-btn-dot"
              style={{ background: ex.color }}
            />
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
