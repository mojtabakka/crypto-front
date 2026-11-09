import { useExchange } from '../contexts/ExchangeContext';
import { useI18n } from '../i18n';
import { ExchangeLogo, EXCHANGE_DISPLAY_NAMES } from './ExchangeLogo';

interface ExchangeBadgeProps {
    label?: string;
}

export function ExchangeBadge({ label }: ExchangeBadgeProps) {
    const { exchange } = useExchange();
    const { isRTL } = useI18n();
    const badgeLabel = label ?? (isRTL ? 'منبع داده' : 'Data source');

    return (
        <div 
            className="flex items-center gap-2 bg-surface/60 px-3 py-1.5 border border-border-subtle rounded-lg text-text-primary text-sm" 
            title={EXCHANGE_DISPLAY_NAMES[exchange]}
        >
            <ExchangeLogo exchange={exchange} size={18} />
            <span className="text-text-secondary">{badgeLabel}:</span>
            <strong className="font-semibold">{EXCHANGE_DISPLAY_NAMES[exchange]}</strong>
        </div>
    );
}
