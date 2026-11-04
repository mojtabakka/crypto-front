import type { Page } from '../types/app';

export function getPageFromUrl(): Page {
    if (window.location.pathname === '/signals') return 'signals';
    if (window.location.pathname === '/watchlist') return 'watchlist';
    if (window.location.pathname === '/four-hour-signals') return 'four-hour-signals';
    if (window.location.pathname === '/long-short-signals') return 'long-short-signals';
    if (window.location.pathname === '/volume-profile') return 'volume-profile';
    if (window.location.pathname === '/new-listings') return 'new-listings';
    if (window.location.pathname === '/logs') return 'logs';
    if (window.location.pathname === '/pump-detector') return 'pump-detector';
    if (window.location.pathname === '/dump-detector') return 'dump-detector';
    if (window.location.pathname === '/pre-move-detector') return 'pre-move-detector';
    if (window.location.pathname === '/safe-sell') return 'safe-sell';
    if (window.location.pathname === '/tvl-analysis') return 'tvl-analysis';
    if (window.location.pathname === '/protocol-analysis') return 'protocol-analysis';
    if (window.location.pathname === '/coinglass-signals') return 'coinglass-signals';
    if (window.location.pathname === '/pressure-scan') return 'pressure-scan';
    if (window.location.pathname === '/volume-marketcap') return 'volume-marketcap';
    if (window.location.pathname === '/ichimoku-scanner') return 'ichimoku-scanner';
    if (window.location.pathname === '/ichimoku-lagging-span') return 'ichimoku-lagging-span';
    if (window.location.pathname === '/ichimoku-combined') return 'ichimoku-combined';
    const params = new URLSearchParams(window.location.search);
    return params.get('symbol') ? 'detail' : 'home';
}
