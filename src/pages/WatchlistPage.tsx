import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import './WatchlistPage.css';

interface WatchlistItem {
    id: number;
    symbol: string;
    note: string | null;
    createdAt: string;
}

async function fetchWatchlist(): Promise<WatchlistItem[]> {
    const response = await fetch('http://localhost:3000/watchlist');
    if (!response.ok) throw new Error('Failed to fetch watchlist');
    return response.json();
}

async function removeFromWatchlist(symbol: string): Promise<void> {
    const response = await fetch(`http://localhost:3000/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from watchlist');
}

interface WatchlistPageProps {
    onSelectSymbol: (symbol: string) => void;
    onBack: () => void;
}

export function WatchlistPage({ onSelectSymbol, onBack }: WatchlistPageProps) {
    const { isRTL } = useI18n();
    const queryClient = useQueryClient();

    const { data: watchlist, isLoading } = useQuery({
        queryKey: ['watchlist'],
        queryFn: fetchWatchlist,
    });

    const removeMutation = useMutation({
        mutationFn: removeFromWatchlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });

    const handleRemove = (symbol: string) => {
        removeMutation.mutate(symbol);
    };

    return (
        <div className="watchlist-page">
            <div className="watchlist-header">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    ← {isRTL ? 'بازگشت' : 'Back'}
                </Button>
                <h2>⭐ {isRTL ? 'واچ لیست' : 'Watchlist'}</h2>
                <div></div>
            </div>

            {isLoading && <Loading isRTL={isRTL} compact />}

            {watchlist && watchlist.length > 0 && (
                <div className="watchlist-content">
                    {watchlist.map((item) => (
                        <div key={item.id} className="watchlist-item" onClick={() => onSelectSymbol(item.symbol)}>
                            <div className="watchlist-symbol">{item.symbol}</div>
                            {item.note && <div className="watchlist-note">{item.note}</div>}
                            <div className="watchlist-date">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(item.symbol);
                                }}
                            >
                                ✕
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {watchlist && watchlist.length === 0 && (
                <p className="watchlist-empty">
                    {isRTL ? 'واچ لیست خالی است' : 'Watchlist is empty'}
                </p>
            )}
        </div>
    );
}
