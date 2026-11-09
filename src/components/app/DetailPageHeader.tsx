import { LanguageSwitcher } from '../LanguageSwitcher';
import { ExchangeDropdown } from '../ExchangeDropdown';
import { Button } from '../Button';
import { useI18n } from '../../i18n';
import { useExchange } from '../../contexts/ExchangeContext';

interface DetailPageHeaderProps {
    symbol: string;
    onBack: () => void;
}

export function DetailPageHeader({ symbol, onBack }: DetailPageHeaderProps) {
    const { isRTL } = useI18n();
    const { exchange, setExchange } = useExchange();

    return (
        <div className="detail-header">
            <div className="detail-header-controls">
                <LanguageSwitcher />
                <ExchangeDropdown
                    selected={exchange}
                    onChange={setExchange}
                    isRTL={isRTL}
                />
            </div>
            <div className="detail-header-title">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    ← {isRTL ? 'بازگشت' : 'Back'}
                </Button>
                <h1 className="detail-title">
                    {symbol}
                </h1>
            </div>
        </div>
    );
}
