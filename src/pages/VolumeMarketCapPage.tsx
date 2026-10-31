import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { fetchVolumeMarketCapScan } from '../api/volume-marketcap/volume-marketcap';
import type { VolumeMarketCapMatch } from '../types/volume-marketcap';
import { Loading } from '../components/Loading';
import './VolumeMarketCapPage.css';

function fmtUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function toneForChange(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'neutral';
  if (value > 0) return 'pos';
  if (value < 0) return 'neg';
  return 'neutral';
}

export function VolumeMarketCapPage() {
  const { isRTL } = useI18n();
  const [minRatio, setMinRatio] = useState(1);
  const [minMarketCap, setMinMarketCap] = useState(10_000_000);
  const [limit, setLimit] = useState(25);
  const [includeSqueeze, setIncludeSqueeze] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['volume-marketcap-page', minRatio, minMarketCap, limit, includeSqueeze],
    queryFn: () =>
      fetchVolumeMarketCapScan({ minRatio, minMarketCap, limit, pages: 4, refresh: true, includeSqueeze }),
    enabled: hasScanned,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const handleScan = () => {
    setHasScanned(true);
    refetch();
  };

  return (
    <div className="vmc-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="vmc-header">
        <h1>{isRTL ? 'حجم / مارکت‌کپ' : 'Volume / Market Cap Screener'}</h1>
        <p className="vmc-header-subtitle">
          {isRTL ? 'ارزهایی که حجم ۲۴ ساعته >= مارکت‌کپ هستن' : 'Coins with 24h volume >= market cap'}
        </p>
      </div>

      <div className="vmc-controls">
        <label className="vmc-control">
          <span>{isRTL ? 'حداقل نسبت (حجم/مارکت‌کپ)' : 'Min ratio (Vol/MCap)'}</span>
          <input type="number" step="0.1" min="0" value={minRatio} onChange={(e) => setMinRatio(Number(e.target.value) || 0)} />
        </label>
        <label className="vmc-control">
          <span>{isRTL ? 'حداقل مارکت‌کپ ($)' : 'Min market cap ($)'}</span>
          <input type="number" step="1000000" min="0" value={minMarketCap} onChange={(e) => setMinMarketCap(Number(e.target.value) || 0)} />
        </label>
        <label className="vmc-control vmc-control-checkbox">
          <input type="checkbox" checked={includeSqueeze} onChange={(e) => setIncludeSqueeze(e.target.checked)} />
          <span>{isRTL ? 'تحلیل Long Squeeze' : 'Long squeeze analysis'}</span>
        </label>
        <label className="vmc-control">
          <span>{isRTL ? 'تعداد نتایج' : 'Limit'}</span>
          <input type="number" min="1" max="100" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 25)} />
        </label>
        <button type="button" className="vmc-scan-btn" onClick={handleScan} disabled={isLoading || isFetching}>
          {isLoading || isFetching ? (isRTL ? 'در حال اسکن...' : 'Scanning...') : (isRTL ? 'اسکن کن' : 'Scan Now')}
        </button>
      </div>

      {!hasScanned && (
        <div className="vmc-start">
          <p>{isRTL ? 'برای شروع، روی دکمه اسکن کن کلیک کنید' : 'Click Scan Now to find coins with high volume relative to market cap'}</p>
        </div>
      )}

      {hasScanned && isLoading && <Loading isRTL={isRTL} />}

      {hasScanned && isError && (
        <div className="vmc-error">
          {error instanceof Error ? error.message : 'Failed to load'}
        </div>
      )}

      {hasScanned && data && !isLoading && (
        <>
          <div className="vmc-meta">
            <span>{isRTL ? 'اسکن شده:' : 'Scanned:'} {data.totalScanned}</span>
            <span>{isRTL ? 'یافته:' : 'Found:'} {data.matches.length}</span>
            <span className="vmc-meta-muted">{new Date(data.timestamp).toLocaleTimeString()}</span>
          </div>

          {data.matches.length === 0 ? (
            <div className="vmc-empty">{isRTL ? 'موردی با این معیارها یافت نشد' : 'No coins match these criteria'}</div>
          ) : (
            <div className="vmc-table-wrap">
              <table className="vmc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{isRTL ? 'ارز' : 'Coin'}</th>
                    <th>{isRTL ? 'مارکت‌کپ' : 'Market cap'}</th>
                    <th>{isRTL ? 'حجم ۲۴س' : 'Vol 24h'}</th>
                    <th>{isRTL ? 'نسبت' : 'Ratio'}</th>
                    <th>{isRTL ? 'قیمت' : 'Price'}</th>
                    <th>{isRTL ? '۲۴س' : '24h'}</th>
                    <th>{isRTL ? 'Long Squeeze' : 'Long squeeze'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.matches.map((m: VolumeMarketCapMatch, i: number) => (
                    <tr key={m.id}>
                      <td className="vmc-rank">{m.marketCapRank ?? i + 1}</td>
                      <td className="vmc-coin">
                        <img src={m.image} alt="" className="vmc-logo" />
                        <span className="vmc-symbol">{m.symbol.toUpperCase()}</span>
                        <span className="vmc-name">{m.name}</span>
                      </td>
                      <td>{fmtUsd(m.marketCap)}</td>
                      <td>{fmtUsd(m.volume24h)}</td>
                      <td className="vmc-ratio"><span className={m.ratio >= 2 ? 'hot' : m.ratio >= 1 ? 'warm' : 'cool'}>{m.ratio.toFixed(2)}x</span></td>
                      <td>{fmtUsd(m.price)}</td>
                      <td className={toneForChange(m.priceChange24h)}>{fmtPct(m.priceChange24h)}</td>
                      <td className="vmc-squeeze">
                        {m.longSqueeze ? (
                          <span className={`vmc-squeeze-badge ${m.longSqueeze.level.toLowerCase()}`} title={m.longSqueeze.reason}>
                            {m.longSqueeze.level}
                          </span>
                        ) : <span className="vmc-squeeze-badge unknown">—</span>}
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
