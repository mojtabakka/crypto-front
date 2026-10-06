import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import { CorrelationMatrix } from '../components/CorrelationMatrix';
import './CorrelationPage.css';

const API_BASE = 'http://localhost:3000';

const REGIME_COLORS: Record<string, string> = {
  LOCKED: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#eab308',
  LOW: '#22c55e',
  NEGATIVE: '#3b82f6',
};

const REGIME_LABELS: Record<string, { fa: string; en: string }> = {
  LOCKED: { fa: 'قفل‌شده', en: 'Locked' },
  HIGH: { fa: 'بالا', en: 'High' },
  MODERATE: { fa: 'متوسط', en: 'Moderate' },
  LOW: { fa: 'پایین', en: 'Low' },
  NEGATIVE: { fa: 'منفی', en: 'Negative' },
};

const ROTATION_LABELS: Record<string, { fa: string; en: string }> = {
  DECOUPLING: { fa: 'در حال جدا شدن', en: 'Decoupling' },
  COUPLING: { fa: 'در حال همبسته شدن', en: 'Coupling' },
  STABLE: { fa: 'پایدار', en: 'Stable' },
};

interface Insight {
  symbol: string;
  correlation: number;
  smoothedCorrelation: number;
  previousCorrelation: number;
  delta: number;
  regime: string;
  rotation: string;
}

interface Insights {
  benchmark: string;
  averageCorrelation: number;
  insights: Insight[];
  concentrationRisk: { level: string; symbols: string[]; message: string };
  diversificationOpportunity: { level: string; symbols: string[]; message: string };
  rotation: { active: boolean; signals: Insight[]; message: string };
}

interface MatrixData {
  symbols: string[];
  matrix: number[][];
  clusters: { name: string; symbols: string[] }[];
  averageCorrelation: number;
  benchmark: string;
  interval: string;
  observations: number;
  timestamp: string;
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

export function CorrelationPage({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();
  const { t, isRTL } = useI18n();
  const [interval, setInterval] = useState('4h');
  const [days, setDays] = useState('30');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const { data: matrix, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['correlation-matrix'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/correlation/matrix`, {
        headers: authHeaders,
      });

      if (!res.ok) throw new Error('Failed to load correlation matrix');
      return (await res.json()) as MatrixData;
    },
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });

  const { data: insights, refetch: refetchInsights } = useQuery({
    queryKey: ['correlation-insights'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/correlation/insights`, {
        headers: authHeaders,
      });

      if (!res.ok) throw new Error('Failed to load insights');
      return (await res.json()) as Insights;
    },
    enabled: !!token,
    staleTime: 30 * 60 * 1000,
  });

  const handleRecompute = async () => {
    await fetch(
      `${API_BASE}/correlation/analyze?interval=${interval}&days=${days}`,
      { method: 'POST', headers: authHeaders },
    );
    await refetch();
    await refetchInsights();
  };

  const hasMatrix = matrix && Array.isArray(matrix.symbols) && matrix.symbols.length >= 2;

  return (
    <div className="correlation-page">
      <div className="correlation-header">
        <div className="correlation-title-row">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t.controls.back}
          </Button>
          <h1>{t.correlation.title}</h1>
        </div>

