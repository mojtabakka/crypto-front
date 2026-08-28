import { useMarketSignal } from '../hooks/useMarketSignal';
import { useI18n } from '../i18n';
import './MarketSignal.css';

function getSignalColor(signal: string): string {
    switch (signal) {
        case 'LONG':
            return '#10b981';
        case 'SHORT':
            return '#ef4444';
        default:
            return '#6b7280';
    }
}

function getSignalEmoji(signal: string): string {
    switch (signal) {
        case 'LONG':
            return '📈';
        case 'SHORT':
            return '📉';
        default:
            return '➡️';
    }
}

interface MarketSignalProps {
    symbol: string;
}

export function MarketSignal({ symbol }: MarketSignalProps) {
    const { t } = useI18n();
    const { data, isLoading, isError, error } = useMarketSignal({ symbol });

    if (isLoading) {
        return <div className="signal-container">{t.signal.loading}</div>;
    }

    if (isError) {
        return (
            <div className="signal-container error">
                {t.signal.error}
                {error instanceof Error ? error.message : 'Unknown error'}
            </div>
        );
    }

    if (!data) {
        return <div className="signal-container">{t.signal.noData}</div>;
    }

    const finalSignalColor = getSignalColor(data.finalSignal);
    const finalSignalEmoji = getSignalEmoji(data.finalSignal);
    const finalSignalText = t.signals[data.finalSignal as keyof typeof t.signals] || data.finalSignal;

    return (
        <div className="signal-container">
            <div className="final-signal" style={{ borderColor: finalSignalColor }}>
                <div className="signal-header">
                    <h2>{t.signal.title}</h2>
                    <span className="final-emoji">{finalSignalEmoji}</span>
                </div>

                <div className="final-score-section">
                    <div
                        className="final-signal-badge"
                        style={{ backgroundColor: finalSignalColor }}
                    >
                        {finalSignalText}
                    </div>
                    <div className="score-info">
                        <span className="score-label">{t.signal.finalScore}</span>
                        <span className="score-value">{data.finalScore.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="timeframes-section">
                <h3>{t.signal.timeframesTitle}</h3>
                <div className="timeframes-grid">
                    {data.timeframes.map((tf) => {
                        const tfSignalColor = getSignalColor(tf.signal);
                        const tfSignalEmoji = getSignalEmoji(tf.signal);
                        const positioningText = t.positioning[tf.positioning as keyof typeof t.positioning] || tf.positioning;

                        return (
                                <div
                                    key={tf.timeframe}
                                    className="timeframe-card"
                                    style={{ borderInlineStartColor: tfSignalColor }}
                                >
                                <div className="timeframe-header">
                                    <h4>{tf.timeframe}</h4>
                                    <span className="timeframe-emoji">{tfSignalEmoji}</span>
                                </div>

                                <div className="metrics">
                                    <div className="metric">
                                        <span className="metric-label">{t.signal.priceChange}</span>
                                        <span className={`metric-value ${tf.priceChange >= 0 ? 'positive' : 'negative'}`}>
                                            {(tf.priceChange * 100).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className="metric">
                                        <span className="metric-label">{t.signal.oiChange}</span>
                                        <span className={`metric-value ${tf.oiChange >= 0 ? 'positive' : 'negative'}`}>
                                            {(tf.oiChange * 100).toFixed(2)}%
                                        </span>
                                    </div>

                                    <div className="metric">
                                        <span className="metric-label">{t.signal.volumeRatio}</span>
                                        <span className="metric-value">{tf.volumeRatio.toFixed(2)}</span>
                                    </div>

                                    <div className="metric">
                                        <span className="metric-label">{t.signal.fundingRate}</span>
                                        <span className="metric-value">{(tf.fundingRate * 100).toFixed(4)}%</span>
                                    </div>

                                    <div className="metric">
                                        <span className="metric-label">{t.signal.positioning}</span>
                                        <span className="metric-value">{positioningText}</span>
                                    </div>
                                </div>

                                <div className="scores">
                                    <div className="score-row">
                                        <span>{t.signal.priceOiScore} {tf.priceOiScore}</span>
                                        <span>{t.signal.volumeScore} {tf.volumeScore}</span>
                                    </div>
                                    <div className="score-row">
                                        <span>{t.signal.fundingScore} {tf.fundingScore}</span>
                                        <span>{t.signal.liquidationScore} {tf.liquidationScore}</span>
                                    </div>
                                    <div className="score-row total">
                                        <span>{t.signal.totalScore} {tf.score.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
