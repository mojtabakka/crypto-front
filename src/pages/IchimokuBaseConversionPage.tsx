import { useState, useRef } from 'react';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { fetchIchimokuBaseConversionScan } from '../api/ichimoku-base-conversion/ichimoku-base-conversion';
import { useExchange } from '../contexts/ExchangeContext';
import type {
  IchimokuBaseConversionScanResult,
  IchimokuBaseConversionSignal,
} from '../types/ichimoku';

const INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: '1d', label: '۱ روز (1D)' },
  { value: '4h', label: '۴ ساعت (4H)' },
  { value: '1w', label: '۱ هفته (1W)' },
];

function fmt(value: number): string {
  return value.toFixed(4);
}

export function IchimokuBaseConversionPage() {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();
  const [interval, setInterval] = useState('1d');
  const [data, setData] = useState<IchimokuBaseConversionScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchIchimokuBaseConversionScan({ interval, exchange });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری');
    } finally {
      setIsLoading(false);
    }
  };

  const matches: IchimokuBaseConversionSignal[] = data?.matches ?? [];

  if (isLoading && !data) return <Loading isRTL={isRTL} />;
  if (error && !data) {
    return (
      <div className="ichimoku-base-conversion-page">
        <div className="page-header">
          <h1>{isRTL ? 'کراس بیس لاین و کانورژن لاین' : 'Ichimoku Base-Conversion Crossover'}</h1>
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
    <div className={`ichimoku-base-conversion-page ${isRTL ? 'rtl' : ''}`}>
      <div className="page-header">
        <h1>
          {isRTL ? 'کراس بیس لاین و کانورژن لاین' : 'Ichimoku Base-Conversion Crossover Scanner'}
        </h1>
        <p className="page-subtitle">
          {isRTL
            ? 'خرید وقتی قیمت از روی کانورژن لاین به بالا می‌رود، فروش وقتی از روی کانورژن لاین به پایین می‌رود'
            : 'BUY signal when price crosses above Tenkan, SELL signal when price crosses below Tenkan'}
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
              <h3>🟢 {isRTL ? 'سیگنال خرید' : 'Buy Signals'}</h3>
              <div className="summary-value">{matches.filter((s) => s.signal === 'BUY').length}</div>
            </div>
            <div className="summary-card sell-summary">
              <h3>🔴 {isRTL ? 'سیگنال فروش' : 'Sell Signals'}</h3>
              <div className="summary-value">{matches.filter((s) => s.signal === 'SELL').length}</div>
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
                  ? 'ارزی با شرایط کراس بیس لاین و کانورژن لاین یافت نشد'
                  : 'No coins match base-conversion crossover conditions'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrapper" ref={tableRef}>
                <table className="ichimoku-base-conversion-table">
                  <thead>
                    <tr>
                      <th>{isRTL ? 'نماد' : 'Symbol'}</th>
                      <th>{isRTL ? 'قیمت' : 'Price'}</th>
                      <th>{isRTL ? 'نقاط برخورد' : 'Touch Point'}</th>
                      <th>{isRTL ? 'سیگنال' : 'Signal'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((s) => (
                      <tr key={s.symbol} className={`signal-row ${s.signal.toLowerCase()}-row`}>
                        <td className="symbol-cell">{s.symbol}</td>
                        <td>{fmt(s.price)}</td>
                        <td>{fmt(s.touchPoint)}</td>
                        <td>
                          <span className={`signal-badge ${s.signal.toLowerCase()}`}>
                            {isRTL ? (s.signal === 'BUY' ? 'خرید' : 'فروش') : s.signal}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
