import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import './PressureScanPage.css';

interface PressureSignal {
  symbol: string;
  signal: 'BUYING_PRESSURE' | 'SELLING_PRESSURE' | 'SHORT_SQUEEZE' | 'LONG_OVERLOADED';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  reason: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  oiChange1h: number;
  oiChange24h: number;
  volume1h: number;
  volume24h: number;
  fundingRate: number | null;
  score: number;
}

interface PressureScanResult {
  signals: PressureSignal[];
  scanned: number;
  duration: number;
  timestamp: string;
}

export function PressureScanPage() {
  const { isRTL } = useI18n();

  const { data, isLoading, isError, error, refetch } = useQuery<PressureScanResult>({
    queryKey: ['pressure-scan'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/pressure-scan?limit=100');
      if (!res.ok) throw new Error('Failed to fetch pressure signals');
      return res.json();
    },
    staleTime: 60000,
  });

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatPercent = (value: number, decimals = 2) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(decimals)}%`;
  };

  const getSignalConfig = (signal: string) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      BUYING_PRESSURE: {
        label: isRTL ? 'فشار خرید' : 'Buying Pressure',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.1)',
      },
      SELLING_PRESSURE: {
        label: isRTL ? 'فشار فروش' : 'Selling Pressure',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.1)',
      },
      SHORT_SQUEEZE: {
        label: isRTL ? 'Short Squeeze' : 'Short Squeeze',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.1)',
      },
      LONG_OVERLOADED: {
        label: isRTL ? 'لانگ شلوغ' : 'Long Overloaded',
        color: '#f97316',
        bg: 'rgba(249, 115, 22, 0.1)',
      },
    };
    return configs[signal] || { label: signal, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
  };

  if (isLoading) return <Loading isRTL={isRTL} />;
  if (isError) {
    const errorMsg = error instanceof Error ? error.message : 'خطا در بارگذاری';
    return (
      <div className="pressure-page">
        <div className="page-header">
          <h1>{isRTL ? 'اسکن فشار حجم' : 'Volume Pressure Scan'}</h1>
        </div>
        <div className="error-state">
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{errorMsg}</p>
          <button onClick={() => refetch()} className="scan-btn">{isRTL ? 'تلاش مجدد' : 'Retry'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pressure-page">
      <div className="page-header">
        <h1>{isRTL ? 'اسکن فشار حجم' : 'Volume Pressure Scan'}</h1>
        <button onClick={() => refetch()} className="scan-btn">{isRTL ? 'اسکن مجدد' : 'Scan Again'}</button>
      </div>

      <div className="formula-info">
        <h3>{isRTL ? 'فرمول‌های اسکن شده' : 'Scanned Patterns'}</h3>
        <ul>
          <li>Price ↑ + OI ↑ + Volume ↑ → {isRTL ? 'فشار خرید' : 'Buying Pressure'}</li>
          <li>Price ↓ + OI ↑ + Volume ↑ → {isRTL ? 'فشار فروش' : 'Selling Pressure'}</li>
          <li>Price ↑ + OI ↓ + Short Liquidation ↑ → {isRTL ? 'Short Squeeze' : 'Short Squeeze'}</li>
          <li>Price ↑ + OI ↑ + Funding ↑↑ → {isRTL ? 'لانگ شلوغ' : 'Long Overloaded'}</li>
        </ul>
      </div>

      <div className="signals-count">
        {isRTL ? 'تعداد سیگنال‌ها' : 'Signals'}: {data?.signals.length ?? 0} / {data?.scanned ?? 0} {isRTL ? 'ارز بررسی شده' : 'scanned'}
      </div>

      <div className="signals-grid">
        {data?.signals.map((signal) => {
          const config = getSignalConfig(signal.signal);
          return (
            <div key={signal.symbol} className="signal-card" style={{ borderLeft: `3px solid ${config.color}` }}>
              <div className="signal-header">
                <span className="symbol">{signal.symbol}</span>
                <span className="signal-badge" style={{ background: config.bg, color: config.color }}>
                  {config.label}
                </span>
              </div>
              <div className="signal-body">
                <div className="price-row">
                  <span>${formatPrice(signal.price)}</span>
                  <span className={signal.priceChange1h >= 0 ? 'pos' : 'neg'}>
                    {formatPercent(signal.priceChange1h)}
                  </span>
                </div>
                <div className="metrics">
                  <div className="metric">
                    <span className="metric-label">OI 1h</span>
                    <span className={signal.oiChange1h >= 0 ? 'pos' : 'neg'}>{formatPercent(signal.oiChange1h)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Vol 24h</span>
                    <span>{signal.volume24h >= 1e9 ? `${(signal.volume24h/1e9).toFixed(2)}B` : `${(signal.volume24h/1e6).toFixed(2)}M`}</span>
                  </div>
                  {signal.fundingRate !== null && (
                    <div className="metric">
                      <span className="metric-label">Funding</span>
                      <span className={signal.fundingRate >= 0 ? 'pos' : 'neg'}>{(signal.fundingRate * 100).toFixed(4)}%</span>
                    </div>
                  )}
                </div>
                <div className="reason">{signal.reason}</div>
              </div>
            </div>
          );
        })}
      </div>

      {data?.signals.length === 0 && (
        <div className="empty-state">
          <p>{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
        </div>
      )}
    </div>
  );
}
