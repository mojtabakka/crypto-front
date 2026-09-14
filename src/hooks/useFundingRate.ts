import {
    useQuery,
} from '@tanstack/react-query';
import { getFundingRate } from '../api/market/market';
import type { ExchangeName } from '../api/market/market';



export function useFundingRate({
    symbol,
    range,
    exchange,
}: {
    symbol: string;
    range: string;
    exchange?: ExchangeName;
}) {
    return useQuery({
        queryKey: [
            'funding-rate',
            symbol,
            range,
            exchange,
        ],

        queryFn: () =>
            getFundingRate({
                symbol,
                range,
                exchange,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}