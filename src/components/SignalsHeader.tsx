import { Button } from './Button';
import { ExchangeBadge } from './ExchangeBadge';

interface SignalsHeaderProps {
  isRTL: boolean;
  activeTab: string | null;
  useReliableSignals: boolean;
  isLoading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onDownload: () => void;
  onToggleReliable: () => void;
}

export function SignalsHeader({
  isRTL,
  activeTab,
  useReliableSignals,
  isLoading,
  onBack,
  onRefresh,
  onDownload,
  onToggleReliable,
}: SignalsHeaderProps) {
  return (
    <div className="signals-header">
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← {isRTL ? 'بازگشت' : 'Back'}
      </Button>
      <h2>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
          <path d="M3 3v18h18"/>
          <path d="M7 16l4-4 4 4 5-5"/>
        </svg>
        {isRTL ? 'سیگنال‌های بازار' : 'Market Signals'}
      </h2>
      <ExchangeBadge />
      <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
        🔄
      </Button>
      <Button variant="ghost" size="sm" onClick={onDownload} disabled={isLoading || !activeTab} title={isRTL ? 'دانلود CSV' : 'Download CSV'}>
        📥
      </Button>
      <Button
        variant={useReliableSignals ? 'purple' : 'ghost'}
        size="sm"
        onClick={onToggleReliable}
        disabled={activeTab !== 'signals'}
      >
        {useReliableSignals ? '🎯' : '📊'} {useReliableSignals ? (isRTL ? 'EMA50 + لانگ/شورت' : 'EMA50 + Long/Short') : (isRTL ? 'همه سیگنال‌ها' : 'All Signals')}
      </Button>
    </div>
  );
}
