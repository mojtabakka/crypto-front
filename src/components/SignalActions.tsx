import { Button } from './Button';

interface SignalActionsProps {
  symbol: string;
  isWatchlisted: boolean;
  isRTL: boolean;
  onOpenNews: (symbol: string) => void;
  onOpenTradingView: (symbol: string) => void;
  onToggleWatchlist: (event: React.MouseEvent<HTMLButtonElement>, symbol: string) => void;
}

export function SignalActions({
  symbol,
  isWatchlisted,
  isRTL,
  onOpenNews,
  onOpenTradingView,
  onToggleWatchlist,
}: SignalActionsProps) {
  return (
    <div className="signal-actions">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => { e.stopPropagation(); onOpenNews(symbol); }}
        title={isRTL ? 'اخبار' : 'News'}
      >
        📰
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => { e.stopPropagation(); onOpenTradingView(symbol); }}
        title="TradingView"
      >
        📉
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => onToggleWatchlist(e, symbol)}
      >
        {isWatchlisted ? '⭐' : '☆'}
      </Button>
    </div>
  );
}
