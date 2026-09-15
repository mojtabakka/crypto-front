export const EXCHANGE_NAMES = [
    'BINANCE',
    'OKX',
    'BYBIT',
    'MEXC',
    'KUCOIN',
    'BINGX',
    'CRYPTOCOM',
    'TOOBIT',
    'LBANK',
    'ORBIT',
] as const;

export type ExchangeName = typeof EXCHANGE_NAMES[number];

export function isExchangeName(value: string | null): value is ExchangeName {
    return value !== null && EXCHANGE_NAMES.includes(value as ExchangeName);
}

export function getCurrentExchange(): ExchangeName {
    if (typeof window === 'undefined') return 'BINANCE';
    const saved = localStorage.getItem('selected_exchange');
    return isExchangeName(saved) ? saved : 'BINANCE';
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
    exchange,
}: {
    symbol: string;
    range: string;
    exchange?: ExchangeName;
}): Promise<OpenInterestData[]> {
    const selectedExchange = exchange ?? getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market/${symbol}/open-interest?range=${range}&exchange=${selectedExchange}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch open interest');
    }

    return response.json();
}

export async function getFundingRate({
    symbol,
    range,
    exchange,
}: {
    symbol: string;
    range: string;
    exchange?: ExchangeName;
}): Promise<FundingRateData[]> {
    const selectedExchange = exchange ?? getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market/${symbol}/funding-rate?range=${range}&exchange=${selectedExchange}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch funding rate');
    }

    return response.json();
}

export async function getMarketSignal({
    symbol,
    exchange,
}: {
    symbol: string;
    exchange?: ExchangeName;
}): Promise<MarketSignal> {
    const selectedExchange = exchange ?? getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/market-signal?symbol=${symbol}&exchange=${selectedExchange}`,
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

export async function fetchFuturesSymbols(exchange?: ExchangeName): Promise<FuturesSymbolsResponse> {
    const selectedExchange = exchange ?? getCurrentExchange();
    const response = await fetch(
        `http://localhost:3000/futures-symbols/fetch?exchange=${selectedExchange}`,
        { method: 'POST' },
    );

    if (!response.ok) {
        throw new Error('Failed to fetch futures symbols');
    }

    return response.json();
}

export async function getStoredFuturesSymbols(exchange?: ExchangeName): Promise<FuturesSymbolsResponse | { message: string }> {
  const selectedExchange = exchange ?? getCurrentExchange();
  const response = await fetch(
    `http://localhost:3000/futures-symbols?exchange=${selectedExchange}`,
  );

  if (!response.ok) {
    throw new Error('Failed to get stored futures symbols');
  }

  return response.json();
}

export async function getLiquidationClusters(exchange: ExchangeName, limit: number = 30): Promise<LiquidationClustersResult> {
  const selectedExchange = exchange ?? getCurrentExchange();
  const response = await fetch(
    `http://localhost:3000/market-scanner/liquidation-clusters?exchange=${selectedExchange}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch liquidation clusters');
  }

  return response.json();
}

export async function getTrustedLongShort(exchange: ExchangeName, limit: number = 30): Promise<TrustedLongShortResult> {
  const selectedExchange = exchange ?? getCurrentExchange();
  const response = await fetch(
    `http://localhost:3000/market-scanner/trusted-long-short?exchange=${selectedExchange}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch trusted long/short signals');
  }

  return response.json();
}

export async function getDojiCandles(exchange: ExchangeName, limit: number = 30): Promise<DojiCandlesResult> {
  const selectedExchange = exchange ?? getCurrentExchange();
  const response = await fetch(
    `http://localhost:3000/market-scanner/doji-candles?exchange=${selectedExchange}&limit=${limit}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch doji candles');
  }

  return response.json();
}
