import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import { ExchangeBadge } from '../components/ExchangeBadge';
import { Loading } from '../components/Loading';
import { useExchange } from '../contexts/ExchangeContext';
import './PumpDetectorPage.css';

interface PreMoveSignal {
  id: number;
  symbol: string;
  type: 'PUMP' | 'DUMP';
  strength: 'WEAK' | 'MODERATE' | 'STRONG' | 'EXTREME';
  confidence: number | string;
  currentPrice: number | string | null;
  longLiqValue: number | string;
  shortLiqValue: number | string;
  longLiqCount: number | string;
  shortLiqCount: number | string;
  imbalanceRatio: number | string;
  windowMs: number;
  detectedAt: number;
  reasons: string | null;
  createdAt: string;
}

const STRENGTH_COLORS: Record<string, string> = {
  EXTREME: '#dc2626',
  STRONG: '#ea580c',
  MODERATE: '#d97706',
  WEAK: '#3b82f6',
};

const STRENGTH_LABELS: Record<string, { fa: string; en: string }> = {
  EXTREME: { fa: 'شدید', en: 'Extreme' },
  STRONG: { fa: 'قوی', en: 'Strong' },
  MODERATE: { fa: 'متوسط', en: 'Moderate' },
  WEAK: { fa: 'ضعیف', en: 'Weak' },
};

const TYPE_LABELS: Record<string, { fa: string; en: string }> = {
  PUMP: { fa: '📈 احتمال پامپ', en: '📈 Pre-pump' },
  DUMP: { fa: '📉 احتمال دامپ', en: '📉 Pre-dump' },
};

const parseReasons = (reasons: string | null): string[] => {
  if (!reasons) return [];
  try {
    return JSON.parse(reasons);
  } catch {
    return [reasons];
  }
};

const toNumber = (val: number | string | null): number => {
  if (val === null) return 0;
  if (typeof val === 'string') return parseFloat(val);
  return val;
};

