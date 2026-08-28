import {
    useQuery,
} from '@tanstack/react-query';
import { getOpenInterest } from '../api/market/market';

interface UseOpenInterestParams {
    symbol: string;
    range: string;
}

export function useOpenInterest({
    symbol,
    range,
}: UseOpenInterestParams) {
    return useQuery({
        queryKey: [
            'open-interest',
            symbol,
            range,
        ],

        queryFn: () =>
            getOpenInterest({
                symbol,
                range,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}