import { useState, useCallback } from 'react';
import { useI18n } from '../i18n';
import { useTVLData } from '../hooks/useTVLData';
import { Loading } from '../components/Loading';
import { ExchangeBadge } from '../components/ExchangeBadge';
import type { TVLAnalysisResult, TVLTab, TVLTabConfig } from '../types/tvl-analysis';
import './TVLAnalysisPage.css';

const TABS: TVLTabConfig[] = [
  { key: 'top-opportunities', label: 'Top Opportunities', icon: '🎯' },
  { key: 'top-by-tvl', label: 'Highest TVL', icon: '💰' },
  { key: 'top-by-growth', label: 'Fastest Growing', icon: '📈' },
  { key: 'undervalued', label: 'Undervalued', icon: '💎' },
  { key: 'blue-chips', label: 'Blue Chips', icon: '🏛️' },
  { key: 'multi-chain', label: 'Multi-Chain', icon: '🌐' },
];

function TVLTabButton({ 
  tab, 
  isActive, 
  onClick, 
  isRTL 
}: { 
  tab: TVLTabConfig; 
  isActive: boolean; 
  onClick: () => void; 
  isRTL: boolean;
}) {
  return (
    <button
      className={`tvl-tab-btn ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ '--tab-color': getTabColor(tab.key) } as React.CSSProperties}
    >
      <span className="tab-icon">{tab.icon}</span>
      <span className="tab-label">{isRTL ? getPersianLabel(tab.key) : tab.label}</span>
    </button>
  );
}

function getTabColor(key: TVLTab): string {
  const colors: Record<TVLTab, string> = {
    'top-opportunities': '#f59e0b',
    'top-by-tvl': '#22c55e',
    'top-by-growth': '#3b82f6',
    'undervalued': '#8b5cf6',
    'blue-chips': '#06b6d4',
    'multi-chain': '#ec4899',
  };
  return colors[key] || '#64748b';
}

function getPersianLabel(key: TVLTab): string {
  const labels: Record<TVLTab, string> = {
    'top-opportunities': 'بهترین فرصت‌ها',
    'top-by-tvl': 'بیشترین TVL',
    'top-by-growth': 'سریع‌ترین رشد',
    'undervalued': 'زیرارزش',
    'blue-chips': 'بلوچيپ‌ها',
    'multi-chain': 'مولتی-چین',
  };
  return labels[key] || key;
}

function SignalBadge({ signal }: { signal: TVLAnalysisResult['signals'][0] }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    HIGH_TVL: { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.4)', text: '#4ade80' },
    GROWING_TVL: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.4)', text: '#60a5fa' },
    LOW_MCAP_TVL_RATIO: { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.4)', text: '#a78bfa' },
    STABLE_TVL: { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.4)', text: '#22d3ee' },
    MULTI_CHAIN: { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.4)', text: '#f472b6' },
    BLUE_CHIP: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24' },
  };

  const style = colors[signal.type] || { bg: '#334155', border: '#475569', text: '#94a3b8' };
  const strengthColors = {
    STRONG: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80' },
    MODERATE: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.5)', text: '#fbbf24' },
    WEAK: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171' },
  };
  const s = strengthColors[signal.strength];

  return (
    <span
      className="signal-badge"
      style={{
        background: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
      title={signal.description}
    >
      {signal.type.replace(/_/g, ' ')}
      <span
        className="signal-strength"
        style={{
          background: s.bg,
          borderColor: s.border,
          color: s.text,
        }}
      >
        {signal.strength}
      </span>
    </span>
  );
}

function TVLCard({ item, rank, isRTL }: { item: TVLAnalysisResult; rank: number; isRTL: boolean }) {
  const { protocol, tvlScore, mcapToTvlRatio, signals } = item;
  const tvlB = protocol.tvl / 1e9;
  const tvlM = protocol.tvl / 1e6;
  const change7d = protocol.change_7d || 0;
  const change1d = protocol.change_1d || 0;

  const formatPercent = (val: number) => {
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(2)}%`;
  };

  return (
    <div className="tvl-card">
      <div className="tvl-card-header">
        <div className="tvl-rank">#{rank}</div>
        <div className="tvl-info">
          <div className="tvl-symbol-row">
            <span className="tvl-symbol">{protocol.symbol}</span>
            <span className="tvl-name">{protocol.name}</span>
          </div>
          <div className="tvl-meta">
            <span className="tvl-category">{protocol.category}</span>
            <span className="tvl-chain">{protocol.chain}</span>
            <span className="tvl-chains-count">{protocol.chains.length} chains</span>
          </div>
        </div>
        <div className="tvl-score" style={{ borderColor: getTabColor('top-opportunities') }}>
          <span className="score-value">{tvlScore}</span>
          <span className="score-label">{isRTL ? 'امتیاز TVL' : 'TVL Score'}</span>
        </div>
      </div>

      <div className="tvl-stats">
        <div className="stat">
          <span className="stat-value tvl-value">${tvlB >= 1 ? tvlB.toFixed(2) + 'B' : tvlM.toFixed(0) + 'M'}</span>
          <span className="stat-label">{isRTL ? 'TVL' : 'TVL'}</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ color: change7d >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatPercent(change7d)}
          </span>
          <span className="stat-label">{isRTL ? 'تغییر ۷ روزه' : '7d Change'}</span>
        </div>
        <div className="stat">
          <span className="stat-value" style={{ color: change1d >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatPercent(change1d)}
          </span>
          <span className="stat-label">{isRTL ? 'تغییر روزانه' : '1d Change'}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{mcapToTvlRatio ? mcapToTvlRatio.toFixed(2) : '-'}</span>
          <span className="stat-label">{isRTL ? 'Mcap/TVL' : 'Mcap/TVL'}</span>
        </div>
      </div>

      <div className="tvl-signals">
        {signals.slice(0, 4).map((signal, i) => (
          <SignalBadge key={i} signal={signal} />
        ))}
        {signals.length > 4 && (
          <span className="signal-more">
            +{signals.length - 4} {isRTL ? 'سیگنال دیگر' : 'more signals'}
          </span>
        )}
      </div>
    </div>
  );
}

export function TVLAnalysisPage() {
  const { isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<TVLTab | null>('top-opportunities');

  const { data, isLoading, isError, error, refetch, scanData } = useTVLData(activeTab);

  const handleTabChange = useCallback((tab: TVLTab) => {
    setActiveTab(tab);
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading && !data.length) {
    return <Loading isRTL={isRTL} />;
  }

  if (isError) {
    const errorMsg = error instanceof Error ? error.message : (isRTL ? 'خطا در بارگذاری داده‌ها' : 'Failed to load TVL data');
    return (
      <div className="tvl-page" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="page-header">
          <h1>{isRTL ? 'تحلیل TVL پروتکل‌ها' : 'TVL Protocol Analysis'}</h1>
          <ExchangeBadge />
        </div>
        <div className="error-state">
          <p>{errorMsg}</p>
          <button onClick={handleRetry} className="retry-btn">
            {isRTL ? 'تلاش مجدد' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tvl-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-header">
        <h1>{isRTL ? 'تحلیل TVL پروتکل‌ها' : 'TVL Protocol Analysis'}</h1>
        <div className="header-info">
          <ExchangeBadge />
          {scanData && (
            <span className="last-update">
              {isRTL ? 'پروتکل‌های تحلیل شده:' : 'Protocols analyzed:'}{' '}
              {scanData.analyzed} / {scanData.totalProtocols}
            </span>
          )}
          <button onClick={handleRetry} className="refresh-btn" title={isRTL ? 'بروزرسانی' : 'Refresh'}>
            🔄
          </button>
        </div>
      </div>

      <div className="tvl-tabs">
        {TABS.map((tab) => (
          <TVLTabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
            isRTL={isRTL}
          />
        ))}
      </div>

      {isLoading && data.length > 0 && <Loading isRTL={isRTL} compact />}

      <div className="tvl-grid">
        {data.length === 0 ? (
          <div className="empty-state">
            <p>{isRTL ? 'داده‌ای یافت نشد' : 'No data found'}</p>
          </div>
        ) : (
          data.map((item, i) => (
            <TVLCard key={item.protocol.id} item={item} rank={i + 1} isRTL={isRTL} />
          ))
        )}
      </div>

      {data.length > 0 && (
        <div className="tvl-footer">
          <p>{isRTL ? 'منبع:' : 'Source:'} <a href="https://defillama.com" target="_blank" rel="noopener noreferrer">DefiLlama</a></p>
          <p>{isRTL ? 'داده‌ها هر ۵ دقیقه بروزرسانی می‌شوند' : 'Data updated every 5 minutes'}</p>
        </div>
      )}
    </div>
  );
}