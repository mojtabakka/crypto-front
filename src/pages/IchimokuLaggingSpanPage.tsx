import { useState } from 'react';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { fetchIchimokuLaggingSpanScan } from '../api/ichimoku-lagging-span/ichimoku-lagging-span';
import type {
  IchimokuLaggingSpanScanResult,
  IchimokuLaggingSpanSignal,
} from '../types/ichimoku';
import './IchimokuLaggingSpanPage.css';

const INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: '1d', label: '۱ روز (1D)' },
  { value: '4h', label: '۴ ساعت (4H)' },
  { value: '1w', label: '۱ هفته (1W)' },
];

function fmtUsd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

function fmt(value: number): string {
  return value.toFixed(4);
}

function barsAgoLabel(isRTL: boolean, bars: number): string {
  return isRTL ? `${bars} روز قبل` : `${bars} bars ago`;
}

export function IchimokuLaggingSpanPage() {
  const { isRTL } = useI18n();
  const [interval, setInterval] = useState('1d');
  const [data, setData] = useState<IchimokuLaggingSpanScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchIchimokuLaggingSpanScan({ interval });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری');
    } finally {
      setIsLoading(false);
    }
  };

  const matches: IchimokuLaggingSpanSignal[] = data?.matches ?? [];

  if (isLoading && !data) return <Loading isRTL={isRTL} />;
  if (error && !data) {
    return (
      <div className="ichimoku-lagging-page">
        <div className="page-header">
          <h1>{isRTL ? 'خروج لینگ-span از کندل‌ها' : 'Ichimoku Lagging Span Exit'}</h1>
        </div>
        <div className="error-state">
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '12px' }}>
            {error}
          </p>
          <button onClick={handleScan} className="scan-btn">
            {isRTL ? 'تلاش مجدد' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ichimoku-lagging-page ${isRTL ? 'rtl' : ''}`}>
      <div className="page-header">
        <h1>
          {isRTL ? 'اسکنر خروج لینگ-span (چیکو) از کندل‌ها' : 'Ichimoku Lagging Span (Chikou) Exit Scanner'}
        </h1>
        <p className="page-subtitle">
          {isRTL
            ? 'لینگ-span اخرین بار به صورت صعودی از بالای کندل‌ها خارج شده است'
            : 'Lagging Span most recently exited upward from price candles'}
        </p>
        <div className="header-actions">
          <label className="vmc-control">
            <span>{isRTL ? 'تایم‌فریم' : 'Timeframe'}</span>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              style={{ padding: '4px 6px', fontSize: '13px' }}
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button onClick={handleScan} className="scan-btn" disabled={isLoading}>
            {isLoading ? (isRTL ? 'در حال اسکن...' : 'Scanning...') : (isRTL ? 'اسکن ارزها' : 'Scan Symbols')}
          </button>
        </div>
      </div>

      {data && (
        <>
          <div className="scan-summary">
            <div className="summary-card">
              <h3>📊 {isRTL ? 'ارزهای بررسی شده' : 'Scanned'}</h3>
              <div className="summary-value">{data.totalScanned}</div>
            </div>
            <div className="summary-card buy-summary">
              <h3>🟢 {isRTL ? 'سیگنال خروج لینگ-span' : 'Lagging Span Exit Signals'}</h3>
              <div className="summary-value">{matches.length}</div>
            </div>
            <div className="summary-card">
              <h3>⏱ {isRTL ? 'تایم‌فریم' : 'Timeframe'}</h3>
              <div className="summary-value">{interval}</div>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="empty-state">
              <p>
                {isRTL
                  ? 'ارزی با شرایط خروج لینگ-span از کندل‌ها یافت نشد'
                  : 'No coins match Ichimoku Lagging Span exit conditions'}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="ichimoku-lagging-table">
                <thead>
                  <tr>
                    <th>{isRTL ? 'نماد' : 'Symbol'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? 'مقدار لینگ-span' : 'Chikou Value'}</th>
                    <th>{isRTL ? 'قیمت کندل عبور' : 'Cross Candle High'}</th>
                    <th>{isRTL ? 'چند روز قبل' : 'Bars Ago'}</th>
                    <th>{isRTL ? 'وضعیت' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((s) => (
                    <tr key={s.symbol} className="signal-row buy-row">
                      <td className="symbol-cell">{s.symbol}</td>
                      <td>{fmtUsd(s.price)}</td>
                      <td>{fmt(s.chikouValue)}</td>
                      <td>{fmtUsd(s.crossPriceHigh)}</td>
                      <td>{barsAgoLabel(isRTL, s.barsAgo)}</td>
                      <td>
                        <span className="signal-badge buy">{isRTL ? 'خرید' : 'BUY'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
