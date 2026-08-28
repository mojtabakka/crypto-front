import { useFetchFuturesSymbols } from '../hooks/useFuturesSymbols';
import { useI18n } from '../i18n';
import { Button } from './Button';

export function FuturesSymbolsButton() {
    const { isRTL } = useI18n();
    const { mutate, isPending, isSuccess, data } = useFetchFuturesSymbols();

    return (
        <div className="futures-symbols-widget">
            <Button
                variant="secondary"
                size="md"
                onClick={() => mutate()}
                disabled={isPending}
                icon={isPending ? '⏳' : isSuccess ? '✅' : '🔄'}
            >
                {isRTL
                    ? 'دریافت لیست ارزها'
                    : 'Fetch Futures Symbols'}
            </Button>

            {isSuccess && data && (
                <span className="futures-symbols-count">
                    {data.total} {isRTL ? 'ارز' : 'symbols'}
                </span>
            )}
        </div>
    );
}
