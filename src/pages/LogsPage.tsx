import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import { ExchangeBadge } from '../components/ExchangeBadge';
import { Loading } from '../components/Loading';
import './LogsPage.css';

interface LogEntry {
  timestamp: string;
  level: string;
  context?: string;
  message: string;
  ms?: string;
}

interface LogsResponse {
  entries: LogEntry[];
  total: number;
}

const LEVEL_COLORS: Record<string, string> = {
  error: '#ef4444',
  warn: '#f59e0b',
  info: '#3b82f6',
  debug: '#94a3b8',
  verbose: '#6b7280',
};

const LEVELS = ['all', 'error', 'warn', 'info', 'debug'];

export function LogsPage() {
  const { isRTL } = useI18n();
  const [level, setLevel] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery<LogsResponse>({
    queryKey: ['logs', level, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '200' });
      if (level !== 'all') params.set('level', level);
      if (search) params.set('search', search);
      const res = await fetch(`http://localhost:3000/logs/recent?${params}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    },
    refetchInterval: 5000,
  });

  return (
    <div className="logs-page">
      <div className="logs-header">
        <h1 className="logs-title">
          {isRTL ? '📋 لاگ‌های سیستم' : '📋 System Logs'}
        </h1>
        <ExchangeBadge />
        <Button variant="purple" size="sm" onClick={() => refetch()}>
          {isRTL ? '🔄 بروزرسانی' : '🔄 Refresh'}
        </Button>
      </div>

      <div className="logs-filters">
        <div className="level-filters">
          {LEVELS.map((l) => (
            <button
              key={l}
              className={`level-btn ${level === l ? 'active' : ''}`}
              onClick={() => setLevel(l)}
              style={
                level === l && l !== 'all'
                  ? { borderColor: LEVEL_COLORS[l] }
                  : {}
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="logs-search"
          placeholder={isRTL ? 'جستجو...' : 'Search...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <Loading isRTL={isRTL} />}

      {data && (
        <>
          <div className="logs-stats">
            {isRTL ? `تعداد: ${data.total}` : `Total: ${data.total}`}
          </div>
          <div className="logs-list">
            {data.entries.map((entry, i) => (
              <div
                key={i}
                className="log-entry"
                style={{ borderLeftColor: LEVEL_COLORS[entry.level] ?? '#6b7280' }}
              >
                <div className="log-meta">
                  <span
                    className="log-level"
                    style={{ color: LEVEL_COLORS[entry.level] ?? '#6b7280' }}
                  >
                    {entry.level.toUpperCase()}
                  </span>
                  <span className="log-context">[{entry.context ?? 'App'}]</span>
                  <span className="log-timestamp">{entry.timestamp}</span>
                  {entry.ms && <span className="log-ms">{entry.ms}</span>}
                </div>
                <div className="log-message">{entry.message}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
