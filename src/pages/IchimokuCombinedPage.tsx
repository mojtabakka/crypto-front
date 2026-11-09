import { useState, useRef } from 'react';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { SelectDropdown } from '../components/SelectDropdown';
import type {
  IchimokuCombinedScanResult,
  IchimokuCombinedSignal,
} from '../types/ichimoku';
import { fetchIchimokuCombinedScan } from '../api/ichimoku-combined/ichimoku-combined';
import { sendIchimokuToTelegram } from '../api/ichimoku-combined/ichimoku-combined';
import html2canvas from 'html2canvas';

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

const EXCHANGE_OPTIONS = [
  { value: 'binance', label: 'بینانس (Binance)' },
  { value: 'bybit', label: 'بایت Bit (Bybit)' },
  { value: 'mexc', label: 'مکس (MEXC)' },
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
  const [exchange, setExchange] = useState('binance');
  const [data, setData] = useState<IchimokuCombinedScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingToTelegram, setIsSendingToTelegram] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchIchimokuCombinedScan({ interval });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : isRTL ? 'خطا در بارگذاری' : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToTelegram = async () => {
    if (!telegramChatId) {
      setError('لطفاً چت ایدی تلگرام را وارد کنید');
      return;
    }
    if (!data) return;
    setIsSendingToTelegram(true);
    setError(null);
    try {
      const result = await sendIchimokuToTelegram(interval, telegramChatId, exchange);
      if (result.sent) {
        setError(
          isRTL
            ? `سیگنال‌ها به تلگرام فرستاده شد (${result.matches} سیگنال از ${result.totalScanned} ارز)`
            : `Signals sent to Telegram (${result.matches} signals from ${result.totalScanned} coins)`,
        );
      } else {
        setError(isRTL ? 'ارسال به تلگرام با خطا مواجه شد' : 'Failed to send to Telegram');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال به تلگرام');
    } finally {
      setIsSendingToTelegram(false);
    }
  };

  const handleShare = async () => {
    if (!tableRef.current || matches.length === 0) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#0a0e17',
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        const file = new File([blob], `ichimoku-combined-${interval}-${Date.now()}.png`, { type: 'image/png' });
        const shareData: ShareData = {
          title: isRTL ? 'اسکنر ابر و لینگ-span ترکیبی' : 'Ichimoku Combined Scanner',
          text: isRTL ? `${matches.length} ارز با سیگنال خرید ترکیبی (${interval})` : `${matches.length} coins with combined buy signals (${interval})`,
          files: [file],
        };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share(shareData);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ichimoku-combined-${interval}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error(err);
      setIsSharing(false);
    }
  };

  const matches: IchimokuCombinedSignal[] = data?.matches ?? [];

  if (isLoading && !data) return <Loading isRTL={isRTL} />;
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#0a0e17] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {isRTL ? 'ابر و لینگ-span ترکیبی' : 'Ichimoku Cloud + Lagging Span Combined Scanner'}
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
<<<<<<< HEAD
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
              <h3>🟢 {isRTL ? 'سیگنال خرید ترکیبی' : 'Combined Buy Signals'}</h3>
              <div className="summary-value">{matches.length}</div>
            </div>
            <div className="summary-card">
              <h3>⏱ {isRTL ? 'تایم‌فریم' : 'Timeframe'}</h3>
              <div className="summary-value">{interval}</div>
            </div>
=======
    <div className={`min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#0f172a] to-[#0a0e17] p-6 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              {isRTL ? 'اسکنر ابر و لینگ-span ترکیبی' : 'Ichimoku Cloud + Lagging Span Combined Scanner'}
            </h1>
            <p className="text-slate-400">
              {isRTL
                ? 'ارزهایی که هم بالای ابر Ichimoku هستن و هم لینگ-span کندل‌ها رو به بالا شکسته است'
                : 'Coins above Ichimoku cloud AND with bullish Lagging Span breakout'}
            </p>
>>>>>>> 90101238115694efe82a413bdbdb3c1860bdeff8
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3">
            <SelectDropdown options={INTERVAL_OPTIONS} value={interval} onChange={setInterval} label={isRTL ? 'تایم‌فریم' : 'Timeframe'} />
            <SelectDropdown options={EXCHANGE_OPTIONS} value={exchange} onChange={setExchange} label={isRTL ? ' صرافی' : 'Exchange'} />
            <input
              type="text"
              placeholder={isRTL ? 'چت ایدی تلگرام' : 'Telegram Chat ID'}
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-violet-400 focus:outline-none w-40"
            />
            <Button onClick={handleScan} variant="primary" disabled={isLoading}>
              {isLoading ? (isRTL ? 'در حال اسکن...' : 'Scanning...') : (isRTL ? 'اسکن ارزها' : 'Scan Symbols')}
            </Button>
            <Button
              onClick={handleSendToTelegram}
              variant="outline"
              disabled={isSendingToTelegram || !data}
              className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400"
            >
              {isSendingToTelegram
                ? (isRTL ? 'در حال ارسال...' : 'Sending...')
                : (isRTL ? '📤 فرستادن به تلگرام' : '📤 Send to Telegram')}
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
                  <h3 className="text-sm text-green-400">{isRTL ? 'سیگنال خرید ترکیبی' : 'Combined Buy Signals'}</h3>
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
                  {isRTL ? 'ارزی با شرایط ترکیبی ابر و لینگ-span یافت نشد' : 'No coins match combined Ichimoku conditions'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Button onClick={handleShare} variant="primary" disabled={isSharing}>
                    {isSharing ? (isRTL ? 'در حال اشتراک‌گذاری...' : 'Sharing...') : (isRTL ? '📤 اشتراک در تلگرام/واتساپ' : '📤 Share to Telegram/WhatsApp')}
                  </Button>
                </div>
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden" ref={tableRef}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-900/60">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'نماد' : 'Symbol'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'قیمت' : 'Price'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'Tenkan' : 'Tenkan'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'Kijun' : 'Kijun'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'سقف ابر' : 'Cloud Top'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'Chikou' : 'Chikou'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'چند دوره قبل' : 'Bars Ago'}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{isRTL ? 'وضعیت' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {matches.map((s) => (
                          <tr key={s.symbol} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-100">{s.symbol}</td>
                            <td className="px-6 py-4 text-sm text-slate-200">{fmtUsd(s.price)}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{fmt(s.tenkan)}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{fmt(s.kijun)}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{fmtUsd(s.cloudTop)}</td>
                            <td className="px-6 py-4 text-sm text-slate-400">{fmtUsd(s.chikouValue)}</td>
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
