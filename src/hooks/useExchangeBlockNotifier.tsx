import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface BlockedExchange {
  blockedUntil: number;
  blockCount: number;
}

interface CircuitBreakerStatus {
  blocked: boolean;
  blockedUntil?: number;
  blockCount?: number;
  msRemaining?: number;
}

export function useExchangeBlockNotifier() {
  const lastKnownBlocked = useRef<Record<string, BlockedExchange>>({});
  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    const checkBlocked = async () => {
      try {
        const res = await fetch('http://localhost:3000/exchange/circuit-breakers');
        if (!res.ok) return;
        const data = await res.json() as Record<string, CircuitBreakerStatus>;

        const currentlyBlocked: Record<string, BlockedExchange> = {};
        let totalBlocks = 0;
        for (const [ex, status] of Object.entries(data)) {
          if (status.blocked) {
            currentlyBlocked[ex] = {
              blockedUntil: status.blockedUntil ?? 0,
              blockCount: status.blockCount ?? 0,
            };
            totalBlocks += status.blockCount ?? 0;
          }
        }

        for (const [ex, status] of Object.entries(currentlyBlocked)) {
          const prev = lastKnownBlocked.current[ex];
          if (!prev || prev.blockCount !== status.blockCount) {
            const remaining = Math.max(0, Math.ceil((status.blockedUntil - Date.now()) / 60000));
            toast.custom((t) => (
              <div
                style={{
                  background: '#450a0a',
                  color: '#fca5a5',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: '1px solid #ef4444',
                  boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  maxWidth: '400px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>
                    ⚠️ {ex} — IP Rate Limited
                  </div>
                  <div>Block #{status.blockCount} — try again in ~{remaining}m</div>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0',
                    opacity: 0.7,
                  }}
                >
                  ✕
                </button>
              </div>
            ), { duration: Infinity });
          }
        }

        for (const ex of Object.keys(lastKnownBlocked.current)) {
          if (!currentlyBlocked[ex]) {
            toast.dismiss(ex);
          }
        }

        lastKnownBlocked.current = currentlyBlocked;
        setBlockCount(totalBlocks);
      } catch {
        // ignore
      }
    };

    checkBlocked();
    const interval = setInterval(checkBlocked, 60000);
    return () => clearInterval(interval);
  }, []);

  return { blockCount };
}
