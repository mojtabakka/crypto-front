import { useExchange } from '../contexts/ExchangeContext';
import { useI18n } from '../i18n';
import { ExchangeLogo, EXCHANGE_DISPLAY_NAMES } from './ExchangeLogo';
import './ExchangeBadge.css';

interface ExchangeBadgeProps {
    label?: string;
}

export function ExchangeBadge({ label }: ExchangeBadgeProps) {
    const { exchange } = useExchange();
    const { isRTL } = useI18n();
    const badgeLabel = label ?? (isRTL ? 'منبع داده' : 'Data source');

    return (
        <div className="exchange-badge header-control" title={EXCHANGE_DISPLAY_NAMES[exchange]}>
            <ExchangeLogo exchange={exchange} size={18} />
            <span className="exchange-badge-label">{badgeLabel}:</span>
            <strong>{EXCHANGE_DISPLAY_NAMES[exchange]}</strong>
        </div>
    );
}
