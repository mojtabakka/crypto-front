export type ExchangeName =
    | 'BINANCE'
    | 'OKX'
    | 'BYBIT'
    | 'MEXC'
    | 'KUCOIN'
    | 'BINGX'
    | 'CRYPTOCOM';

export function getCurrentExchange(): ExchangeName {
    if (typeof window === 'undefined') return 'BINANCE';
    const saved = localStorage.getItem('selected_exchange') as ExchangeName;
    return saved ?? 'BINANCE';
}

export interface MarketCandle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    quoteVolume: number;
    trades: number;
}

export interface GetMarketDataParams {
    symbol: string;
    interval: string;
    range: string;
    exchange?: ExchangeName;
}

export interface OpenInterestData {
    time: number;
    openInterest: number;
    openInterestValue: number;
}

export interface FundingRateData {
    time: number;
    fundingRate: number;
}

export interface TimeframeSignal {
    timeframe: string;
    priceChange: number;
    oiChange: number;
    volumeRatio: number;
    fundingRate: number;
    longLiquidation: number;
    shortLiquidation: number;
    positioning: string;
    priceOiScore: number;
    volumeScore: number;
    fundingScore: number;
    liquidationScore: number;
    score: number;
    signal: string;
}

export interface MarketSignal {
    timeframes: TimeframeSignal[];
    finalScore: number;
    finalSignal: string;
    confidence: number;
}

export async function getMarketData({
    symbol,
    interval,
    range,
    exchange,
}: GetMarketDataParams): Promise<MarketCandle[]> {
    const ex = exchange ?? getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market/${symbol}?interval=${interval}&range=${range}&exchange=${ex}`,
    );

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to fetch market data');
    }

    return response.json();
}

export async function getOpenInterest({
    symbol,
    range,
}: {
    symbol: string;
    range: string;
}): Promise<OpenInterestData[]> {
    const exchange = getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market/${symbol}/open-interest?range=${range}&exchange=${exchange}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch open interest');
    }

    return response.json();
}

export async function getFundingRate({
    symbol,
    range,
}: {
    symbol: string;
    range: string;
}): Promise<FundingRateData[]> {
    const exchange = getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market/${symbol}/funding-rate?range=${range}&exchange=${exchange}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch funding rate');
    }

    return response.json();
}

export async function getMarketSignal({
    symbol,
}: {
    symbol: string;
}): Promise<MarketSignal> {
    const exchange = getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market-signal?symbol=${symbol}&exchange=${exchange}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch market signal');
    }

    return response.json();
}

export interface NewsItem {
    id: string;
    title: string;
    summary?: string;
    source?: string;
    publishedAt: string;
    url?: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    relatedSymbols?: string[];
}

export interface CryptoNewsResponse {
    status: string;
    hasWarning: boolean;
    message: string;
    data: NewsItem[];
    total?: number;
    lang?: string;
}

export interface NewsQueryDto {
    symbol?: string;
    lang?: string;
    limit?: number;
}

export async function getNews({
    symbol,
    lang,
    limit,
}: NewsQueryDto): Promise<CryptoNewsResponse> {
    const params = new URLSearchParams();
    if (symbol) params.set('symbol', symbol);
    if (lang) params.set('lang', lang);
    if (limit) params.set('limit', String(limit));

    const response = await fetch(
        `http://localhost:3000/news?${params.toString()}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch news');
    }

    return response.json();
}

export interface EventItem {
    id: string;
    symbol: string;
    type: 'liquidation' | 'large_trade' | 'funding' | 'price_alert';
    side?: 'long' | 'short';
    price?: number;
    quantity?: number;
    value?: number;
    timestamp: number;
    description?: string;
}

export interface EventsResponse {
    items: EventItem[];
    total?: number;
}

export async function getEvents({
    symbol,
    limit = 20,
    lang,
}: {
    symbol: string;
    limit?: number;
    lang?: string;
}): Promise<EventsResponse> {
    const params = new URLSearchParams();
    params.set('symbol', symbol);
    params.set('limit', String(limit));
    if (lang) params.set('lang', lang);

    const response = await fetch(
        `http://localhost:3000/news/events?${params.toString()}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch events');
    }

    return response.json();
}

export interface FuturesSymbol {
    symbol: string;
    pair: string;
    contractType: string;
    status: string;
    baseAsset: string;
    quoteAsset: string;
    marginAsset: string;
    pricePrecision: number;
    quantityPrecision: number;
    deliveryDate?: number;
    onboardDate?: number;
}

export interface FuturesSymbolsResponse {
    symbols: FuturesSymbol[];
    total: number;
    fetchedAt: string;
}

export async function fetchFuturesSymbols(): Promise<FuturesSymbolsResponse> {
    const response = await fetch(
        `http://localhost:3000/futures-symbols/fetch`,
        { method: 'POST' },
    );

    if (!response.ok) {
        throw new Error('Failed to fetch futures symbols');
    }

    return response.json();
}

export async function getStoredFuturesSymbols(): Promise<FuturesSymbolsResponse | { message: string }> {
    const response = await fetch(
        `http://localhost:3000/futures-symbols`,
    );

    if (!response.ok) {
        throw new Error('Failed to get stored futures symbols');
    }

    return response.json();
}
