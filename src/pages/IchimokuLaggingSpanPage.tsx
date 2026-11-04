import { useState } from 'react';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { SelectDropdown } from '../components/SelectDropdown';
import { fetchIchimokuLaggingSpanScan } from '../api/ichimoku-lagging-span/ichimoku-lagging-span';
import type {
  IchimokuLaggingSpanScanResult,
  IchimokuLaggingSpanSignal,
} from '../types/ichimoku';

const INTERVAL_OPTIONS = [
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
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 1) return value.toFixed(2);
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#0a0e17] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {isRTL ? 'خروج لینگ-span از کندل‌ها' : 'Ichimoku Lagging Span Exit'}
            </h1>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-12 text-center">
            <p className="text-red-400 font-semibold mb-4">{error}</p>
            <Button onClick={handleScan} variant="primary">{isRTL ? 'تلاش مجدد' : 'Retry'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#0a0e17] p-6 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {isRTL ? 'اسکنر خروج لینگ-span (چیکو) از کندل‌ها' : 'Ichimoku Lagging Span (Chikou) Exit Scanner'}
            </h1>
            <p className="text-slate-400">
              {isRTL
                ? 'لینگ-span اخرین بار به صورت صعودی از بالای کندل‌ها خارج شده است'
                : 'Lagging Span most recently exited upward from price candles'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3">
            <SelectDropdown options={INTERVAL_OPTIONS} value={interval} onChange={setInterval} label={isRTL ? 'تایم‌فریم' : 'Timeframe'} />
            <Button onClick={handleScan} variant="primary" disabled={isLoading}>
              {isLoading ? (isRTL ? 'در حال اسکن...' : 'Scanning...') : (isRTL ? 'اسکن ارزها' : 'Scan Symbols')}
            </Button>
          </div>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl">📊</div>
                  <h3 className="text-sm text-slate-400">{isRTL ? 'ارزهای بررسی شده' : 'Scanned'}</h3>
                </div>
                <div className="text-2xl font-bold text-slate-100">{data.totalScanned}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-xl">🟢</div>
                  <h3 className="text-sm text-green-400">{isRTL ? 'سیگنال خروج لینگ-span' : 'Lagging Span Exit Signals'}</h3>
                </div>
                <div className="text-2xl font-bold text-green-400">{matches.length}</div>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-xl">⏱</div>
                  <h3 className="text-sm text-slate-400">{isRTL ? 'تایم‌فریم' : 'Timeframe'}</h3>
                </div>
                <div className="text-2xl font-bold text-slate-100 uppercase">{interval}</div>
              </div>
            </div>

            {matches.length === 0 ? (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">☁️</div>
                <p className="text-slate-400">
                  {isRTL ? 'ارزی با شرایط خروج لینگ-span از کندل‌ها یافت نشد' : 'No coins match Ichimoku Lagging Span exit conditions'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'نماد' : 'Symbol'}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'قیمت' : 'Price'}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'مقدار لینگ-span' : 'Chikou Value'}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'قیمت کندل عبور' : 'Cross Candle High'}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'چند روز قبل' : 'Bars Ago'}</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'وضعیت' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {matches.map((s) => (
                        <tr key={s.symbol} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-100">{s.symbol}</td>
                          <td className="px-6 py-4 text-sm text-slate-200">{fmtUsd(s.price)}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{fmt(s.chikouValue)}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{fmtUsd(s.crossPriceHigh)}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{barsAgoLabel(isRTL, s.barsAgo)}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30">
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
