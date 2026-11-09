import { useState, useCallback, useMemo } from 'react';
import { useI18n } from '../i18n';
import { useStoredFuturesSymbols } from '../hooks/useFuturesSymbols';

interface HomePageProps {
    onSearch: (symbol: string) => void;
}

export function HomePage({ onSearch }: HomePageProps) {
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
        const q = input.toUpperCase();
        return symbols.filter((s) => s.includes(q)).slice(0, 50);
    }, [symbols, input]);

    const handleSelect = useCallback(
        (symbol: string) => {
            onSearch(symbol);
        },
        [onSearch],
    );

    return (
        <div className="flex flex-col items-center gap-6 bg-gradient-to-b from-[#0a0e17] to-[#0f172a] p-6 min-h-screen">
            <div className="bg-[rgba(15,23,42,0.6)] shadow-2xl backdrop-blur-xl p-8 md:p-12 border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-[520px] text-center animate-[fadeIn_0.6s_ease-out]">
                <h1 className="bg-clip-text bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] m-0 mb-3 font-bold text-transparent text-3xl md:text-4xl tracking-tight">
                    {t.app.title}
                </h1>
                <p className="m-0 mb-8 text-[#94a3b8] text-sm leading-relaxed">
                    {t.app.subtitle}
                </p>

                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        placeholder={isRTL ? 'جستجو کنید...' : 'Search...'}
                        className="bg-[rgba(30,41,59,0.4)] px-4 py-3.5 border border-[rgba(255,255,255,0.08)] focus:border-[#60a5fa] rounded-lg outline-none focus:ring-[#60a5fa]/15 focus:ring-2 w-full text-[#e2e8f0] text-[15px] text-start transition-all"
                        autoFocus
                    />
                    {filteredSymbols.length > 0 && (
                        <ul className="top-full right-0 left-0 z-[100] absolute bg-[rgba(30,41,59,0.4)] shadow-xl mt-1 p-1 border border-[rgba(255,255,255,0.08)] rounded-lg max-h-[250px] overflow-y-auto list-none">
                            {filteredSymbols.map((sym) => (
                                <li
                                    key={sym}
                                    className="hover:bg-[rgba(96,165,250,0.15)] px-3.5 py-2.5 rounded-md text-[#e2e8f0] hover:text-[#60a5fa] text-sm text-start transition-colors cursor-pointer"
                                    onClick={() => handleSelect(sym)}
                                >
                                    {sym}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {symbols.length > 0 && (
                    <p className="mt-4 mb-0 text-[#64748b] text-xs">
                        {symbols.length} {isRTL ? 'ارز فیوچر' : 'futures symbols loaded'}
                    </p>
                )}
            </div>
        </div>
    );
}
