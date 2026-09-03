import { useQuery } from '@tanstack/react-query';
import { Loading } from '../components/Loading';

interface VolumeProfileData {
  poc: number;
  vah: number;
  val: number;
  currentPrice: number;
  signal: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  riskRewardRatio: number | null;
  totalVolNodes: number;
}

async function fetchVolumeProfile(symbol: string, interval: string): Promise<VolumeProfileData> {
  const res = await fetch(
    `http://localhost:3000/volume-profile/${symbol}?interval=${interval}`,
  );
  if (!res.ok) throw new Error('Failed to fetch volume profile');
  return res.json();
}

interface VolumeProfileTabProps {
  symbol: string;
  isRTL: boolean;
}

export function VolumeProfileTab({ symbol, isRTL }: VolumeProfileTabProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['volume-profile-tab', symbol, '1d'],
    queryFn: () => fetchVolumeProfile(symbol, '1d'),
  });

  if (isLoading) return <Loading isRTL={isRTL} compact />;
  if (isError) {
    return (
      <div className="error-state">
        <p>{isRTL ? 'خطا در بارگذاری' : 'Error loading'}</p>
      </div>
    );
  }

  if (!data) return null;

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(8);
  };

  const getSignalClass = (signal: string) => {
    switch (signal) {
      case 'LONG':
        return 'signal-long';
      case 'SHORT':
        return 'signal-short';
      default:
        return 'signal-neutral';
    }
  };

  const getSignalText = (signal: string) => {
    if (isRTL) {
      switch (signal) {
        case 'LONG':
          return '🟢 لانگ';
        case 'SHORT':
          return '🔴 شورت';
        default:
          return '⚪ خنثی';
      }
    }
    return signal;
  };

  const getRiskRewardColor = (rr: number | null) => {
    if (!rr) return 'neutral';
    if (rr >= 2) return 'excellent';
    if (rr >= 1.5) return 'good';
    return 'poor';
  };

  return (
    <div className="volume-profile-tab">
      <div className={`vp-signal-card ${getSignalClass(data.signal)}`}>
        <div className="vp-signal-label">{isRTL ? 'سیگنال' : 'Signal'}</div>
        <div className="vp-signal-value">{getSignalText(data.signal)}</div>
      </div>

      <div className="vp-levels-grid">
        <div className="vp-level-card poc">
          <div className="vp-level-label">POC</div>
          <div className="vp-level-value">{formatPrice(data.poc)}</div>
          <div className="vp-level-desc">{isRTL ? 'نقطه کنترل' : 'Point of Control'}</div>
        </div>
        <div className="vp-level-card vah">
          <div className="vp-level-label">VAH</div>
          <div className="vp-level-value">{formatPrice(data.vah)}</div>
          <div className="vp-level-desc">{isRTL ? 'حد بالایی ارزش' : 'Value Area High'}</div>
        </div>
        <div className="vp-level-card val">
          <div className="vp-level-label">VAL</div>
          <div className="vp-level-value">{formatPrice(data.val)}</div>
          <div className="vp-level-desc">{isRTL ? 'حد پایینی ارزش' : 'Value Area Low'}</div>
        </div>
        <div className="vp-level-card current">
          <div className="vp-level-label">{isRTL ? 'قیمت فعلی' : 'Current'}</div>
          <div className="vp-level-value">{formatPrice(data.currentPrice)}</div>
        </div>
      </div>

      {data.signal !== 'NEUTRAL' && (
        <div className="vp-trade-setup">
          <h4>{isRTL ? 'تنظیمات معامله' : 'Trade Setup'}</h4>
          <div className="vp-setup-grid">
            <div className="vp-setup-item">
              <span className="vp-setup-label">{isRTL ? 'ورود' : 'Entry'}</span>
              <span className="vp-setup-value entry">{formatPrice(data.entryPrice)}</span>
            </div>
            <div className="vp-setup-item">
              <span className="vp-setup-label">{isRTL ? 'حد ضرر' : 'Stop Loss'}</span>
              <span className="vp-setup-value stop-loss">{formatPrice(data.stopLoss)}</span>
            </div>
            <div className="vp-setup-item">
              <span className="vp-setup-label">{isRTL ? 'حد سود' : 'Take Profit'}</span>
              <span className="vp-setup-value take-profit">{formatPrice(data.takeProfit)}</span>
            </div>
            <div className="vp-setup-item">
              <span className="vp-setup-label">{isRTL ? 'ریسک/ریوارد' : 'R:R'}</span>
              <span className={`vp-setup-value rr-${getRiskRewardColor(data.riskRewardRatio)}`}>
                {data.riskRewardRatio ? `1:${Number(data.riskRewardRatio).toFixed(2)}` : '-'}
              </span>
            </div>
          </div>
          <div className="vp-setup-details">
            <div className="vp-detail-item">
              <span className="vp-detail-label">{isRTL ? 'فاصله تا ورود:' : 'Distance to Entry:'}</span>
              <span className="vp-detail-value">
                {data.entryPrice
                  ? `${(((data.currentPrice - data.entryPrice) / data.entryPrice) * 100).toFixed(2)}%`
                  : '-'}
              </span>
            </div>
            <div className="vp-detail-item">
              <span className="vp-detail-label">{isRTL ? 'ریسک:' : 'Risk:'}</span>
              <span className="vp-detail-value">
                {data.entryPrice && data.stopLoss
                  ? `${(((data.entryPrice - data.stopLoss) / data.entryPrice) * 100).toFixed(2)}%`
                  : '-'}
              </span>
            </div>
            <div className="vp-detail-item">
              <span className="vp-detail-label">{isRTL ? 'سود هدف:' : 'Target Profit:'}</span>
              <span className="vp-detail-value">
                {data.entryPrice && data.takeProfit
                  ? `${(((data.takeProfit - data.entryPrice) / data.entryPrice) * 100).toFixed(2)}%`
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
