export type Locale = 'fa' | 'en';

export interface Translation {
  app: {
    title: string;
    subtitle: string;
  };
  controls: {
    symbol: string;
    interval: string;
    range: string;
    search: string;
  };
  summary: {
    symbol: string;
    timeframe: string;
    range: string;
    totalVolume: string;
  };
  chart: {
    volume: string;
    bar: string;
    line: string;
    area: string;
  };
  openInterest: {
    title: string;
    badge: string;
  };
  fundingRate: {
    title: string;
    badge: string;
  };
  signal: {
    title: string;
    finalScore: string;
    loading: string;
    noData: string;
    error: string;
    timeframesTitle: string;
    priceChange: string;
    oiChange: string;
    volumeRatio: string;
    fundingRate: string;
    positioning: string;
    priceOiScore: string;
    volumeScore: string;
    fundingScore: string;
    liquidationScore: string;
    totalScore: string;
  };
  error: {
    marketData: string;
    openInterest: string;
    fundingRate: string;
  };
  signals: {
    LONG: string;
    SHORT: string;
    NEUTRAL: string;
  };
  positioning: {
    LONG_BUILDUP: string;
    SHORT_COVERING: string;
    LONG_LIQUIDATION: string;
    SHORT_BUILDUP: string;
  };
  news: {
    title: string;
    badge: string;
    readMore: string;
  };
}
