import { useState } from 'react';
import type { ExchangeName } from '../api/market/market';
import './ExchangeLogo.css';

export const EXCHANGE_DISPLAY_NAMES: Record<ExchangeName, string> = {
    BINANCE: 'Binance',
    OKX: 'OKX',
    BYBIT: 'Bybit',
    MEXC: 'MEXC',
    KUCOIN: 'KuCoin',
    BINGX: 'BingX',
    CRYPTOCOM: 'Crypto.com',
    TOOBIT: 'Toobit',
    LBANK: 'LBank',
    ORBIT: 'Orbit',
};

const EXCHANGE_LOGO_URLS: Record<ExchangeName, string> = {
    BINANCE: 'https://www.google.com/s2/favicons?domain=binance.com&sz=64',
    OKX: 'https://www.google.com/s2/favicons?domain=okx.com&sz=64',
    BYBIT: 'https://www.google.com/s2/favicons?domain=bybit.com&sz=64',
    MEXC: 'https://www.google.com/s2/favicons?domain=mexc.com&sz=64',
    KUCOIN: 'https://www.google.com/s2/favicons?domain=kucoin.com&sz=64',
    BINGX: 'https://www.google.com/s2/favicons?domain=bingx.com&sz=64',
    CRYPTOCOM: 'https://www.google.com/s2/favicons?domain=crypto.com&sz=64',
    TOOBIT: 'https://www.google.com/s2/favicons?domain=toobit.com&sz=64',
    LBANK: 'https://www.google.com/s2/favicons?domain=lbank.com&sz=64',
    ORBIT: '',
};

const EXCHANGE_COLORS: Record<ExchangeName, string> = {
    BINANCE: '#f0b90b',
    OKX: '#1f1f1f',
    BYBIT: '#f7a600',
    MEXC: '#00b897',
    KUCOIN: '#24ae8f',
    BINGX: '#2354e6',
    CRYPTOCOM: '#103f68',
    TOOBIT: '#0057ff',
    LBANK: '#f5a623',
    ORBIT: '#8b5cf6',
};

const EXCHANGE_INITIALS: Record<ExchangeName, string> = {
    BINANCE: 'B',
    OKX: 'OX',
    BYBIT: 'B',
    MEXC: 'M',
    KUCOIN: 'K',
    BINGX: 'B',
    CRYPTOCOM: 'C',
    TOOBIT: 'T',
    LBANK: 'L',
    ORBIT: 'OR',
};

interface ExchangeLogoProps {
    exchange: ExchangeName;
    size?: number;
}

export function ExchangeLogo({ exchange, size = 20 }: ExchangeLogoProps) {
    const [failed, setFailed] = useState(false);
    const source = EXCHANGE_LOGO_URLS[exchange];
    const color = EXCHANGE_COLORS[exchange];
    const dimensions = {
        width: size,
        height: size,
    };

    if (!source || failed) {
        return (
            <span
                className="exchange-logo"
                style={{
                    ...dimensions,
                    background: `${color}1f`,
                    borderColor: `${color}55`,
                    color,
                    fontSize: Math.max(8, Math.round(size * 0.38)),
                }}
                aria-label={EXCHANGE_DISPLAY_NAMES[exchange]}
            >
                {EXCHANGE_INITIALS[exchange]}
            </span>
        );
    }

    return (
        <span
            className="exchange-logo"
            style={{
                ...dimensions,
                background: '#f8fafc',
                borderColor: '#334155',
            }}
        >
            <img
                src={source}
                alt={EXCHANGE_DISPLAY_NAMES[exchange]}
                width={size}
                height={size}
                draggable={false}
                onError={() => setFailed(true)}
            />
        </span>
    );
}
