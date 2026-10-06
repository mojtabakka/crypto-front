import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import './BacktestPage.css';

const API_BASE = 'http://localhost:3000';

const VERDICT_STYLES: Record<string, { color: string; fa: string; en: string }> = {
  VIABLE: { color: '#22c55e', fa: 'قابل استفاده', en: 'Viable' },
  NOT_VIABLE: { color: '#ef4444', fa: 'غیرقابل استفاده', en: 'Not viable' },
  INSUFFICIENT_DATA: { color: '#f59e0b', fa: 'داده ناکافی', en: 'Insufficient data' },
};

const REASON_LABELS: Record<string, { fa: string; en: string }> = {
  STOP_LOSS: { fa: 'حد ضرر', en: 'Stop loss' },
  TAKE_PROFIT: { fa: 'حد سود', en: 'Take profit' },
  TIME_EXIT: { fa: 'خروج زمانی', en: 'Time exit' },
};

interface Trade {
  entryTime: number;
  exitTime: number;
  side: string;
  entryPrice: number;
  exitPrice: number;
  pnlPercent: number;
  rMultiple: number;
  exitReason: string;
  barsHeld: number;
}

interface Result {
  symbol: string;
  interval: string;
  strategy: string;
  barsTested: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  netReturn: number;
  buyAndHoldReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  averageRMultiple: number;
  averageHoldMs: number;
  verdict: string;
  notes: string;
  trades: Trade[];
  fees: number;
  startingEquity: number;
  endingEquity: number;
}

const DEFAULTS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
];

