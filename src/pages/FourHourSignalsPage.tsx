import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import './FourHourSignalsPage.css';

interface FourHourSignal {
  id: number;
  symbol: string;
  signalType: 'PULLBACK' | 'REAPPROACH';
  direction: 'BULLISH' | 'BEARISH';
  score: number;
  priceChange: number | null;
  oiChange: number | null;
  touchCount: number;
  priceVsEma50: number | null;
  currentPrice: number;
  ema50: number | null;
  currentDistance: number | null;
  breakoutDay: string | null;
  createdAt: string;
}

interface SignalsResponse {
  signals: FourHourSignal[];
  lastUpdate: string | null;
  totalCount: number;
}

async function fetchSignals(): Promise<SignalsResponse> {
  const response = await fetch('http://localhost:3000/four-hour-signals');
  if (!response.ok) throw new Error('Failed to fetch signals');
  return response.json();
}

interface FourHourSignalsPageProps {
  onSelectSymbol: (symbol: string) => void;
  onBack: () => void;
}

export function FourHourSignalsPage({
  onSelectSymbol,
  onBack,
}: FourHourSignalsPageProps) {
  const { isRTL } = useI18n();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['four-hour-signals'],
    queryFn: fetchSignals,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 300000,
  });

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="four-hour-signals-page">
      <div className="signals-header">
        <button onClick={onBack} className="back-btn">
          ← {isRTL ? 'بازگشت' : 'Back'}
        </button>
        <h2>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ verticalAlign: 'middle', marginRight: '8px' }}
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          {isRTL ? 'سیگنال‌های ۴ ساعته' : '4-Hour Signals'}
        </h2>
        <button
          onClick={() => refetch()}
          className="refresh-btn"
          disabled={isLoading}
        >
          🔄
        </button>
      </div>

      {data?.lastUpdate && (
        <div className="last-update">
          {isRTL
            ? `آخرین بروزرسانی: ${formatTime(data.lastUpdate)}`
            : `Last update: ${formatTime(data.lastUpdate)}`}
        </div>
      )}

      {isLoading && <Loading isRTL={isRTL} />}

      {isError && (
        <div className="error-state">
          <span>⚠️</span>
          <span>
            {isRTL ? 'خطا در بارگذاری' : 'Failed to load'}
          </span>
        </div>
      )}

      {data && data.signals.length > 0 && (
        <div className="signals-table-container">
          <table className="signals-table">
            <thead>
              <tr>
                <th>{isRTL ? 'ارز' : 'Symbol'}</th>
                <th>{isRTL ? 'نوع' : 'Type'}</th>
                <th>{isRTL ? 'جهت' : 'Direction'}</th>
                <th>{isRTL ? 'امتیاز' : 'Score'}</th>
                <th>{isRTL ? 'تغییر قیمت' : 'Price %'}</th>
                <th>{isRTL ? 'تغییر OI' : 'OI %'}</th>
                <th>{isRTL ? 'فاصله از EMA' : 'vs EMA50'}</th>
              </tr>
            </thead>
            <tbody>
              {data.signals.map((signal) => (
                <tr
                  key={signal.id}
                  onClick={() => onSelectSymbol(signal.symbol)}
                  className={`signal-row ${signal.direction.toLowerCase()}`}
                >
                  <td className="symbol-cell">{signal.symbol}</td>
                  <td>
                    <span
                      className={`badge ${signal.signalType.toLowerCase()}`}
                    >
                      {signal.signalType === 'PULLBACK'
                        ? isRTL
                          ? 'پولبک'
                          : 'Pullback'
                        : isRTL
                          ? 'برخورد'
                          : 'Reapproach'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${signal.direction.toLowerCase()}`}
                    >
                      {signal.direction === 'BULLISH'
                        ? isRTL
                          ? '🟢 صعودی'
                          : '🟢 Bull'
                        : isRTL
                          ? '🔴 نزولی'
                          : '🔴 Bear'}
                    </span>
                  </td>
                  <td className="score-cell">
                    {Number(signal.score).toFixed(0)}
                  </td>
                  <td
                    className={
                      signal.priceChange && signal.priceChange >= 0
                        ? 'pos'
                        : 'neg'
                    }
                  >
                    {signal.priceChange !== null
                      ? `${signal.priceChange > 0 ? '+' : ''}${Number(signal.priceChange).toFixed(2)}%`
                      : '-'}
                  </td>
                  <td
                    className={
                      signal.oiChange && signal.oiChange >= 0
                        ? 'pos'
                        : 'neg'
                    }
                  >
                    {signal.oiChange !== null
                      ? `${signal.oiChange > 0 ? '+' : ''}${Number(signal.oiChange).toFixed(2)}%`
                      : '-'}
                  </td>
                  <td
                    className={
                      signal.priceVsEma50 && signal.priceVsEma50 >= 0
                        ? 'pos'
                        : 'neg'
                    }
                  >
                    {signal.priceVsEma50 !== null
                      ? `${signal.priceVsEma50 > 0 ? '+' : ''}${Number(signal.priceVsEma50).toFixed(2)}%`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.signals.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
          <p className="hint">
            {isRTL
              ? 'سیگنال‌ها هر ۴ ساعت بروزرسانی می‌شوند'
              : 'Signals update every 4 hours'}
          </p>
        </div>
      )}
    </div>
  );
}
