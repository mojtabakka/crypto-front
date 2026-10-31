import { useState } from 'react';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { fetchIchimokuCombinedScan } from '../api/ichimoku-combined/ichimoku-combined';
import type {
  IchimokuCombinedScanResult,
  IchimokuCombinedSignal,
} from '../types/ichimoku';
import './IchimokuCombinedPage.css';

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

export function IchimokuCombinedPage() {
  const { isRTL } = useI18n();
  const [interval, setInterval] = useState('1d');
  const [data, setData] = useState<IchimokuCombinedScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchIchimokuCombinedScan({ interval });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری');
    } finally {
      setIsLoading(false);
    }
  };

  const matches: IchimokuCombinedSignal[] = data?.matches ?? [];

  if (isLoading && !data) return <Loading isRTL={isRTL} />;
  if (error && !data) {
    return (
      <div className="ichimoku-combined-page">
        <div className="page-header">
          <h1>{isRTL ? 'ابر و لینگ-span ترکیبی' : 'Ichimoku Combined Scanner'}</h1>
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
    <div className={`ichimoku-combined-page ${isRTL ? 'rtl' : ''}`}>
      <div className="page-header">
        <h1>
          {isRTL ? 'اسکنر ابر و لینگ-span ترکیبی' : 'Ichimoku Cloud + Lagging Span Combined Scanner'}
        </h1>
        <p className="page-subtitle">
          {isRTL
            ? 'ارزهایی که هم بالای ابر 이chimoku هستن و هم لینگ-span کندل‌ها رو به بالا شکسته است'
            : 'Coins above Ichimoku cloud AND with bullish Lagging Span breakout'}
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
              <h3>🟢 {isRTL ? 'سیگنال خرید ترکیبی' : 'Combined Buy Signals'}</h3>
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
                  ? 'ارزی با شرایط ترکیبی ابر و لینگ-span یافت نشد'
                  : 'No coins match combined Ichimoku conditions'}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="ichimoku-combined-table">
                <thead>
                  <tr>
                    <th>{isRTL ? 'نماد' : 'Symbol'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? 'تنكان' : 'Tenkan'}</th>
                    <th>{isRTL ? 'کیجون' : 'Kijun'}</th>
                    <th>{isRTL ? 'سقف ابر' : 'Cloud Top'}</th>
                    <th>{isRTL ? 'لینگ-span' : 'Chikou'}</th>
                    <th>{isRTL ? 'چند روز قبل' : 'Bars Ago'}</th>
                    <th>{isRTL ? 'وضعیت' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((s) => (
                    <tr key={s.symbol} className="signal-row buy-row">
                      <td className="symbol-cell">{s.symbol}</td>
                      <td>{fmtUsd(s.price)}</td>
                      <td>{fmt(s.tenkan)}</td>
                      <td>{fmt(s.kijun)}</td>
                      <td>{fmtUsd(s.cloudTop)}</td>
                      <td>{fmtUsd(s.chikouValue)}</td>
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