export function BacktestPage({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();
  const { t, isRTL } = useI18n();

  const [interval, setInterval] = useState('4h');
  const [lookbackDays, setLookbackDays] = useState('180');
  const [selected, setSelected] = useState<string[]>(DEFAULTS);
  const [customSymbol, setCustomSymbol] = useState('');

  const [result, setResult] = useState<Result | null>(null);
  const [batch, setBatch] = useState<any>(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const { data: history } = useQuery({
    queryKey: ['backtest-history'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/backtest/history?limit=15`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load history');
      return res.json();
    },
    enabled: !!token,
  });

  const toggleSymbol = (symbol: string) => {
    setSelected((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol],
    );
  };

  const addCustom = () => {
    const symbol = customSymbol.trim().toUpperCase();
    if (!symbol || selected.includes(symbol)) return;
    setSelected((prev) => [...prev, symbol]);
    setCustomSymbol('');
  };

  const runSingle = async (symbol: string) => {
    setIsRunning(true);
    setError('');
    setBatch(null);

    try {
      const res = await fetch(`${API_BASE}/backtest/run`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          symbol,
          interval,
          lookbackDays: Number(lookbackDays),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message ?? 'Backtest failed');

      setResult(data);
    } catch (err: any) {
      setError(err.message ?? t.error.generic);
      setResult(null);
    } finally {
      setIsRunning(false);
    }
  };

  const runBatch = async () => {
    if (selected.length === 0) return;

    setIsRunning(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/backtest/batch`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          symbols: selected,
          interval,
          lookbackDays: Number(lookbackDays),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message ?? 'Batch failed');

      setBatch(data);

      // Surface the top-ranked symbol straight away.
      const best = data.results?.find(
        (r: any) => !r.error && r.symbol === data.summary?.best,
      );
      if (best) setResult(best);
    } catch (err: any) {
      setError(err.message ?? t.error.generic);
      setBatch(null);
    } finally {
      setIsRunning(false);
    }
  };

  const pct = (value: number) => `${(Number(value) * 100).toFixed(1)}%`;
  const num = (value: number, digits = 2) => Number(value).toFixed(digits);

  return (
    <div className="backtest-page">
      <div className="backtest-header">
        <div className="backtest-title-row">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t.controls.back}
          </Button>
          <h1>{t.backtest.title}</h1>
        </div>

        <div className="backtest-controls">
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="backtest-select"
          >
            {['15m', '1h', '4h', '1d'].map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <select
            value={lookbackDays}
            onChange={(e) => setLookbackDays(e.target.value)}
            className="backtest-select"
          >
            {['90', '180', '365', '540'].map((d) => (
              <option key={d} value={d}>
                {isRTL ? `${d} روز` : `${d} days`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="backtest-error">{error}</div>}

      <div className="backtest-picker">
        <div className="picker-header">
          <h3>{t.backtest.selectSymbols}</h3>
          <Button variant="primary" onClick={runBatch} disabled={isRunning}>
            {isRunning ? t.common.loading : t.backtest.runBatch}
          </Button>
        </div>

        <div className="symbol-chips">
          {DEFAULTS.map((symbol) => (
            <button
              key={symbol}
              className={`pick-chip ${selected.includes(symbol) ? 'active' : ''}`}
              onClick={() => toggleSymbol(symbol)}
            >
              {symbol}
            </button>
          ))}

          {selected
            .filter((s) => !DEFAULTS.includes(s))
            .map((symbol) => (
              <button
                key={symbol}
                className="pick-chip active"
                onClick={() => toggleSymbol(symbol)}
              >
                {symbol} ×
              </button>
            ))}
        </div>

        <div className="custom-symbol">
          <input
            type="text"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            placeholder={isRTL ? 'نماد دلخواه' : 'Custom symbol'}
          />
          <Button variant="secondary" size="sm" onClick={addCustom}>
            {t.backtest.add}
          </Button>
        </div>
      </div>

      {batch?.leaderboard?.length > 0 && (
        <div className="leaderboard">
          <h3>{t.backtest.leaderboard}</h3>

          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>{t.correlation.symbol}</th>
                  <th>{t.backtest.trades}</th>
                  <th>{t.backtest.winRate}</th>
                  <th>{t.backtest.profitFactor}</th>
                  <th>{t.backtest.netReturn}</th>
                  <th>{t.backtest.sharpe}</th>
                  <th>{t.backtest.drawdown}</th>
                  <th>{t.backtest.verdict}</th>
                </tr>
              </thead>
              <tbody>
                {batch.leaderboard.map((row: any) => (
                  <tr
                    key={row.symbol}
                    className={row.symbol === batch.summary?.best ? 'best-row' : ''}
                    onClick={() => setSelected((s) => [...new Set([...s, row.symbol])])}
                  >
                    <td className="symbol-cell">{row.symbol}</td>
                    <td>{row.totalTrades}</td>
                    <td style={{ color: '#22c55e' }}>{pct(row.winRate)}</td>
                    <td
                      style={{
                        color: row.profitFactor > 1 ? '#22c55e' : '#ef4444',
                        fontWeight: 700,
                      }}
                    >
                      {num(row.profitFactor)}
                    </td>
                    <td style={{ color: row.netReturn > 0 ? '#22c55e' : '#ef4444' }}>
                      {pct(row.netReturn)}
                    </td>
                    <td>{num(row.sharpeRatio)}</td>
                    <td style={{ color: '#f97316' }}>{pct(row.maxDrawdown)}</td>
                    <td>
                      <span
                        className="verdict-chip"
                        style={{
                          color: VERDICT_STYLES[row.verdict]?.color,
                          borderColor: VERDICT_STYLES[row.verdict]?.color,
                        }}
                      >
                        {VERDICT_STYLES[row.verdict]?.[isRTL ? 'fa' : 'en'] ??
                          row.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="batch-summary">
            <span>
              {t.backtest.tested}: <strong>{batch.summary?.tested ?? 0}</strong>
            </span>
            <span>
              {t.backtest.passed}:{' '}
              <strong style={{ color: '#22c55e' }}>
                {batch.summary?.passed ?? 0}
              </strong>
            </span>
            {batch.summary?.best && (
              <span>
                {t.backtest.best}:{' '}
                <strong style={{ color: '#f59e0b' }}>
                  {batch.summary.best}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {batch?.results?.filter((r: any) => r.error)?.length > 0 && (
        <div className="batch-errors">
          <h4>{t.backtest.failures}</h4>
          {batch.results
            .filter((r: any) => r.error)
            .map((r: any) => (
              <p key={r.symbol}>
                <strong>{r.symbol}</strong>: {r.error}
              </p>
            ))}
        </div>
      )}

      {result && (
        <div className="result-card">
          <div className="result-header">
            <div>
              <h2>{result.symbol}</h2>
              <span className="result-meta">
                {result.interval} · {result.barsTested} {t.backtest.candles} ·{' '}
                {result.strategy}
              </span>
            </div>

            <div className="result-verdict">
              <span className="verdict-label">{t.backtest.verdict}</span>
              <span
                className="verdict-value"
                style={{ color: VERDICT_STYLES[result.verdict]?.color }}
              >
                {VERDICT_STYLES[result.verdict]?.[isRTL ? 'fa' : 'en'] ??
                  result.verdict}
              </span>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">{t.backtest.winRate}</span>
              <span className="metric-value">{pct(result.winRate)}</span>
              <span className="metric-sub">
                {result.winningTrades}W / {result.losingTrades}L
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.profitFactor}</span>
              <span
                className="metric-value"
                style={{
                  color: result.profitFactor > 1 ? '#22c55e' : '#ef4444',
                }}
              >
                {num(result.profitFactor)}
              </span>
              <span className="metric-sub">&gt;1 {isRTL ? 'سودده' : 'is profitable'}</span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.netReturn}</span>
              <span
                className="metric-value"
                style={{ color: result.netReturn > 0 ? '#22c55e' : '#ef4444' }}
              >
                {pct(result.netReturn)}
              </span>
              <span className="metric-sub">
                {result.startingEquity} → {result.endingEquity}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.buyHold}</span>
              <span
                className="metric-value"
                style={{
                  color: result.netReturn > result.buyAndHoldReturn
                    ? '#22c55e'
                    : '#ef4444',
                }}
              >
                {pct(result.buyAndHoldReturn)}
              </span>
              <span className="metric-sub">
                {result.netReturn > result.buyAndHoldReturn
                  ? isRTL
                    ? 'بهتر از خرید و نگهداری'
                    : 'Beat buy & hold'
                  : isRTL
                    ? 'کمتر از خرید و نگهداری'
                    : 'Below buy & hold'}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.sharpe}</span>
              <span
                className="metric-value"
                style={{ color: result.sharpeRatio > 0 ? '#22c55e' : '#ef4444' }}
              >
                {num(result.sharpeRatio)}
              </span>
              <span className="metric-sub">{isRTL ? 'سالانه‌شده' : 'annualised'}</span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.drawdown}</span>
              <span
                className="metric-value"
                style={{ color: result.maxDrawdown > 0.25 ? '#ef4444' : '#f97316' }}
              >
                {pct(result.maxDrawdown)}
              </span>
              <span className="metric-sub">{isRTL ? 'بیشینه افت' : 'max decline'}</span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.avgR}</span>
              <span
                className="metric-value"
                style={{ color: result.averageRMultiple > 0 ? '#22c55e' : '#ef4444' }}
              >
                {num(result.averageRMultiple)}R
              </span>
              <span className="metric-sub">{isRTL ? 'میانگین هر معامله' : 'per trade'}</span>
            </div>

            <div className="metric">
              <span className="metric-label">{t.backtest.fees}</span>
              <span className="metric-value">
                {((result.fees ?? 0) * 100).toFixed(2)}%
              </span>
              <span className="metric-sub">{isRTL ? 'رفت و برگشت' : 'round trip'}</span>
            </div>
          </div>

          <p className="result-notes">{result.notes}</p>

          {result.trades?.length > 0 && (
            <div className="trades-section">
              <h4>
                {t.backtest.recentTrades} ({result.trades.length})
              </h4>

              <div className="trades-table-wrap">
                <table className="trades-table">
                  <thead>
                    <tr>
                      <th>{t.backtest.side}</th>
                      <th>{t.backtest.entry}</th>
                      <th>{t.backtest.exit}</th>
                      <th>{t.backtest.result}</th>
                      <th>R</th>
                      <th>{t.backtest.reason}</th>
                      <th>{t.backtest.bars}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.slice(-25).reverse().map((trade, i) => (
                      <tr key={`${trade.entryTime}-${i}`}>
                        <td>
                          <span
                            className={`side-chip ${trade.side.toLowerCase()}`}
                          >
                            {trade.side}
                          </span>
                        </td>
                        <td>{num(trade.entryPrice, 4)}</td>
                        <td>{num(trade.exitPrice, 4)}</td>
                        <td
                          style={{
                            color: trade.pnlPercent > 0 ? '#22c55e' : '#ef4444',
                            fontWeight: 600,
                          }}
                        >
                          {Number(trade.pnlPercent).toFixed(2)}%
                        </td>
                        <td
                          style={{
                            color: trade.rMultiple > 0 ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {num(trade.rMultiple)}
                        </td>
                        <td className="reason-cell">
                          {REASON_LABELS[trade.exitReason]?.[isRTL ? 'fa' : 'en'] ??
                            trade.exitReason}
                        </td>
                        <td>{trade.barsHeld}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {history && history.length > 0 && (
        <div className="history-section">
          <h3>{t.backtest.history}</h3>

          <div className="history-list">
            {history.map((row: any) => (
              <button
                key={row.id}
                className="history-row"
                onClick={() => {
                  setInterval(row.interval);
                  runSingle(row.symbol);
                }}
              >
                <span className="history-symbol">{row.symbol}</span>
                <span className="history-interval">{row.interval}</span>
                <span style={{ color: row.profitFactor > 1 ? '#22c55e' : '#ef4444' }}>
                  PF {num(row.profitFactor)}
                </span>
                <span>{pct(row.winRate)}</span>
                <span
                  className="verdict-chip"
                  style={{
                    color: VERDICT_STYLES[row.verdict]?.color,
                    borderColor: VERDICT_STYLES[row.verdict]?.color,
                  }}
                >
                  {VERDICT_STYLES[row.verdict]?.[isRTL ? 'fa' : 'en'] ?? row.verdict}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}