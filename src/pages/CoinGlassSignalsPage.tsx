import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { useExchange } from '../contexts/ExchangeContext';
import { Loading } from '../components/Loading';
import './CoinGlassSignalsPage.css';

interface CoinGlassSymbolData {
  symbol: string;
  price: number;
  marketCap: number;
  openInterest: number;
  fundingRate: number;
  volume24h: number;
  liquidation24h: number;
  priceChange1h: number;
  priceChange24h: number;
  rsi1h: number | null;
  rsi4h: number | null;
  rsi1d: number | null;
}

interface CoinGlassSignal {
  symbol: string;
  signal: 'HEALTHY_BULLISH' | 'STRONG_BULLISH' | 'LONG_PUMP' | 'NORMAL_CORRECTION' | 'LONG_FLUSH' | 'NEUTRAL';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  score: number;
  data: CoinGlassSymbolData;
  reason: string;
}

interface CoinGlassScanResult {
  longs: CoinGlassSignal[];
  shorts: CoinGlassSignal[];
  neutral: CoinGlassSignal[];
  totalScanned: number;
  fearGreedIndex: number | null;
  altcoinSeasonIndex: number | null;
  timestamp: string;
}

export function CoinGlassSignalsPage() {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();

  const { data, isLoading, isError, error, refetch } = useQuery<CoinGlassScanResult>({
    queryKey: ['coinglass-signals', exchange],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/coinglass/signals?limit=200`);
      if (!res.ok) throw new Error('Failed to fetch CoinGlass signals');
      return res.json();
    },
    staleTime: 60000,
    refetchInterval: 300000,
  });

  useEffect(() => {
    refetch();
  }, [exchange, refetch]);

  if (isLoading) return <Loading isRTL={isRTL} />;
  if (isError) {
    const errorMsg = error instanceof Error ? error.message : 'خطا در بارگذاری سیگنال‌های کوین گلاس';
    return (
      <div className="coinglass-page">
        <div className="page-header">
          <h1>{isRTL ? 'سیگنال‌های کوین گلاس' : 'CoinGlass Signals'}</h1>
          <div className="header-actions">
            <button onClick={() => refetch()} className="scan-btn">
              {isRTL ? 'اسکن مجدد' : 'Scan Again'}
            </button>
          </div>
        </div>
        <div className="error-state">
          <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '12px' }}>
            {errorMsg}
          </p>
          <button onClick={() => refetch()} className="retry-btn">
            {isRTL ? 'تلاش مجدد' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatPercent = (value: number, decimals = 2) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${Number(value).toFixed(decimals)}%`;
  };

  const formatFunding = (rate: number) => {
    const prefix = rate > 0 ? '+' : '';
    return `${prefix}${(rate * 100).toFixed(4)}%`;
  };

  const formatBigNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getSignalLabel = (signal: string) => {
    const labels: Record<string, string> = {
      HEALTHY_BULLISH: isRTL ? 'صعود سالم' : 'Healthy Bullish',
      STRONG_BULLISH: isRTL ? 'صعود قوی' : 'Strong Bullish',
      LONG_PUMP: isRTL ? 'پامپ لانگ' : 'Long Pump',
      NORMAL_CORRECTION: isRTL ? 'اصلاح طبیعی' : 'Normal Correction',
      LONG_FLUSH: isRTL ? 'تخلیه لانگ' : 'Long Flush',
      NEUTRAL: isRTL ? 'خنثی' : 'Neutral',
    };
    return labels[signal] || signal;
  };

  const renderIndexBadge = (label: string, value: number | null) => {
    if (value === null) return null;
    return (
      <span className="index-badge">
        {label}: {value}/100
      </span>
    );
  };

  return (
    <div className="coinglass-page">
      <div className="page-header">
        <h1>{isRTL ? 'سیگنال‌های کوین گلاس' : 'CoinGlass Signals'}</h1>
        <div className="header-actions">
          <button onClick={() => refetch()} className="scan-btn">
            {isRTL ? 'اسکن ارزها' : 'Scan Symbols'}
          </button>
        </div>
      </div>

      <div className="global-indices">
        {data?.fearGreedIndex != null && renderIndexBadge('Fear & Greed', data.fearGreedIndex)}
        {data?.altcoinSeasonIndex != null && renderIndexBadge('Altcoin Season', data.altcoinSeasonIndex)}
      </div>

      <div className="signals-summary">
        <div className="summary-card longs-summary">
          <h3>🟢 {isRTL ? 'سیگنال‌های لانگ' : 'Long Signals'} ({data?.longs.length ?? 0})</h3>
        </div>
        <div className="summary-card shorts-summary">
          <h3>🔴 {isRTL ? 'سیگنال‌های شورت' : 'Short Signals'} ({data?.shorts.length ?? 0})</h3>
        </div>
        <div className="summary-card scanned-summary">
          <h3>📊 {isRTL ? 'ارزهای بررسی شده' : 'Scanned Symbols'} ({data?.totalScanned ?? 0})</h3>
        </div>
      </div>

      <div className="signals-container">
        <section className="signals-section longs-section">
          <h2 className="section-title long-title">
            🟢 {isRTL ? 'لانگ' : 'Long Signals'} ({data?.longs.length ?? 0})
          </h2>
          {data?.longs && data.longs.length > 0 ? (
            <div className="table-wrapper">
              <table className="signals-table">
                <thead>
                  <tr>
                    <th>{isRTL ? 'نماد' : 'Symbol'}</th>
                    <th>{isRTL ? 'سیگنال' : 'Signal'}</th>
                    <th>{isRTL ? 'امتیاز' : 'Score'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? 'تغییر ۱ساعته' : 'Price 1h'}</th>
                    <th>{isRTL ? 'تغییر ۲۴ساعته' : 'Price 24h'}</th>
                    <th>{isRTL ? 'Open Interest' : 'Open Interest'}</th>
                    <th>{isRTL ? 'حجم ۲۴ساعته' : 'Volume 24h'}</th>
                    <th>{isRTL ? 'فاندینگ' : 'Funding'}</th>
                    <th>{isRTL ? 'تخلیه ۲۴ساعته' : 'Liquidation 24h'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.longs.map((signal) => (
                    <tr key={signal.symbol} className="signal-row long-row">
                      <td className="symbol-cell">{signal.symbol}</td>
                      <td className={`signal-cell signal-${signal.signal.toLowerCase()}`}>
                        {getSignalLabel(signal.signal)}
                      </td>
                      <td className="score-cell">{Number(signal.score).toFixed(0)}</td>
                      <td>{formatPrice(signal.data.price)}</td>
                      <td className={signal.data.priceChange1h >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.priceChange1h)}
                      </td>
                      <td className={signal.data.priceChange24h >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.priceChange24h)}
                      </td>
                      <td className={signal.data.openInterest >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.openInterest)}
                      </td>
                      <td className={signal.data.volume24h >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.volume24h)}
                      </td>
                      <td className={signal.data.fundingRate >= 0 ? 'pos' : 'neg'}>
                        {formatFunding(signal.data.fundingRate)}
                      </td>
                      <td>{formatBigNumber(signal.data.liquidation24h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>{isRTL ? 'سیگنال لانگی یافت نشد' : 'No long signals found'}</p>
            </div>
          )}
        </section>

        <section className="signals-section shorts-section">
          <h2 className="section-title short-title">
            🔴 {isRTL ? 'شورت' : 'Short Signals'} ({data?.shorts.length ?? 0})
          </h2>
          {data?.shorts && data.shorts.length > 0 ? (
            <div className="table-wrapper">
              <table className="signals-table">
                <thead>
                  <tr>
                    <th>{isRTL ? 'نماد' : 'Symbol'}</th>
                    <th>{isRTL ? 'سیگنال' : 'Signal'}</th>
                    <th>{isRTL ? 'امتیاز' : 'Score'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? 'تغییر ۱ساعته' : 'Price 1h'}</th>
                    <th>{isRTL ? 'تغییر ۲۴ساعته' : 'Price 24h'}</th>
                    <th>{isRTL ? 'Open Interest' : 'Open Interest'}</th>
                    <th>{isRTL ? 'حجم ۲۴ساعته' : 'Volume 24h'}</th>
                    <th>{isRTL ? 'فاندینگ' : 'Funding'}</th>
                    <th>{isRTL ? 'تخلیه ۲۴ساعته' : 'Liquidation 24h'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shorts.map((signal) => (
                    <tr key={signal.symbol} className="signal-row short-row">
                      <td className="symbol-cell">{signal.symbol}</td>
                      <td className={`signal-cell signal-${signal.signal.toLowerCase()}`}>
                        {getSignalLabel(signal.signal)}
                      </td>
                      <td className="score-cell">{Number(signal.score).toFixed(0)}</td>
                      <td>{formatPrice(signal.data.price)}</td>
                      <td className={signal.data.priceChange1h >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.priceChange1h)}
                      </td>
                      <td className={signal.data.priceChange24h >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.priceChange24h)}
                      </td>
                      <td className={signal.data.openInterest >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.openInterest)}
                      </td>
                      <td className={signal.data.volume24h >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.data.volume24h)}
                      </td>
                      <td className={signal.data.fundingRate >= 0 ? 'pos' : 'neg'}>
                        {formatFunding(signal.data.fundingRate)}
                      </td>
                      <td>{formatBigNumber(signal.data.liquidation24h)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>{isRTL ? 'سیگنال شورتی یافت نشد' : 'No short signals found'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
