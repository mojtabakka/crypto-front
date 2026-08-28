import {
    useQuery,
} from '@tanstack/react-query';
import { getFundingRate } from '../api/market/market';



export function useFundingRate({
    symbol,
    range,
}: {
    symbol: string;
    range: string;
}) {
    return useQuery({
        queryKey: [
            'funding-rate',
            symbol,
            range,
        ],

        queryFn: () =>
            getFundingRate({
                symbol,
                range,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}