import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import './ExecutorPage.css';

const API_BASE = 'http://localhost:3000';

interface Settings {
  enabled: boolean;
  mode: string;
  symbols: string;
  riskPerTrade: number;
  leverage: number;
  startingEquity: number;
  atrStopMultiple: number;
  atrTargetMultiple: number;
  minSignalScore: number;
  trailingStop: boolean;
  breakEven: boolean;
  maxConcurrentPositions: number;
}

interface Position {
  id: number;
  symbol: string;
  side: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  mode: string;
  signal: string;
  entryPrice: number;
  quantity: number;
  leverage: number;
  currentStopLoss: number;
  takeProfit: number;
  exitPrice: number | null;
  exitReason: string | null;
  pnlPercent: number | null;
  pnlUsd: number | null;
  openedAt: number;
  durationMs: number;
}

interface Performance {
  username: string;
  mode: string;
  startingEquity: number;
  currentEquity: number;
  totalTrades: number;
  openPositions: number;
  winRate: number;
  profitFactor: number;
  netPnlUsd: number;
  netPnlPercent: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number | null;
  worstTrade: number | null;
  byExitReason: Record<string, number>;
  bySignal: Record<string, number>;
}

interface Candidate {
  symbol: string;
  side: 'LONG' | 'SHORT';
  score: number;
  signal: string;
  reason: string;
}

const REASON_LABELS: Record<string, { fa: string; en: string }> = {
  STOP_LOSS: { fa: 'حد ضرر', en: 'Stop loss' },
  TAKE_PROFIT: { fa: 'حد سود', en: 'Take profit' },
  BREAKEVEN_STOP: { fa: 'خروج بدون ریسک', en: 'Break-even' },
  MANUAL_CLOSE: { fa: 'خروج دستی', en: 'Manual close' },
};

