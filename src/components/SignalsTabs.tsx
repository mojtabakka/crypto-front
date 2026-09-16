import {
  AboveEmaIcon,
  Ema21Icon,
  FundingExtremeIcon,
  LongEmaIcon,
  LongWeeklyIcon,
  LiquidationClusterIcon,
  Pullback4hIcon,
  PullbackIcon,
  PullbackMonthlyIcon,
  PullbackWeeklyIcon,
  Reapproach4hIcon,
  ReapproachIcon,
  ReapproachMonthlyIcon,
  ReapproachWeeklyIcon,
  StrongIcon,
  TrendingIcon,
  DojiIcon,
  SqueezeIcon,
  TrustIcon,
} from './MarketScannerIcons';
import type { ScannerTab } from '../types/market-scanner';

interface TabConfig {
  id: ScannerTab;
  label: { fa: string; en: string };
  subtitle?: { fa: string; en: string };
  Icon: React.FC<{ className?: string }>;
}

const TABS: TabConfig[] = [
  { id: 'signals', label: { fa: 'لانگ/شورت', en: 'Longs/Shorts' }, Icon: TrendingIcon },
  { id: '4h-pullbacks', label: { fa: 'پولبک 4ساعته', en: '4h Pullback' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: Pullback4hIcon },
  { id: '4h-reapproach', label: { fa: 'برخورد 4ساعته', en: '4h Reapproach' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: Reapproach4hIcon },
  { id: 'pullbacks', label: { fa: 'پولبک روزانه', en: 'Daily Pullback' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: PullbackIcon },
  { id: 'reapproach', label: { fa: 'برخورد روزانه', en: 'Daily Reapproach' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: ReapproachIcon },
  { id: 'weekly-pullbacks', label: { fa: 'پولبک هفتگی', en: 'Weekly Pullback' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: PullbackWeeklyIcon },
  { id: 'weekly-reapproach', label: { fa: 'برخورد هفتگی', en: 'Weekly Reapproach' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: ReapproachWeeklyIcon },
  { id: 'monthly-pullbacks', label: { fa: 'پولبک ماهانه', en: 'Monthly Pullback' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: PullbackMonthlyIcon },
  { id: 'monthly-reapproach', label: { fa: 'برخورد ماهانه', en: 'Monthly Reapproach' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: ReapproachMonthlyIcon },
  { id: 'ema21-daily-pullback', label: { fa: 'پولبک روزانه', en: 'Daily Pullback' }, subtitle: { fa: 'EMA21', en: 'EMA21' }, Icon: Ema21Icon },
  { id: 'ema21-daily-reapproach', label: { fa: 'برخورد روزانه', en: 'Daily Reapproach' }, subtitle: { fa: 'EMA21', en: 'EMA21' }, Icon: Ema21Icon },
  { id: 'ema21-4h-pullback', label: { fa: 'پولبک ۴ساعته', en: '4H Pullback' }, subtitle: { fa: 'EMA21', en: 'EMA21' }, Icon: Ema21Icon },
  { id: 'ema21-4h-reapproach', label: { fa: 'برخورد ۴ساعته', en: '4H Reapproach' }, subtitle: { fa: 'EMA21', en: 'EMA21' }, Icon: Ema21Icon },
  { id: 'ema21-weekly-pullback', label: { fa: 'پولبک هفتگی', en: 'Weekly Pullback' }, subtitle: { fa: 'EMA21', en: 'EMA21' }, Icon: Ema21Icon },
  { id: 'ema21-weekly-reapproach', label: { fa: 'برخورد هفتگی', en: 'Weekly Reapproach' }, subtitle: { fa: 'EMA21', en: 'EMA21' }, Icon: Ema21Icon },
  { id: 'weekly-above-ema50', label: { fa: 'بالای EMA', en: 'Above EMA' }, subtitle: { fa: 'هفتگی', en: 'Weekly' }, Icon: AboveEmaIcon },
  { id: 'daily-above-ema50-long', label: { fa: 'لانگ + EMA', en: 'Long + EMA' }, subtitle: { fa: 'روزانه', en: 'Daily' }, Icon: LongEmaIcon },
  { id: 'weekly-above-ema50-long', label: { fa: 'لانگ + هفتگی', en: 'Long + Weekly' }, subtitle: { fa: 'EMA50', en: 'EMA50' }, Icon: LongWeeklyIcon },
  { id: 'funding-extreme', label: { fa: 'Funding Extreme', en: 'Funding Extreme' }, Icon: FundingExtremeIcon },
  { id: 'strong', label: { fa: 'لانگ/شورت قوی', en: 'Strong L/S' }, Icon: StrongIcon },
  { id: 'liquidation-clusters', label: { fa: 'خامه‌های نقدشدنی', en: 'Liquidation Clusters' }, Icon: LiquidationClusterIcon },
  { id: 'trusted-long-short', label: { fa: 'لانگ/شورت معتبر', en: 'Trusted L/S' }, Icon: TrustIcon },
  { id: 'doji-candles', label: { fa: 'دوجی‌ها', en: 'Doji Candles' }, Icon: DojiIcon },
  { id: 'funding-volume-squeeze', label: { fa: 'فشار فاندینگ', en: 'Funding Squeeze' }, Icon: SqueezeIcon },
];

interface SignalsTabsProps {
  activeTab: ScannerTab | null;
  isRTL: boolean;
  onTabChange: (tab: ScannerTab) => void;
}

export function SignalsTabs({ activeTab, isRTL, onTabChange }: SignalsTabsProps) {
  return (
    <div className="signals-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`signals-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <tab.Icon />
          <span>{isRTL ? tab.label.fa : tab.label.en}</span>
          {tab.subtitle && <span className="tab-subtitle">{isRTL ? tab.subtitle.fa : tab.subtitle.en}</span>}
        </button>
      ))}
    </div>
  );
}
