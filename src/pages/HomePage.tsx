import { useState, useCallback, useMemo } from 'react';
import { useI18n } from '../i18n';
import { useStoredFuturesSymbols } from '../hooks/useFuturesSymbols';
import './HomePage.css';

interface HomePageProps {
    onSearch: (symbol: string) => void;
}

export function HomePage({
    onSearch,
}: HomePageProps) {
    const { t, isRTL } = useI18n();
    const [input, setInput] = useState('');
    const { data: symbolsData } = useStoredFuturesSymbols();

    const symbols = useMemo(() => {
        if (!symbolsData || !('symbols' in symbolsData)) return [];
        return symbolsData.symbols
            .filter((s) => s.status === 'TRADING')
            .map((s) => s.symbol)
            .sort();
    }, [symbolsData]);

    const filteredSymbols = useMemo(() => {
        if (!input) return symbols.slice(0, 100);
        return symbols.filter((s) =>
            s.toLowerCase().includes(input.toLowerCase()),
        );
    }, [symbols, input]);

    const handleSelect = useCallback(
        (symbol: string) => {
            onSearch(symbol);
        },
        [onSearch],
    );

    return (
        <div className="home-page">
            <div className="home-card">
                <h1 className="home-title">
                    {t.app.title}
                </h1>
                <p className="home-subtitle">
                    {t.app.subtitle}
                </p>

                <div className="symbol-dropdown-wrapper">
                    <input
                        value={input}
                        onChange={(e) =>
                            setInput(e.target.value.toUpperCase())
                        }
                        placeholder={isRTL ? 'جستجو کنید...' : 'Search...'}
                        className="home-input"
                        autoFocus
                    />
                    {filteredSymbols.length > 0 && (
                        <ul className="symbol-dropdown-list">
                            {filteredSymbols.slice(0, 50).map((sym) => (
                                <li
                                    key={sym}
                                    className="symbol-dropdown-item"
                                    onClick={() => handleSelect(sym)}
                                >
                                    {sym}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {symbols.length > 0 && (
                    <p className="symbols-loaded-info">
                        {symbols.length} {isRTL ? 'ارز فیوچر' : 'futures symbols loaded'}
                    </p>
                )}
            </div>
        </div>
    );
}