export function ExecutorPage({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();
  const { t, isRTL } = useI18n();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<Settings | null>(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const { data: settings } = useQuery({
    queryKey: ['executor-settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/executor/settings`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to load settings');
      return (await res.json()) as Settings;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (settings && !draft) setDraft(settings);
  }, [settings, draft]);

  const { data: performance } = useQuery({
    queryKey: ['executor-performance'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/executor/performance`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to load performance');
      return (await res.json()) as Performance;
    },
    enabled: !!token,
    refetchInterval: 60_000,
  });

  const { data: positions } = useQuery({
    queryKey: ['executor-positions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/executor/positions`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to load positions');
      return (await res.json()) as Position[];
    },
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const { data: candidates } = useQuery({
    queryKey: ['executor-candidates'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/executor/candidates`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to load candidates');
      return (await res.json()) as Candidate[];
    },
    enabled: !!token,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['executor-settings'] });
    queryClient.invalidateQueries({ queryKey: ['executor-performance'] });
    queryClient.invalidateQueries({ queryKey: ['executor-positions'] });
    queryClient.invalidateQueries({ queryKey: ['executor-candidates'] });
  };

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const res = await fetch(`${API_BASE}/executor/settings`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      return res.json();
    },
    onSuccess: (data: Settings) => {
      setDraft(data);
      invalidateAll();
    },
  });

  const tickMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/executor/tick`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Tick failed');
      return res.json();
    },
    onSuccess: invalidateAll,
  });

  const closeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/executor/positions/${id}/close`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Close failed');
      return res.json();
    },
    onSuccess: invalidateAll,
  });

  const closeAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/executor/close-all`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Close all failed');
      return res.json();
    },
    onSuccess: invalidateAll,
  });

  const openPositions = positions?.filter((p) => p.status === 'OPEN') ?? [];
  const closedPositions = positions?.filter((p) => p.status === 'CLOSED') ?? [];

  const fmtTime = (ms: number) =>
    isRTL
      ? new Date(ms).toLocaleString('fa-IR')
      : new Date(ms).toLocaleString();

  const fmtDuration = (ms: number) => {
    const hours = Math.floor(ms / 3_600_000);
    const days = Math.floor(hours / 24);
    if (days > 0) return isRTL ? `${days} روز` : `${days}d`;
    if (hours > 0) return isRTL ? `${hours} ساعت` : `${hours}h`;
    return isRTL ? `${Math.floor(ms / 60_000)} دقیقه` : `${Math.floor(ms / 60_000)}m`;
  };

  const pct = (v: number) => `${(Number(v) * 100).toFixed(1)}%`;

  return (
    <div className="executor-page">
      <div className="executor-header">
        <div className="executor-title-row">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t.controls.back}
          </Button>
          <h1>{t.executor.title}</h1>
          <span className="paper-badge">{t.executor.paperMode}</span>
        </div>

        <div className="executor-actions">
          <Button
            variant="primary"
            onClick={() => tickMutation.mutate()}
            disabled={tickMutation.isPending}
          >
            {tickMutation.isPending ? t.common.loading : t.executor.runCycle}
          </Button>

          {openPositions.length > 0 && (
            <Button
              variant="danger"
              onClick={() => closeAllMutation.mutate()}
              disabled={closeAllMutation.isPending}
            >
              {t.executor.closeAll}
            </Button>
          )}
        </div>
      </div>

      <div className="paper-notice">
        <strong>{t.executor.paperTitle}</strong>
        <p>{t.executor.paperBody}</p>
      </div>

      {performance && (
        <div className="perf-grid">
          <div className="perf-card">
            <span className="perf-label">{t.executor.equity}</span>
            <span className="perf-value">{Number(performance.currentEquity).toFixed(2)}</span>
            <span className="perf-sub">
              {t.executor.from} {Number(performance.startingEquity).toFixed(0)}
            </span>
          </div>

          <div className="perf-card">
            <span className="perf-label">{t.executor.netPnl}</span>
            <span
              className="perf-value"
              style={{ color: performance.netPnlUsd >= 0 ? '#22c55e' : '#ef4444' }}
            >
              {performance.netPnlUsd >= 0 ? '+' : ''}
              {Number(performance.netPnlUsd).toFixed(2)}
            </span>
            <span className="perf-sub" style={{ color: performance.netPnlPercent >= 0 ? '#22c55e' : '#ef4444' }}>
              {pct(performance.netPnlPercent)}
            </span>
          </div>

          <div className="perf-card">
            <span className="perf-label">{t.executor.winRate}</span>
            <span className="perf-value">{pct(performance.winRate)}</span>
            <span className="perf-sub">
              {performance.totalTrades} {t.backtest.trades}
            </span>
          </div>

          <div className="perf-card">
            <span className="perf-label">{t.backtest.profitFactor}</span>
            <span
              className="perf-value"
              style={{ color: performance.profitFactor > 1 ? '#22c55e' : '#ef4444' }}
            >
              {Number(performance.profitFactor).toFixed(2)}
            </span>
            <span className="perf-sub">{t.executor.open}: {performance.openPositions}</span>
          </div>
        </div>
      )}

      <div className="executor-grid">
        <div className="settings-panel">
          <h3>{t.executor.settings}</h3>

          {draft && (
            <div className="settings-form">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) => {
                    const next = { ...draft, enabled: e.target.checked };
                    setDraft(next);
                    saveMutation.mutate({ enabled: e.target.checked });
                  }}
                />
                <span>{t.executor.enable}</span>
              </label>

              <div className="field">
                <label>{t.executor.symbols}</label>
                <input
                  type="text"
                  value={draft.symbols}
                  onChange={(e) => setDraft({ ...draft, symbols: e.target.value })}
                  onBlur={() => saveMutation.mutate({ symbols: draft.symbols })}
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>
                    {t.executor.riskPerTrade} ({(Number(draft.riskPerTrade) * 100).toFixed(1)}%)
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.001"
                    max="0.1"
                    value={draft.riskPerTrade}
                    onChange={(e) =>
                      setDraft({ ...draft, riskPerTrade: Number(e.target.value) })
                    }
                    onBlur={() => saveMutation.mutate({ riskPerTrade: draft.riskPerTrade })}
                  />
                </div>

                <div className="field">
                  <label>{t.executor.leverage}</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={draft.leverage}
                    onChange={(e) => setDraft({ ...draft, leverage: Number(e.target.value) })}
                    onBlur={() => saveMutation.mutate({ leverage: draft.leverage })}
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>{t.executor.minScore}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={draft.minSignalScore}
                    onChange={(e) =>
                      setDraft({ ...draft, minSignalScore: Number(e.target.value) })
                    }
                    onBlur={() =>
                      saveMutation.mutate({ minSignalScore: draft.minSignalScore })
                    }
                  />
                </div>

                <div className="field">
                  <label>{t.executor.maxPositions}</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={draft.maxConcurrentPositions}
                    onChange={(e) =>
                      setDraft({ ...draft, maxConcurrentPositions: Number(e.target.value) })
                    }
                    onBlur={() =>
                      saveMutation.mutate({ maxConcurrentPositions: draft.maxConcurrentPositions })
                    }
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>{t.executor.stopATR} (ATR)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={draft.atrStopMultiple}
                    onChange={(e) =>
                      setDraft({ ...draft, atrStopMultiple: Number(e.target.value) })
                    }
                    onBlur={() => saveMutation.mutate({ atrStopMultiple: draft.atrStopMultiple })}
                  />
                </div>

                <div className="field">
                  <label>{t.executor.targetATR} (ATR)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={draft.atrTargetMultiple}
                    onChange={(e) =>
                      setDraft({ ...draft, atrTargetMultiple: Number(e.target.value) })
                    }
                    onBlur={() => saveMutation.mutate({ atrTargetMultiple: draft.atrTargetMultiple })}
                  />
                </div>
              </div>

              <div className="field">
                <label>{t.executor.startingEquity}</label>
                <input
                  type="number"
                  step="100"
                  value={draft.startingEquity}
                  onChange={(e) =>
                    setDraft({ ...draft, startingEquity: Number(e.target.value) })
                  }
                  onBlur={() => saveMutation.mutate({ startingEquity: draft.startingEquity })}
                />
              </div>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={draft.trailingStop}
                  onChange={(e) => {
                    const next = { ...draft, trailingStop: e.target.checked };
                    setDraft(next);
                    saveMutation.mutate({ trailingStop: e.target.checked });
                  }}
                />
                <span>{t.executor.trailing}</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={draft.breakEven}
                  onChange={(e) => {
                    const next = { ...draft, breakEven: e.target.checked };
                    setDraft(next);
                    saveMutation.mutate({ breakEven: e.target.checked });
                  }}
                />
                <span>{t.executor.breakEven}</span>
              </label>
            </div>
          )}
        </div>

        <div className="positions-panel">
          <h3>
            {t.executor.openPositions} ({openPositions.length})
          </h3>

          {openPositions.length === 0 ? (
            <p className="panel-empty">{t.executor.noOpen}</p>
          ) : (
            <div className="position-list">
              {openPositions.map((position) => (
                <div key={position.id} className="position-card">
                  <div className="position-top">
                    <span className="position-symbol">{position.symbol}</span>
                    <span className={`side-chip ${position.side.toLowerCase()}`}>
                      {position.side}
                    </span>
                    <span className="position-leverage">{position.leverage}x</span>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => closeMutation.mutate(position.id)}
                      disabled={closeMutation.isPending}
                    >
                      {t.executor.close}
                    </Button>
                  </div>

                  <div className="position-details">
                    <span>
                      {t.backtest.entry}: {Number(position.entryPrice).toFixed(4)}
                    </span>
                    <span>
                      {t.backtest.exit}: {Number(position.currentStopLoss).toFixed(4)}
                    </span>
                    <span>
                      TP: {Number(position.takeProfit).toFixed(4)}
                    </span>
                    <span>
                      Qty: {Number(position.quantity).toFixed(6)}
                    </span>
                  </div>

                  <div className="position-foot">
                    <span className="position-signal">{position.signal}</span>
                    <span className="position-time">
                      {fmtDuration(position.durationMs)} · {fmtTime(position.openedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="second-heading">{t.executor.signals}</h3>

          {!candidates || candidates.length === 0 ? (
            <p className="panel-empty">{t.executor.noSignals}</p>
          ) : (
            <div className="candidate-list">
              {candidates.map((candidate) => (
                <div key={candidate.symbol} className="candidate-row">
                  <span className="candidate-symbol">{candidate.symbol}</span>
                  <span className={`side-chip ${candidate.side.toLowerCase()}`}>
                    {candidate.side}
                  </span>
                  <span className="candidate-score">{candidate.score.toFixed(0)}</span>
                  <span className="candidate-signal">{candidate.signal}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="closed-section">
        <h3>{t.executor.closedPositions}</h3>

        {closedPositions.length === 0 ? (
          <p className="panel-empty">{t.executor.noClosed}</p>
        ) : (
          <div className="closed-table-wrap">
            <table className="closed-table">
              <thead>
                <tr>
                  <th>{t.correlation.symbol}</th>
                  <th>{t.backtest.side}</th>
                  <th>{t.backtest.entry}</th>
                  <th>{t.backtest.exit}</th>
                  <th>{t.backtest.result}</th>
                  <th>{t.executor.pnlUsd}</th>
                  <th>{t.backtest.reason}</th>
                  <th>{t.executor.duration}</th>
                </tr>
              </thead>
              <tbody>
                {closedPositions.map((position) => (
                  <tr key={position.id}>
                    <td className="symbol-cell">{position.symbol}</td>
                    <td>
                      <span className={`side-chip ${position.side.toLowerCase()}`}>
                        {position.side}
                      </span>
                    </td>
                    <td>{Number(position.entryPrice).toFixed(4)}</td>
                    <td>{Number(position.exitPrice ?? 0).toFixed(4)}</td>
                    <td
                      style={{
                        color: (position.pnlPercent ?? 0) > 0 ? '#22c55e' : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {Number(position.pnlPercent ?? 0).toFixed(2)}%
                    </td>
                    <td
                      style={{
                        color: (position.pnlUsd ?? 0) > 0 ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {Number(position.pnlUsd ?? 0).toFixed(2)}
                    </td>
                    <td className="reason-cell">
                      {REASON_LABELS[position.exitReason ?? '']?.[isRTL ? 'fa' : 'en'] ??
                        position.exitReason}
                    </td>
                    <td>{fmtDuration(position.durationMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}