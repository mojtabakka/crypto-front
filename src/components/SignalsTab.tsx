import { useMemo } from 'react';
import { Loading } from './Loading';
import { SignalItem } from './SignalItem';
import type { FakeSignalScanResult, SymbolSignal } from '../types/market-scanner';

interface SignalsTabProps {
  signalsData: { longs: SymbolSignal[]; shorts: SymbolSignal[] } | undefined;
  reliableSignalsData: { longs: SymbolSignal[]; shorts: SymbolSignal[] } | undefined;
  fakeSignalsData: FakeSignalScanResult | undefined;
  signalsLoading: boolean;
  reliableSignalsLoading: boolean;
  fakeSignalsLoading: boolean;
  useReliableSignals: boolean;
  isRTL: boolean;
  scanProgress?: { current?: number; total?: number } | null;
  onSelectSymbol: (symbol: string) => void;
  onOpenNews: (symbol: string) => void;
  onOpenTradingView: (symbol: string) => void;
  onToggleWatchlist: (event: React.MouseEvent<HTMLButtonElement>, symbol: string) => void;
  watchlistSymbols: Set<string>;
}

export function SignalsTab({
  signalsData,
  reliableSignalsData,
  fakeSignalsData,
  signalsLoading,
  reliableSignalsLoading,
  fakeSignalsLoading,
  useReliableSignals,
  isRTL,
  scanProgress,
  onSelectSymbol,
  onOpenNews,
  onOpenTradingView,
  onToggleWatchlist,
  watchlistSymbols,
}: SignalsTabProps) {
  const activeData = useReliableSignals ? reliableSignalsData : signalsData;

  const fakeRiskMap = useMemo(() => {
    const map = new Map<string, FakeSignalScanResult['risks'][number]>();
    for (const risk of fakeSignalsData?.risks ?? []) {
      map.set(risk.symbol, risk);
    }
    return map;
  }, [fakeSignalsData]);

  const getFakeSignalRisk = (symbol: string) => fakeRiskMap.get(symbol);

  const renderSignalItem = (item: SymbolSignal, index: number) => (
    <SignalItem
      item={item}
      rank={index + 1}
      isRTL={isRTL}
      risk={getFakeSignalRisk(item.symbol)}
      watchlisted={watchlistSymbols.has(item.symbol)}
      onSelectSymbol={onSelectSymbol}
      onOpenNews={onOpenNews}
      onOpenTradingView={onOpenTradingView}
      onToggleWatchlist={onToggleWatchlist}
    />
  );

  return (
    <>
      <div className="fake-risk-legend">
        <span>⚠️ {isRTL ? 'احتمال فیک بودن سیگنال' : 'Fake Signal Probability'}</span>
        <span className="fake-risk-low">🟢 {isRTL ? 'کم' : 'Low'} (&lt;35%)</span>
        <span className="fake-risk-medium">🟡 {isRTL ? 'متوسط' : 'Medium'} (35-65%)</span>
        <span className="fake-risk-high">🔴 {isRTL ? 'زیاد' : 'High'} (&gt;65%)</span>
      </div>
      {(signalsLoading || reliableSignalsLoading || fakeSignalsLoading) && (
        <Loading isRTL={isRTL} progress={scanProgress?.current} total={scanProgress?.total} />
      )}
      {activeData && (
        <>
          {activeData.longs.length > 0 && (
            <div className="signals-section">
              <h4>🟢 {isRTL ? 'فرصت‌های لانگ' : 'Long Opportunities'}</h4>
              {activeData.longs.map((item, i) => renderSignalItem(item, i))}
            </div>
          )}
          {activeData.shorts.length > 0 && (
            <div className="signals-section">
              <h4>🔴 {isRTL ? 'فرصت‌های شورت' : 'Short Opportunities'}</h4>
              {activeData.shorts.map((item, i) => renderSignalItem(item, i))}
            </div>
          )}
          {activeData.longs.length === 0 && activeData.shorts.length === 0 && (
            <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
          )}
        </>
      )}
    </>
  );
}
