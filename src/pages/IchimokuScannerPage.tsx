import { useState } from 'react';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { SelectDropdown } from '../components/SelectDropdown';
import { fetchIchimokuScan } from '../api/ichimoku-scanner/ichimoku';
import type { IchimokuScanResult, IchimokuSignal } from '../types/ichimoku';

<<<<<<< HEAD
const INTERVAL_OPTIONS: { value: string; label: { fa: string; en: string } }[] = [
  { value: '1d', label: { fa: '۱ روز (1D)', en: '1 Day (1D)' } },
  { value: '4h', label: { fa: '۴ ساعت (4H)', en: '4 Hours (4H)' } },
  { value: '1w', label: { fa: '۱ هفته (1W)', en: '1 Week (1W)' } },
=======
const INTERVAL_OPTIONS = [
  { value: '1d', label: '۱ روز (1D)' },
  { value: '4h', label: '۴ ساعت (4H)' },
  { value: '1w', label: '۱ هفته (1W)' },
>>>>>>> 90101238115694efe82a413bdbdb3c1860bdeff8
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

export function IchimokuScannerPage() {
  const { isRTL } = useI18n();
  const [interval, setInterval] = useState('1d');
  const [data, setData] = useState<IchimokuScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchIchimokuScan({ interval });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : isRTL ? 'خطا در بارگذاری' : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const matches: IchimokuSignal[] = data?.matches ?? [];

  if (isLoading && !data) return <Loading isRTL={isRTL} />;
  if (error && !data) {
    return (
      <div className="bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#0a0e17] p-6 min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 font-bold text-transparent text-3xl">
              {isRTL ? 'اسکنر ابر Ichimoku' : 'Ichimoku Cloud Scanner'}
            </h1>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl p-12 border border-red-500/30 rounded-2xl text-center">
            <p className="mb-4 font-semibold text-red-400">{error}</p>
            <Button onClick={handleScan} variant="primary">{isRTL ? 'تلاش مجدد' : 'Retry'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className={`ichimoku-page ${isRTL ? 'rtl' : ''}`}>
      <div className="page-header">
        <h1>{isRTL ? 'اسکنر ابر 이chimoku' : 'Ichimoku Cloud Scanner'}</h1>
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
                  {isRTL ? opt.label.fa : opt.label.en}
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
              <div className="summary-value">{matches.length}</div>
            </div>
            <div className="summary-card">
              <h3>⏱ {isRTL ? 'تایم‌فریم' : 'Timeframe'}</h3>
              <div className="summary-value">{interval}</div>
            </div>
=======
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#0a0e17] p-6 ${isRTL ? 'rtl' : ''}`}>
      <div className="mx-auto max-w-7xl">
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 font-bold text-transparent text-3xl">
              {isRTL ? 'اسکنر ابر Ichimoku' : 'Ichimoku Cloud Scanner'}
            </h1>
            <p className="text-slate-400">
              {isRTL ? 'شناسایی ارزهای بالای ابر Ichimoku' : 'Scan for coins above Ichimoku Cloud'}
            </p>
>>>>>>> 90101238115694efe82a413bdbdb3c1860bdeff8
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/40 backdrop-blur-xl p-3 border border-slate-700/50 rounded-xl">
            <SelectDropdown
              options={INTERVAL_OPTIONS}
              value={interval}
              onChange={setInterval}
              label={isRTL ? 'تایم‌فریم' : 'Timeframe'}
            />
            <Button onClick={handleScan} variant="primary" disabled={isLoading}>
              {isLoading ? (isRTL ? 'در حال اسکن...' : 'Scanning...') : (isRTL ? 'اسکن ارزها' : 'Scan Symbols')}
            </Button>
          </div>
        </div>

        {data && (
          <>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-6">
              <div className="bg-slate-800/40 backdrop-blur-xl p-5 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex justify-center items-center bg-blue-500/10 rounded-lg w-10 h-10 text-xl">📊</div>
                  <h3 className="text-slate-400 text-sm">{isRTL ? 'ارزهای بررسی شده' : 'Scanned'}</h3>
                </div>
                <div className="font-bold text-slate-100 text-2xl">{data.totalScanned}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl p-5 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex justify-center items-center bg-green-500/10 rounded-lg w-10 h-10 text-xl">🟢</div>
                  <h3 className="text-green-400 text-sm">{isRTL ? 'سیگنال خرید' : 'Buy Signals'}</h3>
                </div>
                <div className="font-bold text-green-400 text-2xl">{matches.length}</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-xl p-5 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex justify-center items-center bg-purple-500/10 rounded-lg w-10 h-10 text-xl">⏱</div>
                  <h3 className="text-slate-400 text-sm">{isRTL ? 'تایم‌فریم' : 'Timeframe'}</h3>
                </div>
                <div className="font-bold text-slate-100 text-2xl uppercase">{interval}</div>
              </div>
            </div>

            {matches.length === 0 ? (
              <div className="bg-slate-800/40 backdrop-blur-xl p-12 border border-slate-700/50 rounded-2xl text-center">
                <div className="mb-4 text-6xl">☁️</div>
                <p className="text-slate-400">
                  {isRTL ? 'ارزی با شرایط ابر Ichimoku یافت نشد' : 'No coins match Ichimoku conditions'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/60">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'نماد' : 'Symbol'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'قیمت' : 'Price'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'Tenkan' : 'Tenkan'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'Kijun' : 'Kijun'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'Span A' : 'Span A'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'Span B' : 'Span B'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'سقف ابر' : 'Cloud Top'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'Chikou' : 'Chikou'}</th>
                        <th className="px-6 py-4 font-semibold text-slate-400 text-xs text-left uppercase tracking-wider">{isRTL ? 'وضعیت' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {matches.map((s) => (
                        <tr key={s.symbol} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-100 text-sm">{s.symbol}</td>
                          <td className="px-6 py-4 text-slate-200 text-sm">{fmtUsd(s.price)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.tenkan)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.kijun)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.spanA)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.spanB)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.cloudTop)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{fmt(s.chikou)}</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-500/10 px-3 py-1 border border-green-500/30 rounded-full font-semibold text-green-400 text-xs">
                              {isRTL ? 'خرید' : 'BUY'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