        <div className="correlation-controls">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="correlation-select"
          >
            {['1h', '4h', '1d'].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="correlation-select"
          >
            {['14', '30', '60', '90'].map((d) => (
              <option key={d} value={d}>
                {isRTL ? `${d} روز` : `${d} days`}
              </option>
            ))}
          </select>

          <Button variant="primary" onClick={handleRecompute} disabled={isFetching}>
            {isFetching ? t.common.loading : t.correlation.recompute}
          </Button>
        </div>
      </div>

      {isError && (
        <div className="correlation-error">
          {(error as Error)?.message ?? t.error.generic}
        </div>
      )}

      {isLoading ? (
        <div className="correlation-loading">{t.common.loading}</div>
      ) : !hasMatrix ? (
        <div className="correlation-empty">
          <p>{t.correlation.empty}</p>
          <Button variant="primary" onClick={handleRecompute}>
            {t.correlation.analyzeNow}
          </Button>
        </div>
      ) : (
        <>
          <div className="correlation-summary">
            <div className="summary-card">
              <span className="summary-label">{t.correlation.benchmark}</span>
              <span className="summary-value">{matrix!.benchmark ?? insights?.benchmark}</span>
            </div>

            <div className="summary-card">
              <span className="summary-label">{t.correlation.avgCorrelation}</span>
              <span className="summary-value">
                {Number(matrix!.averageCorrelation).toFixed(2)}
              </span>
            </div>

            <div className="summary-card">
              <span className="summary-label">{t.correlation.assets}</span>
              <span className="summary-value">{matrix!.symbols.length}</span>
            </div>

            <div className="summary-card">
              <span className="summary-label">{t.correlation.observations}</span>
              <span className="summary-value">{matrix!.observations}</span>
            </div>
          </div>

          {insights && (
            <>
              <div
                className="verdict-card"
                style={{
                  borderColor: RISK_COLORS[insights.concentrationRisk.level] ?? '#666',
                }}
              >
                <div className="verdict-header">
                  <h3>{t.correlation.concentrationRisk}</h3>
                  <span
                    className="verdict-badge"
                    style={{
                      color: RISK_COLORS[insights.concentrationRisk.level],
                      borderColor: RISK_COLORS[insights.concentrationRisk.level],
                    }}
                  >
                    {insights.concentrationRisk.level}
                  </span>
                </div>
                <p>{insights.concentrationRisk.message}</p>
                {insights.concentrationRisk.symbols.length > 0 && (
                  <div className="verdict-symbols">
                    {insights.concentrationRisk.symbols.map((s) => (
                      <span key={s} className="symbol-chip danger">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="verdict-card" style={{ borderColor: '#22c55e' }}>
                <div className="verdict-header">
                  <h3>{t.correlation.diversification}</h3>
                  <span
                    className="verdict-badge"
                    style={{
                      color: insights.diversificationOpportunity.level === 'HIGH' ? '#22c55e' : '#888',
                      borderColor:
                        insights.diversificationOpportunity.level === 'HIGH' ? '#22c55e' : '#888',
                    }}
                  >
                    {insights.diversificationOpportunity.level}
                  </span>
                </div>
                <p>{insights.diversificationOpportunity.message}</p>
                {insights.diversificationOpportunity.symbols.length > 0 && (
                  <div className="verdict-symbols">
                    {insights.diversificationOpportunity.symbols.map((s) => (
                      <span key={s} className="symbol-chip good">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="verdict-card"
                style={{ borderColor: insights.rotation.active ? '#3b82f6' : '#444' }}
              >
                <div className="verdict-header">
                  <h3>{t.correlation.rotation}</h3>
                  <span
                    className="verdict-badge"
                    style={{
                      color: insights.rotation.active ? '#3b82f6' : '#888',
                      borderColor: insights.rotation.active ? '#3b82f6' : '#888',
                    }}
                  >
                    {insights.rotation.active ? t.correlation.active : t.correlation.none}
                  </span>
                </div>
                <p>{insights.rotation.message}</p>

                {insights.rotation.signals.length > 0 && (
                  <div className="rotation-list">
                    {insights.rotation.signals.map((signal) => (
                      <div key={signal.symbol} className="rotation-item">
                        <span className="rotation-symbol">{signal.symbol}</span>
                        <span className="rotation-numbers">
                          {Number(signal.previousCorrelation).toFixed(2)} →{' '}
                          {Number(signal.smoothedCorrelation).toFixed(2)}
                        </span>
                        <span
                          className="rotation-badge"
                          style={{
                            color:
                              signal.rotation === 'DECOUPLING' ? '#3b82f6' : '#f97316',
                          }}
                        >
                          {ROTATION_LABELS[signal.rotation]?.[isRTL ? 'fa' : 'en'] ??
                            signal.rotation}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="matrix-section">
            <h2>{t.correlation.matrix}</h2>
            <CorrelationMatrix
              symbols={matrix!.symbols}
              matrix={matrix!.matrix}
              benchmark={insights?.benchmark ?? matrix!.benchmark}
            />
          </div>

          {insights && insights.insights.length > 0 && (
            <div className="matrix-section">
              <h2>{t.correlation.details}</h2>
              <div className="insights-table-wrap">
                <table className="insights-table">
                  <thead>
                    <tr>
                      <th>{t.correlation.symbol}</th>
                      <th>{t.correlation.correlation}</th>
                      <th>{t.correlation.smoothed}</th>
                      <th>{t.correlation.change}</th>
                      <th>{t.correlation.regime}</th>
                      <th>{t.correlation.state}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.insights.map((item) => (
                      <tr key={item.symbol}>
                        <td className="symbol-cell">{item.symbol}</td>
                        <td>
                          <span
                            className="corr-value"
                            style={{ color: REGIME_COLORS[item.regime] ?? '#ccc' }}
                          >
                            {Number(item.correlation).toFixed(2)}
                          </span>
                        </td>
                        <td>{Number(item.smoothedCorrelation).toFixed(2)}</td>
                        <td>
                          <span
                            className="delta"
                            style={{
                              color:
                                Number(item.delta) < 0 ? '#3b82f6' : Number(item.delta) > 0 ? '#f97316' : '#888',
                            }}
                          >
                            {Number(item.delta) > 0 ? '+' : ''}
                            {Number(item.delta).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span
                            className="regime-chip"
                            style={{
                              color: REGIME_COLORS[item.regime] ?? '#ccc',
                              borderColor: REGIME_COLORS[item.regime] ?? '#666',
                            }}
                          >
                            {REGIME_LABELS[item.regime]?.[isRTL ? 'fa' : 'en'] ??
                              item.regime}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              color: item.rotation === 'STABLE' ? '#888' : '#3b82f6',
                            }}
                          >
                            {ROTATION_LABELS[item.rotation]?.[isRTL ? 'fa' : 'en'] ??
                              item.rotation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}