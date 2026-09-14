import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { ExchangeBadge } from '../components/ExchangeBadge';
import './VolumeProfilePage.css';

interface VolumeProfileData {
  poc: number;
  vah: number;
  val: number;
  currentPrice: number;
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  riskRewardRatio: number | null;
  totalVolNodes: number;
}

async function fetchVolumeProfile(symbol: string, interval: string): Promise<VolumeProfileData> {
  const res = await fetch(
    `http://localhost:3000/volume-profile/${symbol}?interval=${interval}`,
  );
  if (!res.ok) throw new Error('Failed to fetch volume profile');
  return res.json();
}

const INTERVALS = ['5m', '15m', '30m', '1h', '4h', '1d', '1w'];

export function VolumeProfilePage() {
  const { isRTL } = useI18n();
  const [symbol, setSymbol] = useState(
    new URLSearchParams(window.location.search).get('symbol') || 'BTCUSDT',
  );
  const [interval, setInterval] = useState(
    new URLSearchParams(window.location.search).get('interval') || '1d',
  );
  const [inputSymbol, setInputSymbol] = useState(symbol);

  const { data, isLoading, isError, error, refetch } = useQuery<VolumeProfileData>({
    queryKey: ['volume-profile', symbol, interval],
    queryFn: () => fetchVolumeProfile(symbol, interval),
    retry: 1,
  });

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputSymbol.trim().toUpperCase();
    if (trimmed) {
      setSymbol(trimmed);
      window.history.pushState({}, '', `/volume-profile?symbol=${trimmed}&interval=${interval}`);
    }
  };

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
    window.history.pushState({}, '', `/volume-profile?symbol=${symbol}&interval=${newInterval}`);
  };

  if (isLoading) return <Loading isRTL={isRTL} />;
  if (isError) {
    return (
      <div className="volume-profile-page">
        <div className="error-state">
          <p>{isRTL ? 'خطا در بارگذاری' : 'Error loading'}</p>
          <p className="error-message">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onClick={() => refetch()} className="retry-btn">
            {isRTL ? 'تلاش مجدد' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  const getSignalClass = (signal: string) => {
    switch (signal) {
      case 'LONG':
        return 'signal-long';
      case 'SHORT':
        return 'signal-short';
      default:
        return 'signal-neutral';
    }
  };

  const getSignalText = (signal: string) => {
    if (isRTL) {
      switch (signal) {
        case 'LONG':
          return '🟢 لانگ';
        case 'SHORT':
          return '🔴 شورت';
        default:
          return '⚪ خنثی';
      }
    }
    return signal;
  };

  return (
    <div className="volume-profile-page">
      <div className="page-header">
        <h1>{isRTL ? 'والیوم پروفایل' : 'Volume Profile'}</h1>
        <ExchangeBadge />
        <form onSubmit={handleSymbolSubmit} className="symbol-form">
          <input
            type="text"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
            placeholder={isRTL ? 'نماد...' : 'Symbol...'}
            className="symbol-input"
          />
          <button type="submit" className="go-btn">
            →
          </button>
        </form>
      </div>

      <div className="interval-selector">
        {INTERVALS.map((int) => (
          <button
            key={int}
            className={`interval-btn ${interval === int ? 'active' : ''}`}
            onClick={() => handleIntervalChange(int)}
          >
            {int}
          </button>
        ))}
      </div>

      {data && (
        <>
          <div className={`signal-card ${getSignalClass(data.signal)}`}>
            <div className="signal-label">{isRTL ? 'سیگنال' : 'Signal'}</div>
            <div className="signal-value">{getSignalText(data.signal)}</div>
          </div>

          <div className="levels-grid">
            <div className="level-card poc">
              <div className="level-label">POC</div>
              <div className="level-value">{formatPrice(data.poc)}</div>
              <div className="level-desc">{isRTL ? 'نقطه کنترل' : 'Point of Control'}</div>
            </div>
            <div className="level-card vah">
              <div className="level-label">VAH</div>
              <div className="level-value">{formatPrice(data.vah)}</div>
              <div className="level-desc">{isRTL ? 'حد بالایی ارزش' : 'Value Area High'}</div>
            </div>
            <div className="level-card val">
              <div className="level-label">VAL</div>
              <div className="level-value">{formatPrice(data.val)}</div>
              <div className="level-desc">{isRTL ? 'حد پایینی ارزش' : 'Value Area Low'}</div>
            </div>
            <div className="level-card current">
              <div className="level-label">{isRTL ? 'قیمت فعلی' : 'Current'}</div>
              <div className="level-value">{formatPrice(data.currentPrice)}</div>
            </div>
          </div>

          {data.signal !== 'NEUTRAL' && (
            <div className="trade-setup">
              <h3>{isRTL ? 'تنظیمات معامله' : 'Trade Setup'}</h3>
              <div className="setup-grid">
                <div className="setup-item">
                  <span className="setup-label">{isRTL ? 'ورود' : 'Entry'}</span>
                  <span className="setup-value entry">{formatPrice(data.entryPrice)}</span>
                </div>
                <div className="setup-item">
                  <span className="setup-label">{isRTL ? 'حد ضرر' : 'Stop Loss'}</span>
                  <span className="setup-value stop-loss">{formatPrice(data.stopLoss)}</span>
                </div>
                <div className="setup-item">
                  <span className="setup-label">{isRTL ? 'حد سود' : 'Take Profit'}</span>
                  <span className="setup-value take-profit">{formatPrice(data.takeProfit)}</span>
                </div>
                <div className="setup-item">
                  <span className="setup-label">{isRTL ? 'ریسک/ریوارد' : 'R:R'}</span>
                  <span className="setup-value">
                    {data.riskRewardRatio ? `1:${Number(data.riskRewardRatio).toFixed(2)}` : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="info-card">
            <h3>{isRTL ? 'اطلاعات' : 'Info'}</h3>
            <div className="info-row">
              <span>{isRTL ? 'تعداد نودهای حجمی' : 'Volume Nodes'}</span>
              <span>{data.totalVolNodes}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
