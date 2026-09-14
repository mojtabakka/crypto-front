import {
    useQuery,
} from '@tanstack/react-query';
import { getOpenInterest } from '../api/market/market';

interface UseOpenInterestParams {
    symbol: string;
    range: string;
    exchange?: import('../api/market/market').ExchangeName;
}

export function useOpenInterest({
    symbol,
    range,
    exchange,
}: UseOpenInterestParams) {
    return useQuery({
        queryKey: [
            'open-interest',
            symbol,
            range,
            exchange,
        ],

        queryFn: () =>
            getOpenInterest({
                symbol,
                range,
                exchange,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}