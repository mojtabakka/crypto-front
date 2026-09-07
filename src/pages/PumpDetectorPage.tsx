import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { useExchange } from '../contexts/ExchangeContext';
import './PumpDetectorPage.css';

interface PumpAlert {
  id: number;
  symbol: string;
  exchange: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  priceChange1h: number | string;
  priceChange4h: number | string;
  priceChange24h: number | string;
  volumeChange1h: number | string;
  volumeChange24h: number | string;
  pumpScore: number | string;
  currentPrice: number | string;
  detectedAt: number;
  reasons: string | null;
  createdAt: string;
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

const toNumber = (val: number | string): number => {
  if (typeof val === 'string') return parseFloat(val);
  return val;
};

export function PumpDetectorPage() {
  const { isRTL } = useI18n();
  const { exchange } = useExchange();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [scanning, setScanning] = useState(false);

  const { data, isLoading, refetch } = useQuery<PumpAlert[]>({
    queryKey: ['pump-alerts', severityFilter, exchange],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/pump-detector/alerts?exchange=${exchange}&minScore=25`);
      if (!res.ok) throw new Error('Failed to fetch pump alerts');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`http://localhost:3000/pump-detector/scan?exchange=${exchange}`);
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

  const filteredAlerts = (data ?? []).filter((alert) => {
    if (severityFilter === 'all') return true;
    return alert.severity === severityFilter;
  });

  const formatPrice = (price: number | string) => {
    const p = toNumber(price);
    if (p >= 1) return p.toFixed(4);
    return p.toFixed(6);
  };

  return (
    <div className="pump-page">
      <div className="pump-header">
        <h1 className="pump-title">
          {isRTL ? '🚨 ردیاب پامپ' : '🚨 Pump Detector'}
        </h1>
        <Button
          variant="purple"
          size="md"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning
            ? isRTL
              ? '⏳ در حال اسکن...'
              : '⏳ Scanning...'
            : isRTL
              ? '🔍 اسکن دستی'
              : '🔍 Manual Scan'}
        </Button>
      </div>

      <div className="severity-filters">
        {['all', 'EXTREME', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
          <button
            key={sev}
            className={`severity-btn ${severityFilter === sev ? 'active' : ''}`}
            onClick={() => setSeverityFilter(sev)}
            style={
              severityFilter === sev && sev !== 'all'
                ? { borderColor: SEVERITY_COLORS[sev] }
                : {}
            }
          >
            {sev === 'all'
              ? isRTL
                ? 'همه'
                : 'All'
              : (SEVERITY_LABELS[sev]?.[isRTL ? 'fa' : 'en'] ?? sev)}
          </button>
        ))}
      </div>

      {isLoading && <Loading isRTL={isRTL} />}

      {data && data.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>
            {isRTL
              ? '✅ هیچ پامپ مشکوکی یافت نشد'
              : '✅ No suspicious pumps detected'}
          </p>
          <p className="empty-sub">
            {isRTL
              ? 'اسکن بعدی به صورت خودکار انجام می‌شود'
              : 'Next scan will run automatically'}
          </p>
        </div>
      )}

      <div className="pump-grid">
        {filteredAlerts.map((alert) => {
          const reasons = parseReasons(alert.reasons);
          const color = SEVERITY_COLORS[alert.severity] ?? '#6b7280';

          return (
            <div
              key={alert.id}
              className="pump-card"
              style={{ borderLeftColor: color }}
            >
              <div className="pump-card-header">
                <span className="pump-symbol">{alert.symbol}</span>
                <span
                  className="pump-severity"
                  style={{ background: `${color}20`, color }}
                >
                  {SEVERITY_LABELS[alert.severity]?.[isRTL ? 'fa' : 'en'] ??
                    alert.severity}
                </span>
              </div>

              <div className="pump-score-bar">
                <div
                  className="pump-score-fill"
                  style={{
                    width: `${toNumber(alert.pumpScore)}%`,
                    background: color,
                  }}
                />
                <span className="pump-score-text">
                  {toNumber(alert.pumpScore).toFixed(0)}/100
                </span>
              </div>

              <div className="pump-price">
                ${formatPrice(alert.currentPrice)}
              </div>

              <div className="pump-changes">
                <div
                  className="pump-change"
                  style={{
                    color: toNumber(alert.priceChange1h) >= 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  <span>1h:</span>
                  <strong>
                    {toNumber(alert.priceChange1h) >= 0 ? '+' : ''}
                    {toNumber(alert.priceChange1h).toFixed(2)}%
                  </strong>
                </div>
                <div
                  className="pump-change"
                  style={{
                    color: toNumber(alert.priceChange4h) >= 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  <span>4h:</span>
                  <strong>
                    {toNumber(alert.priceChange4h) >= 0 ? '+' : ''}
                    {toNumber(alert.priceChange4h).toFixed(2)}%
                  </strong>
                </div>
                <div
                  className="pump-change"
                  style={{
                    color: toNumber(alert.priceChange24h) >= 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  <span>24h:</span>
                  <strong>
                    {toNumber(alert.priceChange24h) >= 0 ? '+' : ''}
                    {toNumber(alert.priceChange24h).toFixed(2)}%
                  </strong>
                </div>
                <div
                  className="pump-change"
                  style={{
                    color: toNumber(alert.volumeChange1h) >= 0 ? '#22c55e' : '#ef4444',
                  }}
                >
                  <span>Vol 1h:</span>
                  <strong>
                    {toNumber(alert.volumeChange1h) >= 0 ? '+' : ''}
                    {toNumber(alert.volumeChange1h).toFixed(0)}%
                  </strong>
                </div>
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
                <span className="pump-exchange">{alert.exchange}</span>
                <span className="pump-time">
                  {new Date(alert.detectedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
