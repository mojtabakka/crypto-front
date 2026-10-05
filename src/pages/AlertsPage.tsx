import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from '../components/Button';
import './AlertsPage.css';

const API_BASE = 'http://localhost:3000';

interface PriceAlert {
  id: number;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  status: 'active' | 'triggered' | 'cancelled' | 'expired';
  triggeredPrice: number | null;
  note: string | null;
}

const STATUS_CLASS: Record<string, string> = {
  active: 'status-active',
  triggered: 'status-triggered',
  cancelled: 'status-cancelled',
  expired: 'status-expired',
};

export function AlertsPage({ onBack }: { onBack: () => void }) {
  const { token } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/alerts`, { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch alerts');
      return (await res.json()) as PriceAlert[];
    },
    enabled: !!token,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['alerts'] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create alert');
      }
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setTargetPrice('');
      setNote('');
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/alerts/${id}/cancel`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to cancel alert');
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/alerts/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete alert');
      return res.json();
    },
    onSuccess: invalidate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const price = parseFloat(targetPrice);
    if (!price || price <= 0) {
      setError(t.alerts.targetPrice);
      return;
    }

    createMutation.mutate({
      symbol: symbol.toUpperCase(),
      targetPrice: price,
      condition,
      note: note || undefined,
    });
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div className="alerts-title-row">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← {t.controls.back}
          </Button>
          <h1>{t.alerts.title}</h1>
        </div>

        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t.alerts.cancel : t.alerts.create}
        </Button>
      </div>

      {error && <div className="alerts-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="alerts-form">
          <div className="form-row">
            <div className="form-field">
              <label>{t.alerts.symbol}</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTCUSDT"
              />
            </div>

            <div className="form-field">
              <label>{t.alerts.condition}</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              >
                <option value="above">{t.alerts.above}</option>
                <option value="below">{t.alerts.below}</option>
              </select>
            </div>

            <div className="form-field">
              <label>{t.alerts.targetPrice}</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="50000"
                step="any"
              />
            </div>
          </div>

          <div className="form-field">
            <label>{t.alerts.note}</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.alerts.notePlaceholder}
            />
          </div>

          <Button type="submit" variant="primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? t.alerts.submitting : t.alerts.submit}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="alerts-loading">{t.alerts.loading}</div>
      ) : alerts && alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <div className="alert-info">
                <div className="alert-symbol">{alert.symbol}</div>

                <div className="alert-details">
                  <span className="alert-condition">
                    {alert.condition === 'above'
                      ? `↑ ${t.alerts.above}`
                      : `↓ ${t.alerts.below}`}{' '}
                    {alert.targetPrice}
                  </span>

                  {alert.note && <span className="alert-note">{alert.note}</span>}

                  {alert.triggeredPrice != null && (
                    <span className="alert-triggered">
                      {t.alerts.triggeredAt} {alert.triggeredPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="alert-actions">
                <span className={`status-badge ${STATUS_CLASS[alert.status] ?? ''}`}>
                  {t.alerts[alert.status] ?? alert.status}
                </span>

                {alert.status === 'active' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => cancelMutation.mutate(alert.id)}
                    >
                      {t.alerts.cancelAlert}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteMutation.mutate(alert.id)}
                    >
                      {t.alerts.deleteAlert}
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alerts-empty">
          <p>{t.alerts.empty}</p>
        </div>
      )}
    </div>
  );
}