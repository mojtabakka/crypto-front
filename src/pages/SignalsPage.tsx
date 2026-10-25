import { useState, useCallback } from 'react';
import { useExchange } from '../contexts/ExchangeContext';
import { useI18n } from '../i18n';
import { useScanProgress } from '../hooks/useScanProgress';
import { useScannerData } from '../hooks/useScannerData';
import { Loading } from '../components/Loading';
import type { AboveEmaSignal, PullbackSignal, ReapproachSignal, ScannerTab, SymbolSignal } from '../types/market-scanner';
import { AboveEmaTab } from '../components/AboveEmaTab';
import { NewsPanel } from '../components/NewsPanel';
import { SignalsHeader } from '../components/SignalsHeader';
import { SignalsTabs } from '../components/SignalsTabs';
import { SignalRow } from '../components/SignalRow';
import { SignalActions } from '../components/SignalActions';
import { LongShortTab } from '../components/LongShortTab';
import { VolumeMarketCapPanel } from '../components/VolumeMarketCapPanel';
import './SignalsPage.css';

interface SignalsPageProps {
  onSelectSymbol: (symbol: string) => void;
  onBack: () => void;
}

type ScannerItem = SymbolSignal | PullbackSignal | ReapproachSignal;

export function SignalsPage({ onSelectSymbol, onBack }: SignalsPageProps) {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();
  const { progress: scanProgress } = useScanProgress();
  const [activeTab, setActiveTab] = useState<ScannerTab | null>(null);
  const [useReliableSignals, setUseReliableSignals] = useState(false);
  const [newsSymbol, setNewsSymbol] = useState<string | null>(null);

  const scanner = useScannerData({ activeTab, useReliableSignals, exchange });
  const handleOpenNews = useCallback((symbol: string) => setNewsSymbol(symbol), []);
  const handleOpenTradingView = useCallback((symbol: string) => window.open(`https://www.tradingview.com/symbols/${symbol}/`, '_blank'), []);

  const handleToggleReliable = useCallback(() => {
    setUseReliableSignals(prev => {
      const next = !prev;
      if (activeTab === 'signals') {
        if (next) {
          scanner.refetchReliableSignals();
        } else {
          scanner.refetchSignals();
        }
      }
      return next;
    });
  }, [activeTab, scanner]);

  const renderSignalsTab = () => {
    const activeData = scanner.useReliableSignals ? scanner.reliableSignalsData : scanner.signalsData;
    const shorts = scanner.shortTimeframe;
    const shortsInfo = {
      '4h': { data: scanner.shorts4hData, loading: scanner.shorts4hLoading },
      '1h': { data: scanner.shorts1hData, loading: scanner.shorts1hLoading },
      '1d': { data: scanner.shortsDailyData, loading: scanner.shortsDailyLoading },
      combined: { data: scanner.shortsCombinedData, loading: scanner.shortsCombinedLoading },
    };
    const currentShorts = shortsInfo[shorts];

    const timeframeTabs: { key: '4h' | '1h' | '1d' | 'combined'; label: string }[] = [
      { key: '4h', label: '4h' },
      { key: '1h', label: '1h' },
      { key: '1d', label: isRTL ? 'روزانه' : 'Daily' },
      { key: 'combined', label: isRTL ? 'ترکیبی' : 'Combined' },
    ];

    return (
      <>
        <div className="fake-risk-legend">
          <span>⚠️ {isRTL ? 'احتمال فیک بودن سیگنال' : 'Fake Signal Probability'}</span>
          <span className="fake-risk-low">🟢 {isRTL ? 'کم' : 'Low'} (&lt;35%)</span>
          <span className="fake-risk-medium">🟡 {isRTL ? 'متوسط' : 'Medium'} (35-65%)</span>
          <span className="fake-risk-high">🔴 {isRTL ? 'زیاد' : 'High'} (&gt;65%)</span>
        </div>
        {(scanner.signalsLoading || scanner.reliableSignalsLoading || scanner.fakeSignalsLoading) && (
          <Loading isRTL={isRTL} progress={scanProgress?.current} total={scanProgress?.total} />
        )}
        {activeData && (
          <>
            {activeData.longs.length > 0 && (
              <div className="signals-section">
                <h4>🟢 {isRTL ? 'فرصت‌های لانگ' : 'Long Opportunities'}</h4>
                {activeData.longs.map((item, i) => (
                  <SignalRow
                    key={item.symbol}
                    item={item}
                    rank={i + 1}
                    isRTL={isRTL}
                    risk={undefined}
                    watchlisted={scanner.watchlistSymbols.has(item.symbol)}
                    onSelectSymbol={onSelectSymbol}
                    onOpenNews={handleOpenNews}
                    onOpenTradingView={handleOpenTradingView}
                    onToggleWatchlist={scanner.handleAddToWatchlist}
                  />
                ))}
              </div>
            )}
            <div className="signals-section">
              <h4>🔴 {isRTL ? 'فرصت‌های شورت' : 'Short Opportunities'}</h4>
              <div className="timeframe-tabs">
                {timeframeTabs.map((tf) => (
                  <button
                    key={tf.key}
                    className={`timeframe-tab ${shorts === tf.key ? 'active' : ''}`}
                    onClick={() => scanner.handleShortTimeframeChange(tf.key)}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
              {currentShorts.loading && <Loading isRTL={isRTL} />}
              {!currentShorts.loading && currentShorts.data?.shorts.length > 0 && (
                <>
                  {currentShorts.data.shorts.map((item, i) => (
                    <SignalRow
                      key={item.symbol}
                      item={item}
                      rank={i + 1}
                      isRTL={isRTL}
                      risk={undefined}
                      watchlisted={scanner.watchlistSymbols.has(item.symbol)}
                      onSelectSymbol={onSelectSymbol}
                      onOpenNews={handleOpenNews}
                      onOpenTradingView={handleOpenTradingView}
                      onToggleWatchlist={scanner.handleAddToWatchlist}
                    />
                  ))}
                </>
              )}
              {!currentShorts.loading && (!currentShorts.data?.shorts || currentShorts.data.shorts.length === 0) && (
                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  const renderTabContent = () => {
    const tab = scanner.activeTab;
    if (!tab) return null;

    if (tab === 'signals') {
      return renderSignalsTab();
    }

    if (tab === 'weekly-above-ema50' || tab === 'daily-above-ema50-long' || tab === 'weekly-above-ema50-long') {
      const isWeeklyAbove = tab === 'weekly-above-ema50';
      const isDaily = tab === 'daily-above-ema50-long';
      const data = isWeeklyAbove
        ? scanner.weeklyAboveEma50Data
        : isDaily
          ? scanner.dailyAboveEma50LongData
          : scanner.weeklyAboveEma50LongData;
      const loading = isWeeklyAbove
        ? scanner.weeklyAboveEma50Loading
        : isDaily
          ? scanner.dailyAboveEma50LongLoading
          : scanner.weeklyAboveEma50LongLoading;
      return (
        <AboveEmaTab
          data={data as unknown as { symbols: AboveEmaSignal[] }}
          isLoading={loading}
          isRTL={isRTL}
          scanProgress={scanProgress}
          title={isRTL ? 'بالای EMA50' : 'Above EMA'}
          emptyText={isRTL ? 'ارزی بالای EMA50 یافت نشد' : 'No symbols above EMA50'}
          renderItem={(item, index) => (
            <div key={item.symbol} className="signal-item pullback-bull" onClick={() => onSelectSymbol(item.symbol)}>
              <div className="signal-rank">{index + 1}</div>
              <div className="signal-info">
                <span className="signal-symbol">{item.symbol}</span>
                <span className="signal-badge long">
                  ↑ {item.priceVsEma50 !== null ? `+${item.priceVsEma50.toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className="signal-stats">
                <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                  {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="signal-actions">
                <SignalActions
                  symbol={item.symbol}
                  isWatchlisted={scanner.watchlistSymbols.has(item.symbol)}
                  isRTL={isRTL}
                  onOpenNews={handleOpenNews}
                  onOpenTradingView={handleOpenTradingView}
                  onToggleWatchlist={scanner.handleAddToWatchlist}
                />
              </div>
            </div>
          )}
        />
      );
    }

  if (tab === 'funding-extreme') {
    return (
      <div className="signals-section">
        <h4>Funding Extreme</h4>
        {scanner.fundingExtremeLoading && <Loading isRTL={isRTL} />}
        {!scanner.fundingExtremeLoading && scanner.fundingExtremeData && scanner.fundingExtremeData.symbols.length > 0 && (
          <>
            {scanner.fundingExtremeData.symbols.map((item, i) => (
              <div key={item.symbol} className="signal-item" onClick={() => onSelectSymbol(item.symbol)}>
                <div className="signal-rank">{i + 1}</div>
                <div className="signal-info">
                  <span className="signal-symbol">{item.symbol}</span>
                  <span className={`signal-badge ${item.direction === 'LONG_SQUEEZE' ? 'long' : item.direction === 'SHORT_SQUEEZE' ? 'short' : ''}`}>
                    {item.direction === 'LONG_SQUEEZE' ? 'LONG_SQUEEZE' : item.direction === 'SHORT_SQUEEZE' ? 'SHORT_SQUEEZE' : 'NEUTRAL'}
                  </span>
                </div>
                <div className="signal-stats">
                  <span className={`signal-stat ${item.fundingRate > 0 ? 'neg' : 'pos'}`}>
                    Funding: {(item.fundingRate * 100).toFixed(4)}%
                  </span>
                  <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                    {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                  </span>
                  {item.direction !== 'NEUTRAL' && (
                    <>
                      <span className="signal-stat pos">T1: {item.target1 > 0 ? '+' : ''}{item.target1.toFixed(1)}%</span>
                      <span className="signal-stat pos">T2: {item.target2 > 0 ? '+' : ''}{item.target2.toFixed(1)}%</span>
                      <span className="signal-stat pos">T3: {item.target3 > 0 ? '+' : ''}{item.target3.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        {!scanner.fundingExtremeLoading && (!scanner.fundingExtremeData?.symbols || scanner.fundingExtremeData.symbols.length === 0) && (
          <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No funding extreme signals found'}</p>
        )}
      </div>
    );
  }

  if (tab === 'strong') {
    return (
      <div>
        <div className="signals-section">
          <h4>🟢 Strong Longs</h4>
          {scanner.strongLoading && <Loading isRTL={isRTL} />}
          {!scanner.strongLoading && scanner.strongData && scanner.strongData.longs.length > 0 && (
            <>
              {scanner.strongData.longs.map((item, i) => (
                <SignalRow
                  key={item.symbol}
                  item={item}
                  rank={i + 1}
                  isRTL={isRTL}
                  risk={undefined}
                  watchlisted={scanner.watchlistSymbols.has(item.symbol)}
                  onSelectSymbol={onSelectSymbol}
                  onOpenNews={handleOpenNews}
                  onOpenTradingView={handleOpenTradingView}
                  onToggleWatchlist={scanner.handleAddToWatchlist}
                />
              ))}
            </>
          )}
          {!scanner.strongLoading && (!scanner.strongData?.longs || scanner.strongData.longs.length === 0) && (
            <p className="empty">{isRTL ? 'لانگ قوی یافت نشد' : 'No strong longs'}</p>
          )}
        </div>
        <div className="signals-section">
          <h4>🔴 Strong Shorts</h4>
          {scanner.strongLoading && <Loading isRTL={isRTL} />}
          {!scanner.strongLoading && scanner.strongData && scanner.strongData.shorts.length > 0 && (
            <>
              {scanner.strongData.shorts.map((item, i) => (
                <SignalRow
                  key={item.symbol}
                  item={item}
                  rank={i + 1}
                  isRTL={isRTL}
                  risk={undefined}
                  watchlisted={scanner.watchlistSymbols.has(item.symbol)}
                  onSelectSymbol={onSelectSymbol}
                  onOpenNews={handleOpenNews}
                  onOpenTradingView={handleOpenTradingView}
                  onToggleWatchlist={scanner.handleAddToWatchlist}
                />
              ))}
            </>
          )}
          {!scanner.strongLoading && (!scanner.strongData?.shorts || scanner.strongData.shorts.length === 0) && (
            <p className="empty">{isRTL ? 'شورت قوی یافت نشد' : 'No strong shorts'}</p>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'liquidation-clusters') {
    return (
      <div>
        <div className="signals-section">
          <h4>🔥 {isRTL ? 'خامه‌های نقدشدنی (کلاستر)' : 'Liquidation Clusters'}</h4>
          {scanner.liquidationClustersLoading && <Loading isRTL={isRTL} />}
          {!scanner.liquidationClustersLoading && scanner.liquidationClustersData && scanner.liquidationClustersData.clusters.length > 0 && (
            <>
              <div className="cluster-summary">
                <span>{isRTL ? 'تعداد کلاسترها:' : 'Clusters:'} {scanner.liquidationClustersData.clusters.length}</span>
                <span>{isRTL ? 'تعداد نمادها:' : 'Symbols:'} {scanner.liquidationClustersData.scanned}</span>
                <span>{isRTL ? 'مدت زمان:' : 'Duration:'} {scanner.liquidationClustersData.duration}ms</span>
              </div>
              {scanner.liquidationClustersData.clusters.map((cluster, i) => (
                <div key={`${cluster.symbol}-${cluster.side}-${cluster.priceCluster}`} className={`signal-item ${cluster.side === 'LONG' ? 'long' : 'short'}`} onClick={() => onSelectSymbol(cluster.symbol)}>
                  <div className="signal-rank">{i + 1}</div>
                  <div className="signal-info">
                    <span className="signal-symbol">{cluster.symbol}</span>
                    <span className={`signal-badge ${cluster.side === 'LONG' ? 'long' : 'short'}`}>
                      {cluster.side} @ ${(cluster.priceCluster / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="signal-stats">
                    <span className="signal-stat danger">
                      💀 Value: ${cluster.totalValue.toLocaleString()}
                    </span>
                    <span className="signal-stat">
                      Qty: {cluster.totalQuantity.toLocaleString()}
                    </span>
                    <span className="signal-stat">
                      📊 Events: {cluster.liquidationCount}
                    </span>
                    <span className="signal-stat">
                      Range: ${cluster.priceRange.min.toLocaleString()} - ${cluster.priceRange.max.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
          {!scanner.liquidationClustersLoading && (!scanner.liquidationClustersData?.clusters || scanner.liquidationClustersData.clusters.length === 0) && (
            <p className="empty">{isRTL ? 'خامه نقدشدنی در کلاستر یافت نشد' : 'No liquidation clusters found'}</p>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'trusted-long-short') {
    return (
      <div>
        <div className="signals-section">
          <h4>🛡️ {isRTL ? 'لانگ معتبر' : 'Trusted Longs'}</h4>
          {scanner.trustedLongShortLoading && <Loading isRTL={isRTL} />}
          {!scanner.trustedLongShortLoading && scanner.trustedLongShortData && scanner.trustedLongShortData.longs.length > 0 && (
            <>
              <div className="trust-summary">
                <span>{isRTL ? 'تعداد معتبر:' : 'Trusted:'} {scanner.trustedLongShortData.longs.length}</span>
                <span>{isRTL ? 'امتیاز کمی:' : 'Min Score:'} 60</span>
              </div>
              {scanner.trustedLongShortData.longs.map((item, i) => (
                <div key={item.symbol} className={`signal-item long ${item.verified ? 'verified' : ''}`} onClick={() => onSelectSymbol(item.symbol)}>
                  <div className="signal-rank">{i + 1}</div>
                  <div className="signal-info">
                    <span className="signal-symbol">{item.symbol}</span>
                    <span className="signal-badge long">↑ LONG</span>
                    {item.trustBadges.includes('funding') && (
                      <span className="trust-badge funding">💰</span>
                    )}
                    {item.trustBadges.includes('liquidation') && (
                      <span className="trust-badge liquidation">💀</span>
                    )}
                    {item.trustBadges.includes('oi') && (
                      <span className="trust-badge oi">📊</span>
                    )}
                  </div>
                  <div className="signal-stats">
                    <span className={`signal-stat ${item.trustScore >= 80 ? 'pos' : item.trustScore >= 65 ? '' : 'neg'}`}>
                      🛡️ {item.trustScore}
                    </span>
                    <span className={`signal-stat ${item.fundingRate < 0 ? 'neg' : 'pos'}`}>
                      Fund: {(item.fundingRate * 100).toFixed(4)}%
                    </span>
                    <span className="signal-stat">
                      OI: {item.oiChange > 0 ? '+' : ''}{item.oiChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
          {!scanner.trustedLongShortLoading && (!scanner.trustedLongShortData?.longs || scanner.trustedLongShortData.longs.length === 0) && (
            <p className="empty">{isRTL ? 'لانگ معتبری یافت نشد' : 'No trusted longs'}</p>
          )}
        </div>
        <div className="signals-section">
          <h4>🔴 {isRTL ? 'شورت معتبر' : 'Trusted Shorts'}</h4>
          {scanner.trustedLongShortLoading && <Loading isRTL={isRTL} />}
          {!scanner.trustedLongShortLoading && scanner.trustedLongShortData && scanner.trustedLongShortData.shorts.length > 0 && (
            <>
              <div className="trust-summary">
                <span>{isRTL ? 'تعداد معتبر:' : 'Trusted:'} {scanner.trustedLongShortData.shorts.length}</span>
                <span>{isRTL ? 'امتیاز کمی:' : 'Min Score:'} 60</span>
              </div>
              {scanner.trustedLongShortData.shorts.map((item, i) => (
                <div key={item.symbol} className={`signal-item short ${item.verified ? 'verified' : ''}`} onClick={() => onSelectSymbol(item.symbol)}>
                  <div className="signal-rank">{i + 1}</div>
                  <div className="signal-info">
                    <span className="signal-symbol">{item.symbol}</span>
                    <span className="signal-badge short">↓ SHORT</span>
                    {item.trustBadges.includes('funding') && (
                      <span className="trust-badge funding">💰</span>
                    )}
                    {item.trustBadges.includes('liquidation') && (
                      <span className="trust-badge liquidation">💀</span>
                    )}
                    {item.trustBadges.includes('oi') && (
                      <span className="trust-badge oi">📊</span>
                    )}
                  </div>
                  <div className="signal-stats">
                    <span className={`signal-stat ${item.trustScore >= 80 ? 'pos' : item.trustScore >= 65 ? '' : 'neg'}`}>
                      🛡️ {item.trustScore}
                    </span>
                    <span className={`signal-stat ${item.fundingRate > 0 ? 'neg' : 'pos'}`}>
                      Fund: {(item.fundingRate * 100).toFixed(4)}%
                    </span>
                    <span className="signal-stat">
                      OI: {item.oiChange < 0 ? '' : '+'}{item.oiChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
          {!scanner.trustedLongShortLoading && (!scanner.trustedLongShortData?.shorts || scanner.trustedLongShortData.shorts.length === 0) && (
            <p className="empty">{isRTL ? 'شورت معتبری یافت نشد' : 'No trusted shorts'}</p>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'doji-candles') {
    return (
      <div>
        <div className="signals-section">
          <h4>🔮 {isRTL ? 'دوجی‌ها' : 'Doji Candles'}</h4>
          {scanner.dojiCandlesLoading && <Loading isRTL={isRTL} />}
          {!scanner.dojiCandlesLoading && scanner.dojiCandlesData && scanner.dojiCandlesData.candles.length > 0 && (
            <>
              <div className="trust-summary">
                <span>{isRTL ? 'دوجی صعودی:' : 'Bullish:'} {scanner.dojiCandlesData.bullishCount}</span>
                <span>{isRTL ? 'دوجی نزولی:' : 'Bearish:'} {scanner.dojiCandlesData.bearishCount}</span>
                <span>{isRTL ? 'بررسی شده:' : 'Scanned:'} {scanner.dojiCandlesData.scanned}</span>
              </div>
              {scanner.dojiCandlesData.candles.map((item, i) => (
                <div key={`${item.symbol}-${item.openTime}`} className={`signal-item ${item.dojiType === 'BULLISH' ? 'long' : 'short'}`} onClick={() => onSelectSymbol(item.symbol)}>
                  <div className="signal-rank">{i + 1}</div>
                  <div className="signal-info">
                    <span className="signal-symbol">{item.symbol}</span>
                    <span className={`signal-badge ${item.dojiType === 'BULLISH' ? 'long' : 'short'}`}>
                      {item.dojiType === 'BULLISH' ? '🟢 DOJI' : '🔴 DOJI'}
                    </span>
                  </div>
                  <div className="signal-stats">
                    <span className="signal-stat">Close: ${item.close.toLocaleString()}</span>
                    <span className="signal-stat">Body: {item.bodyRatio.toFixed(4)}</span>
                    <span className="signal-stat">H-L: ${(item.high - item.low).toFixed(2)}</span>
                    <span className="signal-stat">Vol: {item.volume.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {!scanner.dojiCandlesLoading && (!scanner.dojiCandlesData?.candles || scanner.dojiCandlesData.candles.length === 0) && (
            <p className="empty">{isRTL ? 'دوجی یافت نشد' : 'No doji candles found'}</p>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'funding-volume-squeeze') {
    return (
      <div>
        <div className="signals-section">
          <h4>🔥 {isRTL ? 'فشار فاندینگ + حجم' : 'Funding Volume Squeeze'}</h4>
          {scanner.fundingVolumeSqueezeLoading && <Loading isRTL={isRTL} />}
          {!scanner.fundingVolumeSqueezeLoading && scanner.fundingVolumeSqueezeData && scanner.fundingVolumeSqueezeData.symbols.length > 0 && (
            <>
              <div className="trust-summary">
                <span>{isRTL ? 'تعداد سیگنال‌ها:' : 'Signals:'} {scanner.fundingVolumeSqueezeData.symbols.length}</span>
                <span>{isRTL ? 'بررسی شده:' : 'Scanned:'} {scanner.fundingVolumeSqueezeData.scanned}</span>
              </div>
              {scanner.fundingVolumeSqueezeData.symbols.map((item, i) => (
                <div key={item.symbol} className={`signal-item ${item.isBullish ? 'long' : 'short'} verified`} onClick={() => onSelectSymbol(item.symbol)}>
                  <div className="signal-rank">{i + 1}</div>
                  <div className="signal-info">
                    <span className="signal-symbol">{item.symbol}</span>
                    <span className={`signal-badge ${item.isBullish ? 'long' : 'short'}`}>
                      {item.isBullish ? '🟢 LONG' : '🔴 SHORT'}
                    </span>
                    <span className="trust-badge funding">🔥</span>
                  </div>
                  <div className="signal-stats">
                    <span className="signal-stat pos">🛡️ {item.trustScore}</span>
                    <span className="signal-stat">Fund: {(item.fundingRate * 100).toFixed(4)}%</span>
                    <span className="signal-stat pos">Fund↑: {item.fundingChange.toFixed(1)}%</span>
                    <span className="signal-stat pos">Vol: {item.volumeRatio.toFixed(2)}x</span>
                    <span className="signal-stat">Range: {item.priceChange.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {!scanner.fundingVolumeSqueezeLoading && (!scanner.fundingVolumeSqueezeData?.symbols || scanner.fundingVolumeSqueezeData.symbols.length === 0) && (
            <p className="empty">{isRTL ? 'سیگنال فشار فاندینگ یافت نشد' : 'No squeeze signals'}</p>
          )}
        </div>
      </div>
    );
  }

  if (tab === 'btc-candles') {
    return (
      <div>
        <div className="signals-section">
          <h4>₿ {isRTL ? 'بیتکوین - دنباله کندل' : 'BTC Candle Sequence'}</h4>
          {scanner.btcCandlesLoading && <Loading isRTL={isRTL} />}
          {!scanner.btcCandlesLoading && scanner.btcCandlesData && scanner.btcCandlesData.values.length > 0 && (
            <div className="btc-candle-sequence">
              {scanner.btcCandlesData.values.map((val, i) => (
                <span key={i} className={`candle-value ${val.startsWith('-') ? 'neg' : 'pos'}`}>
                  {val}
                </span>
              ))}
            </div>
          )}
          {!scanner.btcCandlesLoading && (!scanner.btcCandlesData?.values || scanner.btcCandlesData.values.length === 0) && (
            <p className="empty">{isRTL ? 'داده‌ای یافت نشد' : 'No data found'}</p>
          )}
        </div>
      </div>
    );
  }

  const configs: { [K in ScannerTab]?: { data: { longs: ScannerItem[]; shorts: ScannerItem[] } | undefined; loading: boolean; longTitle: string; shortTitle: string; emptyText: string } } = {
      pullbacks: { data: scanner.pullbacksData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.pullbacksLoading, longTitle: isRTL ? 'پولبک صعودی (حمایت)' : 'Bullish Pullback (Support)', shortTitle: isRTL ? 'پولبک نزولی (مقاومت)' : 'Bearish Pullback (Resistance)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No pullbacks found' },
      reapproach: { data: scanner.reapproachData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.reapproachLoading, longTitle: isRTL ? 'برخورد صعودی' : 'Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی' : 'Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No reapproach signals' },
      'weekly-pullbacks': { data: scanner.weeklyPullbacksData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.weeklyPullbacksLoading, longTitle: isRTL ? 'پولبک صعودی هفتگی' : 'Weekly Bullish Pullback', shortTitle: isRTL ? 'پولبک نزولی هفتگی' : 'Weekly Bearish Pullback', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No weekly pullbacks' },
      'weekly-reapproach': { data: scanner.weeklyReapproachData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.weeklyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی هفتگی' : 'Weekly Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی هفتگی' : 'Weekly Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No weekly reapproach' },
      '4h-pullbacks': { data: scanner.pullbacks4hData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.pullbacks4hLoading, longTitle: isRTL ? 'پولبک صعودی 4ساعته' : '4h Bullish Pullback', shortTitle: isRTL ? 'پولبک نزولی 4ساعته' : '4h Bearish Pullback', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No 4h pullbacks' },
      '4h-reapproach': { data: scanner.reapproach4hData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.reapproach4hLoading, longTitle: isRTL ? 'برخورد صعودی 4ساعته' : '4h Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی 4ساعته' : '4h Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No 4h reapproach' },
      'monthly-pullbacks': { data: scanner.monthlyPullbacksData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.monthlyPullbacksLoading, longTitle: isRTL ? 'پولبک صعودی ماهانه' : 'Monthly Bullish Pullback', shortTitle: isRTL ? 'پولبک نزولی ماهانه' : 'Monthly Bearish Pullback', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No monthly pullbacks' },
      'monthly-reapproach': { data: scanner.monthlyReapproachData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.monthlyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی ماهانه' : 'Monthly Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی ماهانه' : 'Monthly Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No monthly reapproach' },
      'ema21-daily-pullback': { data: scanner.ema21DailyPullbackData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.ema21DailyPullbackLoading, longTitle: isRTL ? 'پولبک صعودی روزانه (EMA21)' : 'Daily Bullish Pullback (EMA21)', shortTitle: isRTL ? 'پولبک نزولی روزانه (EMA21)' : 'Daily Bearish Pullback (EMA21)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No daily pullbacks' },
      'ema21-daily-reapproach': { data: scanner.ema21DailyReapproachData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.ema21DailyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی روزانه (EMA21)' : 'Daily Bullish Reapproach (EMA21)', shortTitle: isRTL ? 'برخورد نزولی روزانه (EMA21)' : 'Daily Bearish Reapproach (EMA21)', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No daily reapproach' },
      'ema21-4h-pullback': { data: scanner.ema214hPullbackData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.ema214hPullbackLoading, longTitle: isRTL ? 'پولبک صعودی ۴ساعته (EMA21)' : '4H Bullish Pullback (EMA21)', shortTitle: isRTL ? 'پولبک نزولی ۴ساعته (EMA21)' : '4H Bearish Pullback (EMA21)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No 4H pullbacks' },
      'ema21-4h-reapproach': { data: scanner.ema214hReapproachData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.ema214hReapproachLoading, longTitle: isRTL ? 'برخورد صعودی ۴ساعته (EMA21)' : '4H Bullish Reapproach (EMA21)', shortTitle: isRTL ? 'برخورد نزولی ۴ساعته (EMA21)' : '4H Bearish Reapproach (EMA21)', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No 4H reapproach' },
      'ema21-weekly-pullback': { data: scanner.ema21WeeklyPullbackData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.ema21WeeklyPullbackLoading, longTitle: isRTL ? 'پولبک صعودی هفتگی (EMA21)' : 'Weekly Bullish Pullback (EMA21)', shortTitle: isRTL ? 'پولبک نزولی هفتگی (EMA21)' : 'Weekly Bearish Pullback (EMA21)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No weekly pullbacks' },
      'ema21-weekly-reapproach': { data: scanner.ema21WeeklyReapproachData as unknown as { longs: ScannerItem[]; shorts: ScannerItem[] }, loading: scanner.ema21WeeklyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی هفتگی (EMA21)' : 'Weekly Bullish Reapproach (EMA21)', shortTitle: isRTL ? 'برخورد نزولی هفتگی (EMA21)' : 'Weekly Bearish Reapproach (EMA21)', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No weekly reapproach' },
    };

    const config = configs[tab];
    if (!config) return null;

    return (
      <LongShortTab
        data={config.data}
        isLoading={config.loading}
        isRTL={isRTL}
        scanProgress={scanProgress}
        longTitle={config.longTitle}
        shortTitle={config.shortTitle}
        emptyText={config.emptyText}
        renderItem={(item, index) => (
          <SignalRow
            item={item}
            rank={index + 1}
            isRTL={isRTL}
            risk={undefined}
            watchlisted={scanner.watchlistSymbols.has(item.symbol)}
            onSelectSymbol={onSelectSymbol}
            onOpenNews={handleOpenNews}
            onOpenTradingView={handleOpenTradingView}
            onToggleWatchlist={scanner.handleAddToWatchlist}
          />
        )}
      />
    );
  };

  return (
    <>
      <div className="signals-page">
        <SignalsHeader
          isRTL={isRTL}
          activeTab={scanner.activeTab}
          useReliableSignals={scanner.useReliableSignals}
          isLoading={scanner.isLoading}
          onBack={onBack}
          onRefresh={scanner.handleRefresh}
          onDownload={scanner.handleDownload}
          onToggleReliable={handleToggleReliable}
        />
        <SignalsTabs activeTab={scanner.activeTab} isRTL={isRTL} onTabChange={setActiveTab} />
        <VolumeMarketCapPanel />
        {renderTabContent()}
      </div>
      {newsSymbol && (
        <NewsPanel
          symbol={newsSymbol}
          isRTL={isRTL}
          progress={scanProgress?.current}
          total={scanProgress?.total}
          onClose={() => setNewsSymbol(null)}
        />
      )}
    </>
  );
}
