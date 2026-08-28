import {
    useQuery,
} from '@tanstack/react-query';
import { getMarketSignal } from '../api/market/market';

interface UseMarketSignalParams {
    symbol: string;
}

export function useMarketSignal({
    symbol,
}: UseMarketSignalParams) {
    return useQuery({
        queryKey: [
            'market-signal',
            symbol,
        ],

        queryFn: () =>
            getMarketSignal({
                symbol,
            }),

        staleTime: 0,
        gcTime: 0,
        refetchInterval: 30 * 1000,
    });
}
