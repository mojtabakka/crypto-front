import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchFuturesSymbols, getStoredFuturesSymbols } from '../api/market/market';
import type { ExchangeName } from '../api/market/market';

export function useFetchFuturesSymbols(exchange?: ExchangeName) {
    return useMutation({
        mutationFn: () => fetchFuturesSymbols(exchange),
    });
}

export function useStoredFuturesSymbols(exchange?: ExchangeName) {
    return useQuery({
        queryKey: ['futures-symbols', exchange],
        queryFn: () => getStoredFuturesSymbols(exchange),
        staleTime: 5 * 60 * 1000,
    });
}
