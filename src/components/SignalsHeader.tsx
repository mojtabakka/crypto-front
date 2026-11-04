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
    <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 backdrop-blur-xl px-4 py-3 border-slate-700/50 border-b">
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← {isRTL ? 'بازگشت' : 'Back'}
      </Button>
      <div className="flex flex-1 items-center gap-2 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-bold text-transparent text-xl">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path d="M3 3v18h18"/>
          <path d="M7 16l4-4 4 4 5-5"/>
        </svg>
        {isRTL ? 'سیگنال‌های بازار' : 'Market Signals'}
      </div>
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
