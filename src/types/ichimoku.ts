export interface IchimokuConditions {
  priceAboveCloud: boolean;
  tenkanAboveKijun: boolean;
  chikouAbovePrice26: boolean;
  chikouClean: boolean;
  breakoutCandleClosed: boolean;
}

export interface IchimokuSignal {
  symbol: string;
  price: number;
  tenkan: number;
  kijun: number;
  spanA: number;
  spanB: number;
  chikou: number;
  signal: 'BUY' | 'NEUTRAL';
  conditions: IchimokuConditions;
  cloudTop: number;
  cloudBottom: number;
}

export interface IchimokuScanResult {
  timestamp: string;
  interval: string;
  totalScanned: number;
  matches: IchimokuSignal[];
}

export interface IchimokuScanParams {
  symbols?: string;
  limit?: number;
  interval?: string;
}

export interface IchimokuLaggingSpanSignal {
  symbol: string;
  price: number;
  chikouValue: number;
  crossCandleIndex: number;
  crossTime: number;
  crossPriceHigh: number;
  barsAgo: number;
  signal: 'BUY';
}

export interface IchimokuLaggingSpanScanResult {
  timestamp: string;
  interval: string;
  totalScanned: number;
  matches: IchimokuLaggingSpanSignal[];
}

export interface IchimokuLaggingSpanScanParams {
  symbols?: string;
  limit?: number;
  interval?: string;
}

export interface IchimokuCombinedSignal {
  symbol: string;
  price: number;
  tenkan: number;
  kijun: number;
  spanA: number;
  spanB: number;
  cloudTop: number;
  cloudBottom: number;
  chikouValue: number;
  crossPriceHigh: number;
  barsAgo: number;
  signal: 'BUY';
}

export interface IchimokuCombinedScanResult {
  timestamp: string;
  interval: string;
  totalScanned: number;
  matches: IchimokuCombinedSignal[];
}

export interface IchimokuCombinedScanParams {
  symbols?: string;
  limit?: number;
  interval?: string;
}

export interface IchimokuChikouPullbackSignal {
  symbol: string;
  price: number;
  tenkan: number;
  kijun: number;
  spanA: number;
  spanB: number;
  cloudTop: number;
  cloudBottom: number;
  chikouValue: number;
  breakoutLevel: number;
  barsSinceCross: number;
  pullbackDistancePct: number;
  signal: 'BUY';
  score: number;
  volumeRatio: number;
  oiChangePct: number;
  fundingRate: number;
  priceChangePct: number;
  marketCap: number;
  volume24h: number;
}

export interface IchimokuChikouPullbackScanResult {
  timestamp: string;
  interval: string;
  exchange: string;
  totalScanned: number;
  matches: IchimokuChikouPullbackSignal[];
}

export interface IchimokuChikouPullbackScanParams {
  symbols?: string;
  limit?: number;
  interval?: string;
  exchange?: string;
}
