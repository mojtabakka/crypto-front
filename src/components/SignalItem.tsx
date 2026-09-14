import { RiskBadge } from './RiskBadge';
import { SignalActions } from './SignalActions';
import type { FakeSignalRisk, SymbolSignal } from '../types/market-scanner';

interface SignalItemProps {
  item: SymbolSignal;
  rank?: number;
  isRTL: boolean;
  risk?: FakeSignalRisk | null;
  watchlisted: boolean;
  onSelectSymbol: (symbol: string) => void;
  onOpenNews: (symbol: string) => void;
  onOpenTradingView: (symbol: string) => void;
  onToggleWatchlist: (event: React.MouseEvent<HTMLButtonElement>, symbol: string) => void;
}

export function SignalItem({
  item,
  rank = 0,
  isRTL,
  risk,
  watchlisted,
  onSelectSymbol,
  onOpenNews,
  onOpenTradingView,
  onToggleWatchlist,
}: SignalItemProps) {
  return (
    <div className="signal-item" onClick={() => onSelectSymbol(item.symbol)}>
      <div className="signal-rank">{rank}</div>
      <div className="signal-info">
        <span className="signal-symbol">{item.symbol}</span>
        <span className={`signal-badge ${item.signal.includes('LONG') ? 'long' : 'short'}`}>
          {item.signal === 'STRONG_LONG' || item.signal === 'STRONG_SHORT' ? '🚀' : '📈'} {item.score.toFixed(0)}
        </span>
      </div>
      <div className="signal-stats">
        <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
          {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
        </span>
        <span className="signal-stat">OI {item.oiChange > 0 ? '+' : ''}{item.oiChange.toFixed(1)}%</span>
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
