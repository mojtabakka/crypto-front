import type { FakeSignalRisk } from '../types/market-scanner';

interface RiskBadgeProps {
  risk: FakeSignalRisk | null | undefined;
  isRTL: boolean;
}

export function RiskBadge({ risk, isRTL }: RiskBadgeProps) {
  if (!risk) return null;

  const riskClass =
    risk.riskLevel === 'HIGH'
      ? 'high'
      : risk.riskLevel === 'MEDIUM'
        ? 'medium'
        : 'low';

  const riskLabel =
    risk.riskLevel === 'HIGH'
      ? isRTL ? 'زیاد' : 'High'
      : risk.riskLevel === 'MEDIUM'
        ? isRTL ? 'متوسط' : 'Medium'
        : isRTL ? 'کم' : 'Low';

  return (
    <span className={`signal-stat fake-risk ${riskClass}`}>
      ⚠️ {risk.fakeSignalProbability.toFixed(0)}% · {riskLabel}
    </span>
  );
}
