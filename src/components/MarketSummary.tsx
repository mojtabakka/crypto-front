import { useI18n } from '../i18n';

interface MarketSummaryProps {
    symbol: string;
    interval: string;
    range: string;
    totalVolume: number;
}

export function MarketSummary({
    symbol,
    interval,
    range,
    totalVolume,
}: MarketSummaryProps) {
    const { t } = useI18n();

    return (
        <div className="summary-grid">
            <div className="summary-card">
                <span className="summary-label">
                    {t.summary.symbol}
                </span>
                <strong className="summary-value">
                    {symbol}
                </strong>
            </div>

            <div className="summary-card">
                <span className="summary-label">
                    {t.summary.timeframe}
                </span>
                <strong className="summary-value">
                    {interval}
                </strong>
            </div>

            <div className="summary-card">
                <span className="summary-label">
                    {t.summary.range}
                </span>
                <strong className="summary-value">
                    {range}
                </strong>
            </div>

            <div className="summary-card">
                <span className="summary-label">
                    {t.summary.totalVolume}
                </span>
                <strong className="summary-value">
                    {totalVolume.toLocaleString(
                        undefined,
                        {
                            maximumFractionDigits: 2,
                        },
                    )}
                </strong>
            </div>
        </div>
    );
}
