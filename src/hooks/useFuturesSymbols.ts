import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchFuturesSymbols, getStoredFuturesSymbols } from '../api/market/market';

export function useFetchFuturesSymbols() {
    return useMutation({
        mutationFn: fetchFuturesSymbols,
    });
}

export function useStoredFuturesSymbols() {
    return useQuery({
        queryKey: ['futures-symbols'],
        queryFn: getStoredFuturesSymbols,
        staleTime: 5 * 60 * 1000,
    });
}
