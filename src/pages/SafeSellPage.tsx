import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useI18n } from '../i18n';
import { useExchange } from '../contexts/ExchangeContext';
import { useStoredFuturesSymbols } from '../hooks/useFuturesSymbols';
import { Button } from '../components/Button';
import { ExchangeBadge } from '../components/ExchangeBadge';
import { Loading } from '../components/Loading';
import './SafeSellPage.css';

interface SafeSellSignal {
  id: number;
  symbol: string;
  exchange: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  priceChange1h: number;
  priceChange4h: number;
  volumeChange1h: number;
  oiChange1h: number;
  fundingRate: number;
  longLiquidationChange: number;
  shortLiquidationChange: number;
  safeSellScore: number;
  currentPrice: number;
  detectedAt: number;
  reasons: string | null;
  createdAt: string;
}

interface SafeSellSocketEvent {
  symbol: string;
  exchange: string;
  direction: string;
  severity: string;
  safeSellScore: number;
  priceChange1h: number;
  priceChange4h: number;
  currentPrice: number;
  reasons: string[];
  message: string;
  timestamp: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  EXTREME: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
};

const SEVERITY_LABELS: Record<string, { fa: string; en: string }> = {
  EXTREME: { fa: 'شدید', en: 'Extreme' },
  HIGH: { fa: 'بالا', en: 'High' },
  MEDIUM: { fa: 'متوسط', en: 'Medium' },
  LOW: { fa: 'پایین', en: 'Low' },
};

const parseReasons = (reasons: string | null): string[] => {
  if (!reasons) return [];
  try {
    return JSON.parse(reasons);
  } catch {
    return [reasons];
  }
};

