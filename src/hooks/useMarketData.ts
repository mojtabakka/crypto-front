import {
    useQuery,
} from '@tanstack/react-query';
import { getMarketData } from '../api/market/market';
import type { ExchangeName } from '../api/market/market';

interface UseMarketDataParams {
    symbol: string;
    interval: string;
    range: string;
    exchange?: ExchangeName;
}

export function useMarketData({
    symbol,
    interval,
    range,
    exchange = 'BINANCE',
}: UseMarketDataParams) {
    return useQuery({
        queryKey: [
            'market',
            symbol,
            interval,
            range,
            exchange,
        ],

        queryFn: () =>
            getMarketData({
                symbol,
                interval,
                range,
                exchange,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}