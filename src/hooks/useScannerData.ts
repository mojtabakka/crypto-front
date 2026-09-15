import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { ExchangeName } from '../api/market/market';
import type { FakeSignalScanResult, FundingExtremeResult, LiquidationClustersResult, PullbackSignal, ReapproachSignal, ScannerTab, StrongSignalResult, TrustedLongShortResult, SymbolSignal, DojiCandlesResult } from '../types/market-scanner';

function scannerUrl(path: string, exchange: ExchangeName, query = ''): string {
  const suffix = query ? `&${query}` : '';
  return `http://localhost:3000/market-scanner${path ? `/${path}` : ''}?exchange=${exchange}${suffix}`;
}

async function fetchLongs(exchange: ExchangeName): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
  const response = await fetch(scannerUrl('', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [] };
  }
  return response.json();
}

async function fetchReliableLongs(exchange: ExchangeName): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
  const response = await fetch(scannerUrl('reliable', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [] };
  }
  return response.json();
}

async function fetchShortsCombined(exchange: ExchangeName): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
    const response = await fetch(scannerUrl('shorts', exchange, 'timeframe=combined&limit=30'));
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Scanner request failed');
        return { longs: [], shorts: [] };
    }
    return response.json();
}

async function fetchShorts4h(exchange: ExchangeName): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
    const response = await fetch(scannerUrl('shorts', exchange, 'timeframe=4h&limit=30'));
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Scanner request failed');
        return { longs: [], shorts: [] };
    }
    return response.json();
}

async function fetchShorts1h(exchange: ExchangeName): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
    const response = await fetch(scannerUrl('shorts', exchange, 'timeframe=1h&limit=30'));
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Scanner request failed');
        return { longs: [], shorts: [] };
    }
    return response.json();
}

async function fetchShortsDaily(exchange: ExchangeName): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
    const response = await fetch(scannerUrl('shorts', exchange, 'timeframe=1d&limit=30'));
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Scanner request failed');
        return { longs: [], shorts: [] };
    }
    return response.json();
}

async function fetchFakeSignals(exchange: ExchangeName): Promise<FakeSignalScanResult> {
  const response = await fetch(scannerUrl('fake-signals', exchange, 'limit=50'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { risks: [], scanned: 0, duration: 0, timestamp: '' };
  }
  return response.json();
}

async function fetchPullbacks(exchange: ExchangeName): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[] }> {
  const response = await fetch(scannerUrl('pullbacks', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [] };
  }
  return response.json();
}

async function fetchReapproach(exchange: ExchangeName): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[] }> {
  const response = await fetch(scannerUrl('reapproach', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [] };
  }
  return response.json();
}

async function fetchWeeklyPullbacks(exchange: ExchangeName): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[] }> {
  const response = await fetch(scannerUrl('weekly-pullbacks', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [] };
  }
  return response.json();
}

async function fetchWeeklyReapproach(exchange: ExchangeName): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[] }> {
  const response = await fetch(scannerUrl('weekly-reapproach', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [] };
  }
  return response.json();
}

async function fetchWeeklyAboveEma50(exchange: ExchangeName): Promise<{ symbols: Array<{ symbol: string; priceVsEma50: number | null; currentPrice: number; ema50: number | null }> }> {
  const response = await fetch(scannerUrl('weekly-above-ema50', exchange, 'limit=30'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { symbols: [] };
  }
  return response.json();
}

async function fetchDailyAboveEma50Long(exchange: ExchangeName): Promise<{ symbols: Array<{ symbol: string; priceVsEma50: number | null; currentPrice: number; ema50: number | null; score: number; signal: string; confidence: number; priceChange: number; oiChange: number; fundingRate: number }> }> {
  const response = await fetch(scannerUrl('daily-above-ema50-long', exchange, 'limit=20'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { symbols: [] };
  }
  return response.json();
}

async function fetchWeeklyAboveEma50Long(exchange: ExchangeName): Promise<{ symbols: Array<{ symbol: string; priceVsEma50: number | null; currentPrice: number; ema50: number | null; score: number; signal: string; confidence: number; priceChange: number; oiChange: number; fundingRate: number }> }> {
  const response = await fetch(scannerUrl('weekly-above-ema50-long', exchange, 'limit=20'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { symbols: [] };
  }
  return response.json();
}

async function fetch4hPullbacks(exchange: ExchangeName): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[]; all: PullbackSignal[] }> {
  const response = await fetch(scannerUrl('4h-pullbacks', exchange, 'limit=20'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [], all: [] };
  }
  return response.json();
}

async function fetchMonthlyPullbacks(exchange: ExchangeName): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[]; all: PullbackSignal[] }> {
  const response = await fetch(scannerUrl('monthly-pullbacks', exchange, 'limit=20'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [], all: [] };
  }
  return response.json();
}

async function fetch4hReapproach(exchange: ExchangeName): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[]; all: ReapproachSignal[] }> {
  const response = await fetch(scannerUrl('4h-reapproach', exchange, 'limit=20'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [], all: [] };
  }
  return response.json();
}