export function SafeSellPage() {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const [socketEvents, setSocketEvents] = useState<SafeSellSocketEvent[]>([]);
  const [scanning, setScanning] = useState(false);
  const { data: symbolsData } = useStoredFuturesSymbols(exchange);

  const symbols = useMemo(() => {
    if (!symbolsData || !('symbols' in symbolsData)) return [];
    return symbolsData.symbols
      .filter((s) => s.status === 'TRADING')
      .map((s) => s.symbol)
      .sort();
  }, [symbolsData]);

  const filteredSymbols = useMemo(() => {
    if (!symbolInput) return symbols.slice(0, 100);
    return symbols.filter((s) =>
      s.toLowerCase().includes(symbolInput.toLowerCase()),
    );
  }, [symbols, symbolInput]);

  const { data, isLoading, refetch } = useQuery<SafeSellSignal[]>({
    queryKey: ['safe-sell-signals', selectedSymbol, exchange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSymbol) params.set('symbol', selectedSymbol);
      params.set('exchange', exchange);
      const res = await fetch(`http://localhost:3000/safe-sell/signals?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch safe-sell signals');
      return res.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 300000,
  });

  useEffect(() => {
    refetch();
  }, [selectedSymbol, exchange, refetch]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`http://localhost:3000/safe-sell/scan?exchange=${exchange}`);
      if (res.ok) {
        await refetch();
      }
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    handleScan();
  }, [exchange]);

  useEffect(() => {
    const socket: Socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('subscribe', { channel: 'safeSellSignal' });
    });

    socket.on('safeSellSignal', (data: SafeSellSocketEvent) => {
      setSocketEvents((prev) => [data, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatPercent = (value: number, decimals = 2) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${Number(value).toFixed(decimals)}%`;
  };

  const directionLabel = (dir: string) => {
    if (dir === 'LONG') return isRTL ? 'لانگ' : 'Long';
    if (dir === 'SHORT') return isRTL ? 'شورت' : 'Short';
    return isRTL ? 'خنثی' : 'Neutral';
  };

  const directionColor = (dir: string) => {
    if (dir === 'LONG') return '#22c55e';
    if (dir === 'SHORT') return '#ef4444';
    return '#94a3b8';
  };

  return (
    <div className="safe-sell-page">
      <div className="safe-sell-header">
        <h1>{isRTL ? '⚠️ فروش ایمن پس از پامپ' : '⚠️ Post-Pump Safe Sell'}</h1>
        <div className="safe-sell-controls">
          <div className="symbol-search">
            <input
              type="text"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
              placeholder={isRTL ? 'جستجوی نماد...' : 'Search symbol...'}
              className="safe-sell-input"
            />
            {symbolInput && filteredSymbols.length > 0 && (
              <ul className="symbol-dropdown">
                {filteredSymbols.slice(0, 20).map((sym) => (
                  <li
                    key={sym}
                    className={`symbol-dropdown-item ${selectedSymbol === sym ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedSymbol(sym);
                      setSymbolInput(sym);
                    }}
                  >
                    {sym}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ExchangeBadge />
          <Button variant="purple" size="md" onClick={handleScan} disabled={scanning}>
            {scanning
              ? isRTL
                ? '⏳ در حال اسکن...'
                : '⏳ Scanning...'
              : isRTL
                ? '🔍 اسکن دستی'
                : '🔍 Manual Scan'}
          </Button>
          <Button variant="purple" size="md" onClick={() => refetch()}>
            {isRTL ? '🔄 بروزرسانی' : '🔄 Refresh'}
          </Button>
        </div>
      </div>

      <div className="safe-sell-summary">
        <div className="summary-card">
          <h3>{isRTL ? 'روند کلی' : 'Overall Trend'}</h3>
          {data && data.length > 0 ? (
            <div className="trend-indicator">
              <span className="trend-label">{isRTL ? 'کدام سمت رو به افزایش است؟' : 'Which side is increasing?'}</span>
              <div className="trend-bars">
                <div className="trend-bar long-bar">
                  <span className="trend-label-text">🟢 {isRTL ? 'لانگ' : 'Long'}</span>
                  <div className="trend-fill" style={{ width: `${Math.min(100, data.filter(s => s.direction === 'LONG').length * 10)}%` }} />
                </div>
                <div className="trend-bar short-bar">
                  <span className="trend-label-text">🔴 {isRTL ? 'شورت' : 'Short'}</span>
                  <div className="trend-fill" style={{ width: `${Math.min(100, data.filter(s => s.direction === 'SHORT').length * 10)}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="placeholder-text">{isRTL ? 'داده‌ای برای نمایش وجود ندارد' : 'No data available'}</p>
          )}
        </div>
      </div>

      <div className="safe-sell-live">
        <h2>{isRTL ? '📡 سیگنال‌های زنده' : '📡 Live Signals'}</h2>
        {socketEvents.length === 0 && (
          <p className="placeholder-text">{isRTL ? 'منتظر سیگنال‌های زنده...' : 'Waiting for live signals...'}</p>
        )}
        <div className="live-events">
          {socketEvents.map((evt, i) => (
            <div key={i} className="live-event-card" style={{ borderLeftColor: SEVERITY_COLORS[evt.severity] || '#6b7280' }}>
              <div className="live-event-header">
                <span className="live-symbol">{evt.symbol}</span>
                <span className="live-direction" style={{ color: directionColor(evt.direction) }}>
                  {directionLabel(evt.direction)}
                </span>
                <span className="live-severity" style={{ background: `${SEVERITY_COLORS[evt.severity] || '#6b7280'}20`, color: SEVERITY_COLORS[evt.severity] || '#6b7280' }}>
                  {SEVERITY_LABELS[evt.severity]?.[isRTL ? 'fa' : 'en'] ?? evt.severity}
                </span>
              </div>
              <div className="live-score">Score: {evt.safeSellScore}/100</div>
              <div className="live-changes">
                <span>1h: {formatPercent(evt.priceChange1h)}</span>
                <span>4h: {formatPercent(evt.priceChange4h)}</span>
                <span>Price: ${formatPrice(evt.currentPrice)}</span>
              </div>
              <div className="live-reasons">
                {evt.reasons.slice(0, 4).map((reason, i) => (
                  <div key={i} className="live-reason">{reason}</div>
                ))}
              </div>
              <div className="live-time">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="safe-sell-grid">
        <h2>{isRTL ? '📊 سیگنال‌هایsafe-sell' : '📊 Safe Sell Signals'}</h2>
        {isLoading && <Loading isRTL={isRTL} />}
        {data && data.length === 0 && !isLoading && (
          <div className="empty-state">
            <p>{isRTL ? 'سیگنال فروش ایمنی یافت نشد' : 'No safe-sell signals found'}</p>
            <p className="empty-sub">{isRTL ? 'اسکن بعدی به صورت خودکار انجام می‌شود' : 'Next scan will run automatically'}</p>
          </div>
        )}
        <div className="safe-sell-cards">
          {data?.map((signal) => {
            const reasons = parseReasons(signal.reasons);
            const color = SEVERITY_COLORS[signal.severity] || '#6b7280';

            return (
              <div key={signal.id} className="safe-sell-card" style={{ borderLeftColor: color }}>
                <div className="safe-sell-card-header">
                  <span className="safe-sell-symbol">{signal.symbol}</span>
                  <span className="safe-sell-direction" style={{ color: directionColor(signal.direction) }}>
                    {directionLabel(signal.direction)}
                  </span>
                  <span className="safe-sell-severity" style={{ background: `${color}20`, color }}>
                    {SEVERITY_LABELS[signal.severity]?.[isRTL ? 'fa' : 'en'] ?? signal.severity}
                  </span>
                </div>

                <div className="safe-sell-score-bar">
                  <div className="safe-sell-score-fill" style={{ width: `${signal.safeSellScore}%`, background: color }} />
                  <span className="safe-sell-score-text">{signal.safeSellScore.toFixed(0)}/100</span>
                </div>

                <div className="safe-sell-price">${formatPrice(signal.currentPrice)}</div>

                <div className="safe-sell-changes">
                  <div style={{ color: signal.priceChange1h >= 0 ? '#22c55e' : '#ef4444' }}>
                    <span>1h:</span> <strong>{formatPercent(signal.priceChange1h)}</strong>
                  </div>
                  <div style={{ color: signal.priceChange4h >= 0 ? '#22c55e' : '#ef4444' }}>
                    <span>4h:</span> <strong>{formatPercent(signal.priceChange4h)}</strong>
                  </div>
                  <div style={{ color: signal.volumeChange1h >= 0 ? '#22c55e' : '#ef4444' }}>
                    <span>Vol:</span> <strong>{formatPercent(signal.volumeChange1h)}</strong>
                  </div>
                  <div style={{ color: signal.oiChange1h >= 0 ? '#22c55e' : '#ef4444' }}>
                    <span>OI:</span> <strong>{formatPercent(signal.oiChange1h)}</strong>
                  </div>
                </div>

                <div className="safe-sell-liquidation">
                  <div className={signal.longLiquidationChange > signal.shortLiquidationChange ? 'liquidation-active' : ''}>
                    {isRTL ? 'لانگ لیکویید' : 'Long Liq'}: {signal.longLiquidationChange.toFixed(0)}
                  </div>
                  <div className={signal.shortLiquidationChange > signal.longLiquidationChange ? 'liquidation-active' : ''}>
                    {isRTL ? 'شورت لیکویید' : 'Short Liq'}: {signal.shortLiquidationChange.toFixed(0)}
                  </div>
                </div>

                <div className="safe-sell-funding">
                  {isRTL ? 'فاندینگ' : 'Funding'}: {(signal.fundingRate * 100).toFixed(4)}%
                </div>

                {reasons.length > 0 && (
                  <div className="safe-sell-reasons">
                    {reasons.slice(0, 4).map((reason, i) => (
                      <div key={i} className="safe-sell-reason">{reason}</div>
                    ))}
                  </div>
                )}

                <div className="safe-sell-card-footer">
                  <span className="safe-sell-exchange">{signal.exchange}</span>
                  <span className="safe-sell-time">
                    {new Date(signal.detectedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
