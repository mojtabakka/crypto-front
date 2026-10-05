import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import type { SentimentLabels } from '../i18n/types';
import { Button } from '../components/Button';
import './SentimentPage.css';

const API_BASE = 'http://localhost:3000';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT'];

interface SentimentRecord {
  id: number;
  symbol: string;
  label: string;
  score: number;
  confidence: number;
  articleCount: number;
  keywords: string[] | null;
  summary: string | null;
  topArticles: { title: string; url: string; sentiment: string }[] | null;
  createdAt: string;
}

const LABEL_COLORS: Record<string, string> = {
  very_bullish: '#10b981',
  bullish: '#34d399',
  neutral: '#f59e0b',
  bearish: '#f87171',
  very_bearish: '#ef4444',
};

const LABEL_ICONS: Record<string, string> = {
  very_bullish: '🚀',
  bullish: '📈',
  neutral: '➡️',
  bearish: '📉',
  very_bearish: '🔻',
};

/** Look up a localized label, falling back to the raw enum value. */
function labelText(labels: SentimentLabels, key: string): string {
  return labels[key] ?? key;
}

function labelColor(key: string): string {
  return LABEL_COLORS[key] ?? '#f59e0b';
}

export function SentimentPage({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();
  const { t, isRTL } = useI18n();
  const queryClient = useQueryClient();
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const {
    data: latest,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['sentiment', selectedSymbol],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/sentiment?symbol=${selectedSymbol}`,
        { headers: authHeaders },
      );
      if (!res.ok) throw new Error('Failed to fetch sentiment');
      return (await res.json()) as SentimentRecord[];
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const { data: overview } = useQuery({
    queryKey: ['sentiment-overview'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/sentiment/overview`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to fetch overview');
      return (await res.json()) as SentimentRecord[];
    },
    enabled: !!token,
    staleTime: 5 * 60_000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${API_BASE}/sentiment/analyze?symbol=${selectedSymbol}`,
        { method: 'POST', headers: authHeaders },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Analysis failed');
      }

      return (await res.json()) as SentimentRecord;
    },
    // Seed the cache with the fresh result so the UI updates immediately
    // instead of waiting for the list query to refetch.
    onSuccess: (record) => {
      queryClient.setQueryData<SentimentRecord[]>(
        ['sentiment', selectedSymbol],
        [record],
      );
      queryClient.invalidateQueries({ queryKey: ['sentiment-overview'] });
    },
  });

  const record = latest?.[0];

  return (
    <div className="sentiment-page">
      <div className="sentiment-header">
        <div className="sentiment-title-row">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {isRTL ? 'بازگشت' : 'Back'}
          </Button>
          <h1>{t.sentiment.title}</h1>
        </div>

        <div className="sentiment-controls">
          <select
            value={selectedSymbol}
            onChange={(e) => {
              setSelectedSymbol(e.target.value);
            }}
            className="sentiment-select"
          >
            {SYMBOLS.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
          >
            {analyzeMutation.isPending
              ? t.sentiment.analyzing
              : t.sentiment.analyzeNow}
          </Button>
        </div>
      </div>

      {analyzeMutation.isError && (
        <div className="sentiment-error">
          {(analyzeMutation.error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="sentiment-loading">{t.sentiment.loading}</div>
      ) : !record ? (
        <div className="sentiment-empty">
          <p>{t.sentiment.emptyHint}</p>
          <Button
            variant="primary"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
          >
            {t.sentiment.analyzeNow}
          </Button>
        </div>
      ) : (
        <>
          <div className="sentiment-card">
            <div className="sentiment-main">
              <div
                className="sentiment-score"
                style={{ borderColor: labelColor(record.label) }}
              >
                <span className="sentiment-icon">
                  {LABEL_ICONS[record.label] ?? '➡️'}
                </span>
                <span
                  className="sentiment-value"
                  style={{ color: labelColor(record.label) }}
                >
                  {Number(record.score).toFixed(1)}
                </span>
                <span className="sentiment-label">
                  {labelText(t.sentiment.labels, record.label)}
                </span>
              </div>

              <div className="sentiment-details">
                <p className="sentiment-summary">{record.summary}</p>

                <div className="sentiment-meta">
                  <span>
                    {t.sentiment.articles}: {record.articleCount}
                  </span>
                  <span>•</span>
                  <span>
                    {t.sentiment.confidence}:{' '}
                    {Math.round(Number(record.confidence) * 100)}%
                  </span>
                  <span>•</span>
                  <span>{new Date(record.createdAt).toLocaleString()}</span>
                </div>

                {record.keywords && record.keywords.length > 0 && (
                  <div className="sentiment-keywords">
                    {record.keywords.map((keyword) => (
                      <span key={keyword} className="keyword-tag">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {record.topArticles && record.topArticles.length > 0 && (
              <div className="sentiment-articles">
                <h3>{t.sentiment.topArticles}</h3>
                <div className="articles-list">
                  {record.topArticles.map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`article-item ${article.sentiment}`}
                    >
                      <span className="article-sentiment">
                        {article.sentiment === 'bullish'
                          ? '📈'
                          : article.sentiment === 'bearish'
                            ? '📉'
                            : '➡️'}
                      </span>
                      <span className="article-title">{article.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isFetching && (
            <div className="sentiment-refreshing">{t.common.loading}</div>
          )}
        </>
      )}

      {overview && overview.length > 0 && (
        <div className="sentiment-overview">
          <h2>{t.sentiment.marketOverview}</h2>
          <div className="overview-grid">
            {overview.map((item) => (
              <button
                key={item.symbol}
                className={`overview-card ${
                  item.symbol === selectedSymbol ? 'active' : ''
                }`}
                onClick={() => setSelectedSymbol(item.symbol)}
              >
                <div className="overview-symbol">{item.symbol}</div>
                <div
                  className="overview-score"
                  style={{ color: labelColor(item.label) }}
                >
                  {Number(item.score).toFixed(1)}
                </div>
                <div className="overview-label">
                  {labelText(t.sentiment.labels, item.label)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}