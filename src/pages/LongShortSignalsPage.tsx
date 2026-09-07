import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { useExchange } from '../contexts/ExchangeContext';
import { Loading } from '../components/Loading';
import './LongShortSignalsPage.css';

interface LongShortSignal {
  id: number;
  symbol: string;
  exchange?: string;
  direction: 'LONG' | 'SHORT';
  score: number;
  priceChange: number | null;
  oiChange: number | null;
  fundingRate: number | null;
  currentPrice: number | null;
  ema50: number | null;
  priceVsEma50: number | null;
  signal: string | null;
  confidence: number | null;
  createdAt: string;
}

interface LongShortSignalsResponse {
  longs: LongShortSignal[];
  shorts: LongShortSignal[];
  lastUpdate: string | null;
  totalCount: number;
  exchange?: string;
}

export function LongShortSignalsPage() {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();

  const { data, isLoading, isError, refetch } = useQuery<LongShortSignalsResponse>({
    queryKey: ['long-short-signals', exchange],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/long-short-signals?exchange=${exchange}`);
      if (!res.ok) throw new Error('Failed to fetch signals');
      const data = await res.json();
      if (data.totalCount === 0) {
        const scanRes = await fetch(`http://localhost:3000/long-short-signals/scan?exchange=${exchange}`);
        if (scanRes.ok) {
          return scanRes.json();
        }
      }
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 300000,
  });

  useEffect(() => {
    refetch();
  }, [exchange, refetch]);

  if (isLoading) return <Loading isRTL={isRTL} />;
  if (isError) {
    return (
      <div className="long-short-signals-page">
        <div className="error-state">
          <p>{isRTL ? 'خطا در بارگذاری سیگنال‌ها' : 'Error loading signals'}</p>
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

  const formatPercent = (value: number | null, decimals = 2) => {
    if (value === null) return '-';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${Number(value).toFixed(decimals)}%`;
  };

  return (
    <div className="long-short-signals-page">
      <div className="page-header">
        <h1>{isRTL ? 'سیگنال‌های لانگ و شورت' : 'Long & Short Signals'}</h1>
        <div className="header-info">
          {data?.lastUpdate && (
            <span className="last-update">
              {isRTL ? 'آخرین بروزرسانی:' : 'Last update:'}{' '}
              {new Date(data.lastUpdate).toLocaleString(isRTL ? 'fa-IR' : 'en-US')}
            </span>
          )}
          <button onClick={() => refetch()} className="refresh-btn">
            🔄
          </button>
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
                    <th>{isRTL ? 'امتیاز' : 'Score'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? 'تغییر قیمت' : 'Price %'}</th>
                    <th>{isRTL ? 'OI' : 'OI %'}</th>
                    <th>{isRTL ? 'فاندینگ' : 'Funding'}</th>
                    <th>{isRTL ? 'به EMA50' : 'vs EMA50'}</th>
                    <th>{isRTL ? 'اطمینان' : 'Confidence'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.longs.map((signal) => (
                    <tr key={signal.id} className="signal-row long-row">
                      <td className="symbol-cell">{signal.symbol}</td>
                      <td className="score-cell">{Number(signal.score).toFixed(0)}</td>
                      <td>{formatPrice(signal.currentPrice)}</td>
                      <td className={signal.priceChange && signal.priceChange >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.priceChange)}
                      </td>
                      <td className={signal.oiChange && signal.oiChange >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.oiChange)}
                      </td>
                      <td className={signal.fundingRate && signal.fundingRate >= 0 ? 'pos' : 'neg'}>
                        {signal.fundingRate !== null ? (signal.fundingRate * 100).toFixed(4) + '%' : '-'}
                      </td>
                      <td className={signal.priceVsEma50 && signal.priceVsEma50 >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.priceVsEma50)}
                      </td>
                      <td>{signal.confidence !== null ? `${Number(signal.confidence).toFixed(0)}%` : '-'}</td>
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
                    <th>{isRTL ? 'امتیاز' : 'Score'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? 'تغییر قیمت' : 'Price %'}</th>
                    <th>{isRTL ? 'OI' : 'OI %'}</th>
                    <th>{isRTL ? 'فاندینگ' : 'Funding'}</th>
                    <th>{isRTL ? 'به EMA50' : 'vs EMA50'}</th>
                    <th>{isRTL ? 'اطمینان' : 'Confidence'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shorts.map((signal) => (
                    <tr key={signal.id} className="signal-row short-row">
                      <td className="symbol-cell">{signal.symbol}</td>
                      <td className="score-cell">{Number(signal.score).toFixed(0)}</td>
                      <td>{formatPrice(signal.currentPrice)}</td>
                      <td className={signal.priceChange && signal.priceChange >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.priceChange)}
                      </td>
                      <td className={signal.oiChange && signal.oiChange >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.oiChange)}
                      </td>
                      <td className={signal.fundingRate && signal.fundingRate >= 0 ? 'pos' : 'neg'}>
                        {signal.fundingRate !== null ? (signal.fundingRate * 100).toFixed(4) + '%' : '-'}
                      </td>
                      <td className={signal.priceVsEma50 && signal.priceVsEma50 >= 0 ? 'pos' : 'neg'}>
                        {formatPercent(signal.priceVsEma50)}
                      </td>
                      <td>{signal.confidence !== null ? `${Number(signal.confidence).toFixed(0)}%` : '-'}</td>
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