const formatWindow = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h`;
  return `${minutes}m`;
};

export function PreMoveDetectorPage() {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();
  const [typeFilter, setTypeFilter] = useState<'all' | 'PUMP' | 'DUMP'>('all');
  const [scanning, setScanning] = useState(false);

  const isBinance = exchange === 'BINANCE';

  const { data, isLoading, refetch } = useQuery<PreMoveSignal[]>({
    queryKey: ['pre-move-signals', typeFilter, exchange],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/pre-move-detector/signals?minConfidence=40&limit=80');
      if (!res.ok) throw new Error('Failed to fetch pre-move signals');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('http://localhost:3000/pre-move-detector/scan');
      if (res.ok) {
        await refetch();
      }
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    handleScan();
  }, []);

  const filteredSignals = (data ?? []).filter((sig) => {
    if (typeFilter === 'all') return true;
    return sig.type === typeFilter;
  });

  const pumpCount = (data ?? []).filter((s) => s.type === 'PUMP').length;
  const dumpCount = (data ?? []).filter((s) => s.type === 'DUMP').length;

  const formatPrice = (price: number | string | null) => {
    if (price === null) return '—';
    const p = toNumber(price);
    if (p >= 1) return p.toFixed(4);
    return p.toFixed(6);
  };

  return (
    <div className="pump-page">
      <div className="pump-header">
        <div>
          <h1 className="pump-title">
            {isRTL ? '🎯 ردیاب حرکت قریب‌الوقوع' : '🎯 Pre-Move Detector'}
          </h1>
          <p className="pump-subtitle">
            {isRTL
              ? 'هشدار قبل از پامپ/دامپ بر اساس لیکوئیدیشن‌های یک‌طرفه'
              : 'Early warning before pumps/dumps based on one-sided liquidations'}
          </p>
        </div>
        <ExchangeBadge />
        <Button
          variant="purple"
          size="md"
          onClick={handleScan}
          disabled={scanning || !isBinance}
        >
          {scanning
            ? isRTL ? '⏳ در حال اسکن...' : '⏳ Scanning...'
            : isRTL ? '🔍 اسکن دستی' : '🔍 Manual Scan'}
        </Button>
      </div>

      {!isBinance && (
        <div className="empty-state" style={{ background: '#422006', borderColor: '#f59e0b' }}>
          <p style={{ color: '#fbbf24' }}>
            ⚠️{' '}
            {isRTL
              ? `Pre-Move Detector فقط از لیکوئیدیشن‌های Binance پشتیبانی می‌کند. لطفاً صرافی Binance را انتخاب کنید.`
              : `Pre-Move Detector only supports Binance liquidations. Please switch to Binance exchange.`}
          </p>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card stat-pump">
          <div className="stat-label">{isRTL ? 'سیگنال پامپ' : 'Pump signals'}</div>
          <div className="stat-value">{pumpCount}</div>
        </div>
        <div className="stat-card stat-dump">
          <div className="stat-label">{isRTL ? 'سیگنال دامپ' : 'Dump signals'}</div>
          <div className="stat-value">{dumpCount}</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-label">{isRTL ? 'کل سیگنال‌ها' : 'Total signals'}</div>
          <div className="stat-value">{(data ?? []).length}</div>
        </div>
      </div>

      <div className="severity-filters">
        <button
          className={`severity-btn ${typeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTypeFilter('all')}
        >
          {isRTL ? 'همه' : 'All'}
        </button>
        <button
          className={`severity-btn ${typeFilter === 'PUMP' ? 'active' : ''}`}
          onClick={() => setTypeFilter('PUMP')}
          style={typeFilter === 'PUMP' ? { borderColor: '#22c55e', background: '#16a34a' } : {}}
        >
          {isRTL ? 'احتمال پامپ 📈' : 'Pre-pump 📈'}
        </button>
        <button
          className={`severity-btn ${typeFilter === 'DUMP' ? 'active' : ''}`}
          onClick={() => setTypeFilter('DUMP')}
          style={typeFilter === 'DUMP' ? { borderColor: '#ef4444', background: '#dc2626' } : {}}
        >
          {isRTL ? 'احتمال دامپ 📉' : 'Pre-dump 📉'}
        </button>
      </div>

      {isLoading && <Loading isRTL={isRTL} />}

      {data && data.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>
            {isRTL
              ? '✅ هیچ سیگنال حرکت قریب‌الوقوعی یافت نشد'
              : '✅ No pre-move signals detected'}
          </p>
          <p className="empty-sub">
            {isRTL
              ? 'بازار آرام است. اسکن هر 30 ثانیه تکرار می‌شود.'
              : 'Market is calm. Scanning every 30 seconds.'}
          </p>
        </div>
      )}

      <div className="pump-grid">
        {filteredSignals.map((signal) => {
          const reasons = parseReasons(signal.reasons);
          const color = STRENGTH_COLORS[signal.strength] ?? '#6b7280';
          const isPump = signal.type === 'PUMP';

          return (
            <div
              key={signal.id}
              className="pump-card"
              style={{ borderLeftColor: color }}
            >
              <div className="pump-card-header">
                <div>
                  <span className="pump-symbol">{signal.symbol}</span>
                  <div className="signal-type-label" style={{ color: isPump ? '#22c55e' : '#ef4444' }}>
                    {TYPE_LABELS[signal.type]?.[isRTL ? 'fa' : 'en']}
                  </div>
                </div>
                <span
                  className="pump-severity"
                  style={{ background: `${color}20`, color }}
                >
                  {STRENGTH_LABELS[signal.strength]?.[isRTL ? 'fa' : 'en'] ??
                    signal.strength}
                </span>
              </div>

              <div className="pump-score-bar">
                <div
                  className="pump-score-fill"
                  style={{
                    width: `${toNumber(signal.confidence)}%`,
                    background: color,
                  }}
                />
                <span className="pump-score-text">
                  {toNumber(signal.confidence).toFixed(0)}% confidence
                </span>
              </div>

              <div className="pump-price">
                ${formatPrice(signal.currentPrice)}
              </div>

              <div className="liq-stats">
                <div className="liq-stat liq-long" style={{ flex: toNumber(signal.longLiqValue) || 1 }}>
                  <span className="liq-side">{isRTL ? 'لانگ لیکوئید' : 'Long liq'}</span>
                  <strong>${(toNumber(signal.longLiqValue) / 1000).toFixed(0)}k</strong>
                  <span className="liq-count">{toNumber(signal.longLiqCount)} orders</span>
                </div>
                <div className="liq-stat liq-short" style={{ flex: toNumber(signal.shortLiqValue) || 1 }}>
                  <span className="liq-side">{isRTL ? 'شورت لیکوئید' : 'Short liq'}</span>
                  <strong>${(toNumber(signal.shortLiqValue) / 1000).toFixed(0)}k</strong>
                  <span className="liq-count">{toNumber(signal.shortLiqCount)} orders</span>
                </div>
              </div>

              <div className="signal-meta">
                <span className="meta-item">
                  ⚖️ {toNumber(signal.imbalanceRatio).toFixed(1)}x
                </span>
                <span className="meta-item">
                  ⏱ {formatWindow(signal.windowMs)}
                </span>
              </div>

              {reasons.length > 0 && (
                <div className="pump-reasons">
                  {reasons.slice(0, 4).map((reason, i) => (
                    <div key={i} className="pump-reason">
                      {reason}
                    </div>
                  ))}
                </div>
              )}

              <div className="pump-card-footer">
                <span className="pump-time">
                  {new Date(signal.detectedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
