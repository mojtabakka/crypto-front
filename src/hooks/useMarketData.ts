import {
    useQuery,
} from '@tanstack/react-query';
import { getMarketData } from '../api/market/market';


interface UseMarketDataParams {
    symbol: string;
    interval: string;
    range: string;
}

export function useMarketData({
    symbol,
    interval,
    range,
}: UseMarketDataParams) {
    return useQuery({
        queryKey: [
            'market',
            symbol,
            interval,
            range,
        ],

        queryFn: () =>
            getMarketData({
                symbol,
                interval,
                range,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}