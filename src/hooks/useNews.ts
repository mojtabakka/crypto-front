import {
    useQuery,
} from '@tanstack/react-query';
import { getNews } from '../api/market/market';

interface UseNewsParams {
    symbol?: string;
    lang?: string;
    limit?: number;
}

export function useNews({
    symbol,
    lang,
    limit,
}: UseNewsParams) {
    return useQuery({
        queryKey: [
            'news',
            symbol,
            lang,
            limit,
        ],

        queryFn: () =>
            getNews({
                symbol,
                lang,
                limit,
            }),

        staleTime: 0,
        gcTime: 0,
    });
}