async function fetchMonthlyReapproach(exchange: ExchangeName): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[]; all: ReapproachSignal[] }> {
  const response = await fetch(scannerUrl('monthly-reapproach', exchange, 'limit=20'));
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
    return { longs: [], shorts: [], all: [] };
  }
  return response.json();
}

async function fetchEma21Pullbacks(exchange: ExchangeName, interval: '1d' | '4h' | '1w'): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[]; all: PullbackSignal[] }> {
  const response = await fetch(scannerUrl('pullbacks-ema21', exchange, `limit=30&interval=${interval}`));
  if (!response.ok) throw new Error(`Failed to fetch EMA21 ${interval} pullbacks`);
  return response.json();
}

async function fetchEma21Reapproach(exchange: ExchangeName, interval: '1d' | '4h' | '1w'): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[]; all: ReapproachSignal[] }> {
  const response = await fetch(scannerUrl('reapproach-ema21', exchange, `limit=30&interval=${interval}`));
  if (!response.ok) throw new Error(`Failed to fetch EMA21 ${interval} reapproach`);
  return response.json();
}

async function fetchFundingExtreme(exchange: ExchangeName): Promise<FundingExtremeResult> {
    const response = await fetch(scannerUrl('funding-extreme', exchange, 'limit=30'));
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      toast.error(err.message || 'Scanner request failed');
      return { symbols: [], scanned: 0, duration: 0, timestamp: '' };
    }
    return response.json();
  }

async function fetchStrongSignals(exchange: ExchangeName): Promise<StrongSignalResult> {
    const response = await fetch(scannerUrl('strong', exchange, 'limit=30'));
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      toast.error(err.message || 'Scanner request failed');
      return { longs: [], shorts: [], scanned: 0, duration: 0, timestamp: '' };
    }
    return response.json();
  }

async function fetchTrustedLongShort(exchange: ExchangeName): Promise<TrustedLongShortResult> {
    const response = await fetch(scannerUrl('trusted-long-short', exchange, 'limit=30'));
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      toast.error(err.message || 'Scanner request failed');
      return { longs: [], shorts: [], scanned: 0, duration: 0, timestamp: '' };
    }
    return response.json();
  }

async function fetchDojiCandles(exchange: ExchangeName): Promise<DojiCandlesResult> {
    const response = await fetch(scannerUrl('doji-candles', exchange, 'limit=30'));
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      toast.error(err.message || 'Scanner request failed');
      return { candles: [], bullishCount: 0, bearishCount: 0, scanned: 0, duration: 0, timestamp: '' };
    }
    return response.json();
  }

async function fetchLiquidationClusters(exchange: ExchangeName): Promise<LiquidationClustersResult> {
    const response = await fetch(scannerUrl('liquidation-clusters', exchange, 'limit=30'));
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      toast.error(err.message || 'Scanner request failed');
      return { exchange: exchange, clusters: [], scanned: 0, duration: 0, timestamp: '' };
    }
    return response.json();
  }

async function addToWatchlist(symbol: string): Promise<void> {
  const response = await fetch('http://localhost:3000/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    toast.error(err.message || 'Scanner request failed');
  }
}

export interface UseScannerDataOptions {
  activeTab: ScannerTab | null;
  useReliableSignals: boolean;
  exchange: ExchangeName;
}

