import {
    useQuery,
} from '@tanstack/react-query';
import { getMarketSignal } from '../api/market/market';
import type { ExchangeName } from '../api/market/market';

interface UseMarketSignalParams {
    symbol: string;
    exchange?: ExchangeName;
}

export function useMarketSignal({
    symbol,
    exchange,
}: UseMarketSignalParams) {
    return useQuery({
        queryKey: [
            'market-signal',
            symbol,
            exchange,
        ],

        queryFn: () =>
            getMarketSignal({
                symbol,
                exchange,
            }),

        staleTime: 0,
        gcTime: 0,
        refetchInterval: 30 * 1000,
    });
}
