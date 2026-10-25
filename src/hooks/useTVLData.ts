import { useQuery } from '@tanstack/react-query';
import { useExchange } from '../contexts/ExchangeContext';
import type { TVLScanResult, TVLAnalysisResult, TVLTab } from '../types/tvl-analysis';
import { 
  fetchTVLScan, 
  fetchTopOpportunities, 
  fetchTopByTVL, 
  fetchTopByGrowth, 
  fetchUndervalued, 
  fetchBlueChips, 
  fetchMultiChain 
} from '../api/tvl/tvl';

export function useTVLData(activeTab: TVLTab | null) {
  const { exchange } = useExchange();

  const scanQuery = useQuery<TVLScanResult>({
    queryKey: ['tvl-scan', exchange],
    queryFn: () => fetchTVLScan(exchange),
    enabled: !!activeTab,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: 2,
  });

  const opportunitiesQuery = useQuery<TVLAnalysisResult[]>({
    queryKey: ['tvl-opportunities', exchange],
    queryFn: () => fetchTopOpportunities(exchange, 20),
    enabled: activeTab === 'top-opportunities',
    staleTime: 300000,
    gcTime: 600000,
    retry: 2,
  });

  const topByTVLQuery = useQuery<TVLScanResult>({
    queryKey: ['tvl-top-by-tvl', exchange],
    queryFn: () => fetchTopByTVL(exchange, 20),
    enabled: activeTab === 'top-by-tvl',
    staleTime: 300000,
    gcTime: 600000,
    retry: 2,
  });

  const topByGrowthQuery = useQuery<TVLScanResult>({
    queryKey: ['tvl-top-by-growth', exchange],
    queryFn: () => fetchTopByGrowth(exchange, 20),
    enabled: activeTab === 'top-by-growth',
    staleTime: 300000,
    gcTime: 600000,
    retry: 2,
  });

  const undervaluedQuery = useQuery<TVLScanResult>({
    queryKey: ['tvl-undervalued', exchange],
    queryFn: () => fetchUndervalued(exchange, 20),
    enabled: activeTab === 'undervalued',
    staleTime: 300000,
    gcTime: 600000,
    retry: 2,
  });

  const blueChipsQuery = useQuery<TVLScanResult>({
    queryKey: ['tvl-blue-chips', exchange],
    queryFn: () => fetchBlueChips(exchange, 20),
    enabled: activeTab === 'blue-chips',
    staleTime: 300000,
    gcTime: 600000,
    retry: 2,
  });

  const multiChainQuery = useQuery<TVLScanResult>({
    queryKey: ['tvl-multi-chain', exchange],
    queryFn: () => fetchMultiChain(exchange, 20),
    enabled: activeTab === 'multi-chain',
    staleTime: 300000,
    gcTime: 600000,
    retry: 2,
  });

  const getCurrentData = (): TVLAnalysisResult[] => {
    if (!activeTab) return [];
    
    switch (activeTab) {
      case 'top-opportunities':
        return opportunitiesQuery.data ?? [];
      case 'top-by-tvl':
        return topByTVLQuery.data?.topByTVL ?? [];
      case 'top-by-growth':
        return topByGrowthQuery.data?.topByGrowth ?? [];
      case 'undervalued':
        return undervaluedQuery.data?.undervalued ?? [];
      case 'blue-chips':
        return blueChipsQuery.data?.blueChips ?? [];
      case 'multi-chain':
        return multiChainQuery.data?.multiChain ?? [];
      default:
        return scanQuery.data?.allAnalyzed ?? [];
    }
  };

  const isLoading = 
    scanQuery.isLoading ||
    opportunitiesQuery.isLoading ||
    topByTVLQuery.isLoading ||
    topByGrowthQuery.isLoading ||
    undervaluedQuery.isLoading ||
    blueChipsQuery.isLoading ||
    multiChainQuery.isLoading;

  const isError = 
    scanQuery.isError ||
    opportunitiesQuery.isError ||
    topByTVLQuery.isError ||
    topByGrowthQuery.isError ||
    undervaluedQuery.isError ||
    blueChipsQuery.isError ||
    multiChainQuery.isError;

  const error = 
    scanQuery.error ||
    opportunitiesQuery.error ||
    topByTVLQuery.error ||
    topByGrowthQuery.error ||
    undervaluedQuery.error ||
    blueChipsQuery.error ||
    multiChainQuery.error;

  const refetch = () => {
    scanQuery.refetch();
    opportunitiesQuery.refetch();
    topByTVLQuery.refetch();
    topByGrowthQuery.refetch();
    undervaluedQuery.refetch();
    blueChipsQuery.refetch();
    multiChainQuery.refetch();
  };

  return {
    data: getCurrentData(),
    isLoading,
    isError,
    error,
    refetch,
    scanData: scanQuery.data,
  };
}