export function useScannerData(options: UseScannerDataOptions) {
  const { activeTab, exchange } = options;
  const queryClient = useQueryClient();

  const [extraWatchlist, setExtraWatchlist] = useState<Set<string>>(new Set());

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/watchlist');
      if (!res.ok) return [];
      return res.json();
    },
  });

  const baseWatchlist = useMemo<Set<string>>(() => new Set(watchlistData?.map((item: { symbol: string }) => item.symbol) ?? []), [watchlistData]);
  const watchlistSymbols = useMemo<Set<string>>(() => new Set([...baseWatchlist, ...extraWatchlist]), [baseWatchlist, extraWatchlist]);

  const addMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: (_, symbol) => {
      setExtraWatchlist(prev => new Set([...prev, symbol]));
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const handleAddToWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    addMutation.mutate(symbol);
  };

  const { data: signalsData, isLoading: signalsLoading, refetch: refetchSignals } = useQuery({
    queryKey: ['signals', exchange],
    queryFn: () => fetchLongs(exchange),
    enabled: activeTab === 'signals' && !options.useReliableSignals,
    staleTime: 60000,
  });

  const { data: reliableSignalsData, isLoading: reliableSignalsLoading, refetch: refetchReliableSignals } = useQuery({
    queryKey: ['reliable-signals', exchange],
    queryFn: () => fetchReliableLongs(exchange),
    enabled: activeTab === 'signals' && options.useReliableSignals,
    staleTime: 60000,
  });

  const [shortTimeframe, setShortTimeframe] = useState<'4h' | '1h' | '1d' | 'combined'>('combined');

  const { data: fakeSignalsData, isLoading: fakeSignalsLoading } = useQuery({
    queryKey: ['fake-signals', exchange],
    queryFn: () => fetchFakeSignals(exchange),
    enabled: activeTab === 'signals',
    staleTime: 120000,
  });

  const { data: fundingExtremeData, isLoading: fundingExtremeLoading, refetch: refetchFundingExtreme } = useQuery({
    queryKey: ['funding-extreme', exchange],
    queryFn: () => fetchFundingExtreme(exchange),
    enabled: activeTab === 'funding-extreme',
    staleTime: 60000,
  });

  const { data: strongData, isLoading: strongLoading, refetch: refetchStrong } = useQuery({
    queryKey: ['strong', exchange],
    queryFn: () => fetchStrongSignals(exchange),
    enabled: activeTab === 'strong',
    staleTime: 60000,
  });

  const { data: trustedLongShortData, isLoading: trustedLongShortLoading, refetch: refetchTrustedLongShort } = useQuery({
    queryKey: ['trusted-long-short', exchange],
    queryFn: () => fetchTrustedLongShort(exchange),
    enabled: activeTab === 'trusted-long-short',
    staleTime: 60000,
  });

  const { data: dojiCandlesData, isLoading: dojiCandlesLoading, refetch: refetchDojiCandles } = useQuery({
    queryKey: ['doji-candles', exchange],
    queryFn: () => fetchDojiCandles(exchange),
    enabled: activeTab === 'doji-candles',
    staleTime: 60000,
  });

  const { data: liquidationClustersData, isLoading: liquidationClustersLoading, refetch: refetchLiquidationClusters } = useQuery({
    queryKey: ['liquidation-clusters', exchange],
    queryFn: () => fetchLiquidationClusters(exchange),
    enabled: activeTab === 'liquidation-clusters',
    staleTime: 60000,
  });

  const { data: shortsCombinedData, isLoading: shortsCombinedLoading, refetch: refetchShortsCombined } = useQuery({
    queryKey: ['shorts-combined', exchange],
    queryFn: () => fetchShortsCombined(exchange),
    enabled: activeTab === 'signals',
    staleTime: 60000,
  });

  const { data: shorts4hData, isLoading: shorts4hLoading, refetch: refetchShorts4h } = useQuery({
    queryKey: ['shorts-4h', exchange],
    queryFn: () => fetchShorts4h(exchange),
    enabled: activeTab === 'signals',
    staleTime: 60000,
  });

  const { data: shorts1hData, isLoading: shorts1hLoading, refetch: refetchShorts1h } = useQuery({
    queryKey: ['shorts-1h', exchange],
    queryFn: () => fetchShorts1h(exchange),
    enabled: activeTab === 'signals',
    staleTime: 60000,
  });

  const { data: shortsDailyData, isLoading: shortsDailyLoading, refetch: refetchShortsDaily } = useQuery({
    queryKey: ['shorts-daily', exchange],
    queryFn: () => fetchShortsDaily(exchange),
    enabled: activeTab === 'signals',
    staleTime: 60000,
  });

  const handleShortTimeframeChange = (tf: '4h' | '1h' | '1d' | 'combined') => {
    setShortTimeframe(tf);
    if (tf === 'combined') refetchShortsCombined();
    if (tf === '4h') refetchShorts4h();
    if (tf === '1h') refetchShorts1h();
    if (tf === '1d') refetchShortsDaily();
  };

  const { data: pullbacksData, isLoading: pullbacksLoading, refetch: refetchPullbacks } = useQuery({
    queryKey: ['pullbacks', exchange],
    queryFn: () => fetchPullbacks(exchange),
    enabled: activeTab === 'pullbacks',
    staleTime: 60000,
  });

  const { data: reapproachData, isLoading: reapproachLoading, refetch: refetchReapproach } = useQuery({
    queryKey: ['reapproach', exchange],
    queryFn: () => fetchReapproach(exchange),
    enabled: activeTab === 'reapproach',
    staleTime: 60000,
  });

  const { data: weeklyPullbacksData, isLoading: weeklyPullbacksLoading, refetch: refetchWeeklyPullbacks } = useQuery({
    queryKey: ['weekly-pullbacks', exchange],
    queryFn: () => fetchWeeklyPullbacks(exchange),
    enabled: activeTab === 'weekly-pullbacks',
    staleTime: 120000,
  });

  const { data: weeklyReapproachData, isLoading: weeklyReapproachLoading, refetch: refetchWeeklyReapproach } = useQuery({
    queryKey: ['weekly-reapproach', exchange],
    queryFn: () => fetchWeeklyReapproach(exchange),
    enabled: activeTab === 'weekly-reapproach',
    staleTime: 120000,
  });

  const { data: weeklyAboveEma50Data, isLoading: weeklyAboveEma50Loading, refetch: refetchWeeklyAboveEma50 } = useQuery({
    queryKey: ['weekly-above-ema50', exchange],
    queryFn: () => fetchWeeklyAboveEma50(exchange),
    enabled: activeTab === 'weekly-above-ema50',
    staleTime: 120000,
  });

  const { data: dailyAboveEma50LongData, isLoading: dailyAboveEma50LongLoading, refetch: refetchDailyAboveEma50Long } = useQuery({
    queryKey: ['daily-above-ema50-long', exchange],
    queryFn: () => fetchDailyAboveEma50Long(exchange),
    enabled: activeTab === 'daily-above-ema50-long',
    staleTime: 120000,
  });

  const { data: weeklyAboveEma50LongData, isLoading: weeklyAboveEma50LongLoading, refetch: refetchWeeklyAboveEma50Long } = useQuery({
    queryKey: ['weekly-above-ema50-long', exchange],
    queryFn: () => fetchWeeklyAboveEma50Long(exchange),
    enabled: activeTab === 'weekly-above-ema50-long',
    staleTime: 120000,
  });

  const { data: pullbacks4hData, isLoading: pullbacks4hLoading, refetch: refetchPullbacks4h } = useQuery({
    queryKey: ['4h-pullbacks', exchange],
    queryFn: () => fetch4hPullbacks(exchange),
    enabled: activeTab === '4h-pullbacks',
    staleTime: 120000,
  });

  const { data: monthlyPullbacksData, isLoading: monthlyPullbacksLoading, refetch: refetchMonthlyPullbacks } = useQuery({
    queryKey: ['monthly-pullbacks', exchange],
    queryFn: () => fetchMonthlyPullbacks(exchange),
    enabled: activeTab === 'monthly-pullbacks',
    staleTime: 300000,
  });

  const { data: monthlyReapproachData, isLoading: monthlyReapproachLoading, refetch: refetchMonthlyReapproach } = useQuery({
    queryKey: ['monthly-reapproach', exchange],
    queryFn: () => fetchMonthlyReapproach(exchange),
    enabled: activeTab === 'monthly-reapproach',
    staleTime: 300000,
  });

  const { data: reapproach4hData, isLoading: reapproach4hLoading, refetch: refetchReapproach4h } = useQuery({
    queryKey: ['4h-reapproach', exchange],
    queryFn: () => fetch4hReapproach(exchange),
    enabled: activeTab === '4h-reapproach',
    staleTime: 120000,
  });

  const { data: ema21DailyPullbackData, isLoading: ema21DailyPullbackLoading, refetch: refetchEma21DailyPullback } = useQuery({
    queryKey: ['ema21-daily-pullback', exchange],
    queryFn: () => fetchEma21Pullbacks(exchange, '1d'),
    enabled: activeTab === 'ema21-daily-pullback',
    staleTime: 300000,
  });

  const { data: ema21DailyReapproachData, isLoading: ema21DailyReapproachLoading, refetch: refetchEma21DailyReapproach } = useQuery({
    queryKey: ['ema21-daily-reapproach', exchange],
    queryFn: () => fetchEma21Reapproach(exchange, '1d'),
    enabled: activeTab === 'ema21-daily-reapproach',
    staleTime: 300000,
  });

  const { data: ema214hPullbackData, isLoading: ema214hPullbackLoading, refetch: refetchEma214hPullback } = useQuery({
    queryKey: ['ema21-4h-pullback', exchange],
    queryFn: () => fetchEma21Pullbacks(exchange, '4h'),
    enabled: activeTab === 'ema21-4h-pullback',
    staleTime: 180000,
  });

  const { data: ema214hReapproachData, isLoading: ema214hReapproachLoading, refetch: refetchEma214hReapproach } = useQuery({
    queryKey: ['ema21-4h-reapproach', exchange],
    queryFn: () => fetchEma21Reapproach(exchange, '4h'),
    enabled: activeTab === 'ema21-4h-reapproach',
    staleTime: 180000,
  });

  const { data: ema21WeeklyPullbackData, isLoading: ema21WeeklyPullbackLoading, refetch: refetchEma21WeeklyPullback } = useQuery({
    queryKey: ['ema21-weekly-pullback', exchange],
    queryFn: () => fetchEma21Pullbacks(exchange, '1w'),
    enabled: activeTab === 'ema21-weekly-pullback',
    staleTime: 600000,
  });

  const { data: ema21WeeklyReapproachData, isLoading: ema21WeeklyReapproachLoading, refetch: refetchEma21WeeklyReapproach } = useQuery({
    queryKey: ['ema21-weekly-reapproach', exchange],
    queryFn: () => fetchEma21Reapproach(exchange, '1w'),
    enabled: activeTab === 'ema21-weekly-reapproach',
    staleTime: 600000,
  });

  const     isLoading = signalsLoading || reliableSignalsLoading || pullbacksLoading || reapproachLoading || weeklyPullbacksLoading || weeklyReapproachLoading || weeklyAboveEma50Loading || dailyAboveEma50LongLoading || weeklyAboveEma50LongLoading || pullbacks4hLoading || monthlyPullbacksLoading || monthlyReapproachLoading || reapproach4hLoading || ema21DailyPullbackLoading || ema21DailyReapproachLoading || ema214hPullbackLoading || ema214hReapproachLoading || ema21WeeklyPullbackLoading || ema21WeeklyReapproachLoading || liquidationClustersLoading || trustedLongShortLoading || dojiCandlesLoading;

  const handleRefresh = () => {
    if (activeTab === 'signals') {
      if (options.useReliableSignals) {
        refetchReliableSignals();
      } else {
        refetchSignals();
      }
    } else if (activeTab === 'pullbacks') {
      refetchPullbacks();
    } else if (activeTab === 'reapproach') {
      refetchReapproach();
    } else if (activeTab === 'weekly-pullbacks') {
      refetchWeeklyPullbacks();
    } else if (activeTab === 'weekly-reapproach') {
      refetchWeeklyReapproach();
    } else if (activeTab === 'weekly-above-ema50') {
      refetchWeeklyAboveEma50();
    } else if (activeTab === 'daily-above-ema50-long') {
      refetchDailyAboveEma50Long();
    } else if (activeTab === '4h-pullbacks') {
      refetchPullbacks4h();
    } else if (activeTab === '4h-reapproach') {
      refetchReapproach4h();
    } else if (activeTab === 'monthly-pullbacks') {
      refetchMonthlyPullbacks();
    } else if (activeTab === 'monthly-reapproach') {
      refetchMonthlyReapproach();
    } else if (activeTab === 'ema21-daily-pullback') {
      refetchEma21DailyPullback();
    } else if (activeTab === 'ema21-daily-reapproach') {
      refetchEma21DailyReapproach();
    } else if (activeTab === 'ema21-4h-pullback') {
      refetchEma214hPullback();
    } else if (activeTab === 'ema21-4h-reapproach') {
      refetchEma214hReapproach();
    } else if (activeTab === 'ema21-weekly-pullback') {
      refetchEma21WeeklyPullback();
    } else if (activeTab === 'ema21-weekly-reapproach') {
      refetchEma21WeeklyReapproach();
    } else if (activeTab === 'funding-extreme') {
      refetchFundingExtreme();
    } else if (activeTab === 'strong') {
      refetchStrong();
    } else if (activeTab === 'doji-candles') {
      refetchDojiCandles();
    } else if (activeTab === 'trusted-long-short') {
      refetchTrustedLongShort();
    } else if (activeTab === 'liquidation-clusters') {
      refetchLiquidationClusters();
    } else {
      refetchWeeklyAboveEma50Long();
    }
  };

  const handleDownload = async () => {
    if (!activeTab) return;
    try {
      const res = await fetch(`http://localhost:3000/market-scanner/export?type=${activeTab}&exchange=${exchange}&limit=30`);
      if (!res.ok) throw new Error('Failed to export');
      const csv = await res.text();
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `signals-${activeTab}-${exchange}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return {
    activeTab,
    useReliableSignals: options.useReliableSignals,
    exchange,
    isLoading,
    signalsData,
    reliableSignalsData,
    fakeSignalsData,
    pullbacksData,
    reapproachData,
    weeklyPullbacksData,
    weeklyReapproachData,
    weeklyAboveEma50Data,
    dailyAboveEma50LongData,
    weeklyAboveEma50LongData,
    pullbacks4hData,
    monthlyPullbacksData,
    monthlyReapproachData,
    reapproach4hData,
    ema21DailyPullbackData,
    ema21DailyReapproachData,
    ema214hPullbackData,
    ema214hReapproachData,
    ema21WeeklyPullbackData,
    ema21WeeklyReapproachData,
    watchlistSymbols,
    handleAddToWatchlist,
    handleRefresh,
    handleDownload,
    signalsLoading,
    reliableSignalsLoading,
    fakeSignalsLoading,
    pullbacksLoading,
    reapproachLoading,
    weeklyPullbacksLoading,
    weeklyReapproachLoading,
    weeklyAboveEma50Loading,
    dailyAboveEma50LongLoading,
    weeklyAboveEma50LongLoading,
    pullbacks4hLoading,
    monthlyPullbacksLoading,
    monthlyReapproachLoading,
    reapproach4hLoading,
    ema21DailyPullbackLoading,
    ema21DailyReapproachLoading,
    ema214hPullbackLoading,
    ema214hReapproachLoading,
    ema21WeeklyPullbackLoading,
    ema21WeeklyReapproachLoading,
    refetchSignals,
    refetchReliableSignals,
    refetchPullbacks,
    refetchReapproach,
    refetchWeeklyPullbacks,
    refetchWeeklyReapproach,
    refetchWeeklyAboveEma50,
    refetchDailyAboveEma50Long,
    refetchWeeklyAboveEma50Long,
    refetchPullbacks4h,
    refetchMonthlyPullbacks,
    refetchMonthlyReapproach,
    refetchReapproach4h,
    refetchEma21DailyPullback,
    refetchEma21DailyReapproach,
    refetchEma214hPullback,
    refetchEma214hReapproach,
    refetchEma21WeeklyPullback,
    refetchEma21WeeklyReapproach,
    refetchFundingExtreme,
    refetchStrong,
    refetchTrustedLongShort,
    refetchDojiCandles,
    refetchLiquidationClusters,
    fundingExtremeData,
    fundingExtremeLoading,
    strongData,
    strongLoading,
    trustedLongShortData,
    trustedLongShortLoading,
    dojiCandlesData,
    dojiCandlesLoading,
    liquidationClustersData,
    liquidationClustersLoading,
    shortTimeframe,
    setShortTimeframe,
    handleShortTimeframeChange,
    shortsCombinedData,
    shorts4hData,
    shorts1hData,
    shortsDailyData,
    shortsCombinedLoading,
    shorts4hLoading,
    shorts1hLoading,
    shortsDailyLoading,
    dojiCandlesLoading,
  };
}
