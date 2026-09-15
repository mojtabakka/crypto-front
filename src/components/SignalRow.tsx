import { RiskBadge } from './RiskBadge';
import { SignalActions } from './SignalActions';
import type { FakeSignalRisk, PullbackSignal, ReapproachSignal, SymbolSignal } from '../types/market-scanner';

interface SignalRowProps {
  item: SymbolSignal | PullbackSignal | ReapproachSignal;
  rank?: number;
  isRTL: boolean;
  risk?: FakeSignalRisk | null;
  watchlisted: boolean;
  onSelectSymbol: (symbol: string) => void;
  onOpenNews: (symbol: string) => void;
  onOpenTradingView: (symbol: string) => void;
  onToggleWatchlist: (event: React.MouseEvent<HTMLButtonElement>, symbol: string) => void;
}

export function SignalRow({
  item,
  rank = 0,
  isRTL,
  risk,
  watchlisted,
  onSelectSymbol,
  onOpenNews,
  onOpenTradingView,
  onToggleWatchlist,
}: SignalRowProps) {
  const isPullback = 'maPullback' in item;
  const isReapproach = 'maReapproach' in item;
  const ema50 = (isPullback || isReapproach) ? (item as PullbackSignal | ReapproachSignal).priceVsEma50 : null;

  return (
    <div className="signal-item" onClick={() => onSelectSymbol(item.symbol)}>
      <div className="signal-rank">{rank}</div>
      <div className="signal-info">
        <span className="signal-symbol">{item.symbol}</span>
        {isPullback && (
          <span className="signal-badge pullback">
            {item.maPullback === 'BULLISH_PULLBACK' ? '🟢' : '🔴'} ×{item.maPullbackTouches}
          </span>
        )}
        {isReapproach && (
          <span className="signal-badge reapproach">
            {item.maReapproach === 'BULLISH_REAPPROACH' ? '🔼' : '🔽'} {item.currentDistance !== null ? `${item.currentDistance > 0 ? '+' : ''}${item.currentDistance.toFixed(1)}%` : '-'}
          </span>
        )}
        {!isPullback && !isReapproach && (
          <span className={`signal-badge ${item.signal.includes('LONG') ? 'long' : 'short'}`}>
            {item.signal === 'STRONG_LONG' || item.signal === 'STRONG_SHORT' ? '🚀' : '📈'} {(item as SymbolSignal).score.toFixed(0)}
          </span>
        )}
      </div>
      <div className="signal-stats">
        <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
          {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
        </span>
        {(!isPullback && !isReapproach) && (
          <span className="signal-stat">OI {(item as SymbolSignal).oiChange > 0 ? '+' : ''}{(item as SymbolSignal).oiChange.toFixed(1)}%</span>
        )}
        {(isPullback || isReapproach) && (
          <span className="signal-stat">EMA50: {ema50 !== null ? `${ema50 > 0 ? '+' : ''}${ema50.toFixed(1)}%` : '-'}</span>
        )}
        <RiskBadge risk={risk} isRTL={isRTL} />
      </div>
      <SignalActions
        symbol={item.symbol}
        isWatchlisted={watchlisted}
        isRTL={isRTL}
        onOpenNews={onOpenNews}
        onOpenTradingView={onOpenTradingView}
        onToggleWatchlist={onToggleWatchlist}
      />
    </div>
  );
}
