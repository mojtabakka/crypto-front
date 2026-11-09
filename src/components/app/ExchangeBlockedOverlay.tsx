import { toast } from 'react-hot-toast';

interface ExchangeBlockedOverlayProps {
    blockCount: number;
}

export function ExchangeBlockedOverlay({ blockCount }: ExchangeBlockedOverlayProps) {
    return (
        <>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9000,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'all',
                cursor: 'not-allowed',
            }}>
                <div style={{
                    background: '#1e293b',
                    border: '2px solid #ef4444',
                    borderRadius: '16px',
                    padding: '32px 40px',
                    textAlign: 'center',
                    maxWidth: '450px',
                    color: '#e2e8f0',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#fca5a5' }}>
                        IP Rate Limited / Banned
                    </h2>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.8 }}>
                        All features disabled — circuit breaker active ({blockCount} blocks)
                    </p>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
                        Wait for automatic reset or click below to retry
                    </p>
                    <button
                        onClick={async () => {
                            try {
                                await fetch('http://localhost:3000/exchange/circuit-breakers/reset', { method: 'POST' });
                                window.location.reload();
                            } catch {
                                toast.error('Failed to reset circuit breaker');
                            }
                        }}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 24px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            fontWeight: 600,
                        }}
                    >
                        🔄 Try Reset Circuit Breaker
                    </button>
                </div>
            </div>
        </>
    );
}
