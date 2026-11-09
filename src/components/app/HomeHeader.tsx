import { LanguageSwitcher } from '../LanguageSwitcher';
import { ExchangeDropdown } from '../ExchangeDropdown';
import { FuturesSymbolsButton } from '../FuturesSymbolsButton';
import { useI18n } from '../../i18n';
import { useExchange } from '../../contexts/ExchangeContext';

export function HomeHeader() {
    const { t, isRTL } = useI18n();
    const { exchange, setExchange } = useExchange();

    return (
        <div className="app-header">
            <div className="header-content">
                <div>
                    <h1 className="app-title">
                        {t.app.title}
                    </h1>
                    <p className="app-subtitle">
                        {t.app.subtitle}
                    </p>
                </div>
                <div className="header-actions">
                    <LanguageSwitcher />
                    <ExchangeDropdown
                        selected={exchange}
                        onChange={setExchange}
                        isRTL={isRTL}
                    />
                </div>
            </div>
            <FuturesSymbolsButton />
        </div>
    );
}
