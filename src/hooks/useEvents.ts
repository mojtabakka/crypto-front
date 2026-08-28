import {
    useQuery,
} from '@tanstack/react-query';
import { getEvents } from '../api/market/market';

interface UseEventsParams {
    symbol: string;
    limit?: number;
    lang?: string;
}

export function useEvents({
    symbol,
    limit = 20,
    lang,
}: UseEventsParams) {
    return useQuery({
        queryKey: [
            'events',
            symbol,
            limit,
            lang,
        ],

        queryFn: () =>
            getEvents({
                symbol,
                limit,
                lang,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}
