import { useState, useCallback } from 'react';
import { useExchange } from '../contexts/ExchangeContext';
import { useI18n } from '../i18n';
import { useScanProgress } from '../hooks/useScanProgress';
import { useScannerData } from '../hooks/useScannerData';
import type { AboveEmaSignal, ScannerTab, SymbolSignal } from '../types/market-scanner';
import { AboveEmaTab } from '../components/AboveEmaTab';
import { NewsPanel } from '../components/NewsPanel';
import { SignalsHeader } from '../components/SignalsHeader';
import { SignalsTab } from '../components/SignalsTab';
import { SignalsTabs } from '../components/SignalsTabs';
import { SignalItem } from '../components/SignalItem';
import { LongShortTab } from '../components/LongShortTab';
import './SignalsPage.css';

interface SignalsPageProps {
  onSelectSymbol: (symbol: string) => void;
  onBack: () => void;
}

type LongShortItem = { symbol: string; priceChange: number; oiChange: number };

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

  const renderTabContent = () => {
    const tab = scanner.activeTab;
    if (!tab) return null;

    if (tab === 'signals') {
      return (
        <SignalsTab
          signalsData={scanner.signalsData}
          reliableSignalsData={scanner.reliableSignalsData}
          fakeSignalsData={scanner.fakeSignalsData}
          signalsLoading={scanner.signalsLoading}
          reliableSignalsLoading={scanner.reliableSignalsLoading}
          fakeSignalsLoading={scanner.fakeSignalsLoading}
          useReliableSignals={scanner.useReliableSignals}
          isRTL={isRTL}
          scanProgress={scanProgress}
          onSelectSymbol={onSelectSymbol}
          onOpenNews={handleOpenNews}
          onOpenTradingView={handleOpenTradingView}
          onToggleWatchlist={scanner.handleAddToWatchlist}
          watchlistSymbols={scanner.watchlistSymbols}
        />
      );
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
          data={data as unknown as { symbols: LongShortItem[] }}
          isLoading={loading}
          isRTL={isRTL}
          scanProgress={scanProgress}
          title={isRTL ? 'بالای EMA50' : 'Above EMA'}
          emptyText={isRTL ? 'ارزی بالای EMA50 یافت نشد' : 'No symbols above EMA50'}
          renderItem={(item, index) => (
            <div key={(item as SymbolSignal).symbol} className="signal-item pullback-bull" onClick={() => onSelectSymbol((item as SymbolSignal).symbol)}>
              <div className="signal-rank">{index + 1}</div>
              <div className="signal-info">
                <span className="signal-symbol">{(item as SymbolSignal).symbol}</span>
                <span className="signal-badge long">
                  ↑ {(item as SymbolSignal).priceVsEma50 !== null ? `+${(item as SymbolSignal).priceVsEma50.toFixed(1)}%` : '-'}
                </span>
              </div>
              <div className="signal-stats">
                <span className={`signal-stat ${(item as SymbolSignal).priceChange >= 0 ? 'pos' : 'neg'}`}>
                  {(item as SymbolSignal).priceChange > 0 ? '+' : ''}{(item as SymbolSignal).priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="signal-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenNews((item as SymbolSignal).symbol); }} title={isRTL ? 'اخبار' : 'News'}>📰</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleOpenTradingView((item as SymbolSignal).symbol); }} title="TradingView">📉</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => scanner.handleAddToWatchlist(e, (item as SymbolSignal).symbol)}>
                  {scanner.watchlistSymbols.has((item as SymbolSignal).symbol) ? '⭐' : '☆'}
                </button>
              </div>
            </div>
          )}
        />
      );
    }

    const configs: { [K in ScannerTab]?: { data: { longs: LongShortItem[]; shorts: LongShortItem[] } | undefined; loading: boolean; longTitle: string; shortTitle: string; emptyText: string } } = {
      pullbacks: { data: scanner.pullbacksData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.pullbacksLoading, longTitle: isRTL ? 'پولبک صعودی (حمایت)' : 'Bullish Pullback (Support)', shortTitle: isRTL ? 'پولبک نزولی (مقاومت)' : 'Bearish Pullback (Resistance)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No pullbacks found' },
      reapproach: { data: scanner.reapproachData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.reapproachLoading, longTitle: isRTL ? 'برخورد صعودی' : 'Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی' : 'Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No reapproach signals' },
      'weekly-pullbacks': { data: scanner.weeklyPullbacksData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.weeklyPullbacksLoading, longTitle: isRTL ? 'پولبک صعودی هفتگی' : 'Weekly Bullish Pullback', shortTitle: isRTL ? 'پولبک نزولی هفتگی' : 'Weekly Bearish Pullback', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No weekly pullbacks' },
      'weekly-reapproach': { data: scanner.weeklyReapproachData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.weeklyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی هفتگی' : 'Weekly Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی هفتگی' : 'Weekly Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No weekly reapproach' },
      '4h-pullbacks': { data: scanner.pullbacks4hData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.pullbacks4hLoading, longTitle: isRTL ? 'پولبک صعودی 4ساعته' : '4h Bullish Pullback', shortTitle: isRTL ? 'پولبک نزولی 4ساعته' : '4h Bearish Pullback', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No 4h pullbacks' },
      '4h-reapproach': { data: scanner.reapproach4hData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.reapproach4hLoading, longTitle: isRTL ? 'برخورد صعودی 4ساعته' : '4h Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی 4ساعته' : '4h Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No 4h reapproach' },
      'monthly-pullbacks': { data: scanner.monthlyPullbacksData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.monthlyPullbacksLoading, longTitle: isRTL ? 'پولبک صعودی ماهانه' : 'Monthly Bullish Pullback', shortTitle: isRTL ? 'پولبک نزولی ماهانه' : 'Monthly Bearish Pullback', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No monthly pullbacks' },
      'monthly-reapproach': { data: scanner.monthlyReapproachData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.monthlyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی ماهانه' : 'Monthly Bullish Reapproach', shortTitle: isRTL ? 'برخورد نزولی ماهانه' : 'Monthly Bearish Reapproach', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No monthly reapproach' },
      'ema21-daily-pullback': { data: scanner.ema21DailyPullbackData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.ema21DailyPullbackLoading, longTitle: isRTL ? 'پولبک صعودی روزانه (EMA21)' : 'Daily Bullish Pullback (EMA21)', shortTitle: isRTL ? 'پولبک نزولی روزانه (EMA21)' : 'Daily Bearish Pullback (EMA21)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No daily pullbacks' },
      'ema21-daily-reapproach': { data: scanner.ema21DailyReapproachData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.ema21DailyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی روزانه (EMA21)' : 'Daily Bullish Reapproach (EMA21)', shortTitle: isRTL ? 'برخورد نزولی روزانه (EMA21)' : 'Daily Bearish Reapproach (EMA21)', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No daily reapproach' },
      'ema21-4h-pullback': { data: scanner.ema214hPullbackData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.ema214hPullbackLoading, longTitle: isRTL ? 'پولبک صعودی ۴ساعته (EMA21)' : '4H Bullish Pullback (EMA21)', shortTitle: isRTL ? 'پولبک نزولی ۴ساعته (EMA21)' : '4H Bearish Pullback (EMA21)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No 4H pullbacks' },
      'ema21-4h-reapproach': { data: scanner.ema214hReapproachData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.ema214hReapproachLoading, longTitle: isRTL ? 'برخورد صعودی ۴ساعته (EMA21)' : '4H Bullish Reapproach (EMA21)', shortTitle: isRTL ? 'برخورد نزولی ۴ساعته (EMA21)' : '4H Bearish Reapproach (EMA21)', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No 4H reapproach' },
      'ema21-weekly-pullback': { data: scanner.ema21WeeklyPullbackData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.ema21WeeklyPullbackLoading, longTitle: isRTL ? 'پولبک صعودی هفتگی (EMA21)' : 'Weekly Bullish Pullback (EMA21)', shortTitle: isRTL ? 'پولبک نزولی هفتگی (EMA21)' : 'Weekly Bearish Pullback (EMA21)', emptyText: isRTL ? 'پولبکی یافت نشد' : 'No weekly pullbacks' },
      'ema21-weekly-reapproach': { data: scanner.ema21WeeklyReapproachData as unknown as { longs: LongShortItem[]; shorts: LongShortItem[] }, loading: scanner.ema21WeeklyReapproachLoading, longTitle: isRTL ? 'برخورد صعودی هفتگی (EMA21)' : 'Weekly Bullish Reapproach (EMA21)', shortTitle: isRTL ? 'برخورد نزولی هفتگی (EMA21)' : 'Weekly Bearish Reapproach (EMA21)', emptyText: isRTL ? 'سیگنالی یافت نشد' : 'No weekly reapproach' },
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
          <SignalItem
            item={item as SymbolSignal}
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
      {renderTabContent()}
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
