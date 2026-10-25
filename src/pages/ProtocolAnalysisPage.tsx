import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { ProtocolSelector } from '../components/ProtocolSelector';
import { Loading } from '../components/Loading';
import { getProtocolDeepDive } from '../api/protocol/protocol';
import type {
  ProtocolSearchItem,
  ProtocolDeepDive,
  ProtocolHealthScore,
} from '../types/protocol-analysis';
import './ProtocolAnalysisPage.css';

const VERDICT_TONE: Record<ProtocolHealthScore['verdict'], string> = {
  STRONG_BUY: 'strong-buy',
  ACCUMULATE: 'accumulate',
  HOLD: 'hold',
  CAUTION: 'caution',
  AVOID: 'avoid',
};

const VERDICT_LABEL_FA: Record<ProtocolHealthScore['verdict'], string> = {
  STRONG_BUY: 'خرید قوی',
  ACCUMULATE: 'تدریجی',
  HOLD: 'نگهداری',
  CAUTION: 'احتیاط',
  AVOID: 'پرهیز',
};

function fmtUsd(value: number | null | undefined, digits?: number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(digits ?? 2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(digits ?? 1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toPrecision(3)}`;
}

function fmtNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtPct(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return `${value > 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

function pctTone(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'neutral';
  if (value > 0) return 'pos';
  if (value < 0) return 'neg';
  return 'neutral';
}

function fmtDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function Sparkline({ points, tone }: { points: number[]; tone: string }) {
  if (points.length < 2) return null;

  const width = 100;
  const height = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);

  const coords = points.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={`sparkline ${tone}`}>
      <polyline points={coords.join(' ')} fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 78 ? '#22c55e' : score >= 62 ? '#84cc16' : score >= 48 ? '#f59e0b' : '#ef4444';

  return (
    <div className="score-ring">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div className="score-ring-value">
        <span className="score-ring-number" style={{ color }}>
          {score}
        </span>
        <span className="score-ring-label">/100</span>
      </div>
    </div>
  );
}

function SubScoreBar({ value, label }: { value: number; label: string }) {
  const color = value >= 70 ? '#22c55e' : value >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="subscore">
      <div className="subscore-header">
        <span className="subscore-label">{label}</span>
        <span className="subscore-value" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="subscore-track">
        <div className="subscore-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function MetricRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <span className={`metric-value ${tone ?? ''}`}>{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="pa-section">
      <h3 className="pa-section-title">
        <span className="pa-section-icon">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ProtocolAnalysisPage() {
  const { isRTL } = useI18n();
  const [selected, setSelected] = useState<ProtocolSearchItem | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery<ProtocolDeepDive>({
    queryKey: ['protocol-deep-dive', selected?.slug],
    queryFn: () => getProtocolDeepDive(selected!.slug),
    enabled: !!selected,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const handleSelect = useCallback((protocol: ProtocolSearchItem) => {
    setSelected(protocol);
  }, []);

  const verdictLabel = (verdict: ProtocolHealthScore['verdict']) =>
    isRTL ? VERDICT_LABEL_FA[verdict] : verdict.replace('_', ' ');

  const trendLabel = (trend: string) => {
    if (trend === 'RISING') return isRTL ? 'صعودی' : 'RISING';
    if (trend === 'FALLING') return isRTL ? 'نزولی' : 'FALLING';
    return isRTL ? 'ثابت' : 'FLAT';
  };

  const trendTone =
    data?.tvl.historyTrend === 'RISING' ? 'pos' : data?.tvl.historyTrend === 'FALLING' ? 'neg' : 'neutral';

  return (
    <div className="protocol-analysis-page" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="pa-header">
        <div className="pa-header-title">
          <h1>{isRTL ? 'تحلیل کامل پروتکل' : 'Protocol Deep Dive'}</h1>
          <p className="pa-header-subtitle">
            {isRTL
              ? 'ارز را انتخاب کنید تا TVL، درآمد، فعالیت شبکه و توکنومیکس آن بررسی شود'
              : 'Pick a token to inspect its TVL, revenue, on-chain activity and tokenomics'}
          </p>
        </div>
        <div className="pa-selector-row">
          <ProtocolSelector selected={selected} onSelect={handleSelect} isRTL={isRTL} />
          {data && (
            <button
              type="button"
              className="pa-refresh-btn"
              onClick={() => refetch()}
              title={isRTL ? 'بروزرسانی' : 'Refresh'}
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {!selected && (
        <div className="pa-empty">
          <div className="pa-empty-icon">🔍</div>
          <p>{isRTL ? 'از منوی بالا یک ارز انتخاب کنید' : 'Select a token from the dropdown above'}</p>
        </div>
      )}

      {isLoading && <Loading isRTL={isRTL} />}

      {isError && (
        <div className="pa-error">
          <p>{error instanceof Error ? error.message : 'Failed to load analysis'}</p>
          <button type="button" className="pa-retry-btn" onClick={() => refetch()}>
            {isRTL ? 'تلاش مجدد' : 'Retry'}
          </button>
        </div>
      )}

      {data && !isLoading && (
        <div className="pa-body">
          <div className="pa-hero">
            <div className="pa-hero-identity">
              <img src={data.identity.logo} alt="" className="pa-hero-logo" />
              <div>
                <div className="pa-hero-name-row">
                  <h2>{data.identity.name}</h2>
                  <span className="pa-hero-symbol">{data.identity.symbol}</span>
                </div>
                <div className="pa-hero-tags">
                  <span className="pa-tag">{data.identity.category}</span>
                  <span className="pa-tag">
                    {data.activity.chainsCount} {isRTL ? 'شبکه' : 'chains'}
                  </span>
                  {data.identity.ageInDays > 0 && (
                    <span className="pa-tag">
                      {isRTL
                        ? `${(data.identity.ageInDays / 365).toFixed(1)} سال`
                        : `${(data.identity.ageInDays / 365).toFixed(1)}y old`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pa-hero-score">
              <ScoreRing score={data.healthScore.total} />
              <span className={`pa-verdict ${VERDICT_TONE[data.healthScore.verdict]}`}>
                {verdictLabel(data.healthScore.verdict)}
              </span>
              <p className="pa-verdict-summary">{data.healthScore.summary}</p>
            </div>

            {data.tokenomics.price !== null && (
              <div className="pa-hero-price">
                <span className="pa-price">{fmtUsd(data.tokenomics.price)}</span>
                <span className={`pa-price-change ${pctTone(data.tokenomics.priceChange24h)}`}>
                  {fmtPct(data.tokenomics.priceChange24h)} {isRTL ? '۲۴س' : '24h'}
                </span>
                {data.tokenomics.athChangePercent !== null && (
                  <span className="pa-ath">ATH {fmtPct(data.tokenomics.athChangePercent)}</span>
                )}
              </div>
            )}
          </div>

          {data.warnings.length > 0 && (
            <div className="pa-warnings">
              {data.warnings.map((warning, index) => (
                <div key={index} className="pa-warning">
                  <span className="pa-warning-icon">⚠️</span>
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pa-grid">
            <Section title={isRTL ? 'قدرت TVL' : 'TVL Strength'} icon="💰">
              <div className="pa-metrics">
                <MetricRow label={isRTL ? 'TVL کل' : 'Total TVL'} value={fmtUsd(data.tvl.total)} />
                <MetricRow
                  label={isRTL ? 'تغییر ۱ روز' : '1d change'}
                  value={fmtPct(data.tvl.change1d)}
                  tone={pctTone(data.tvl.change1d)}
                />
                <MetricRow
                  label={isRTL ? 'تغییر ۷ روز' : '7d change'}
                  value={fmtPct(data.tvl.change7d)}
                  tone={pctTone(data.tvl.change7d)}
                />
                <MetricRow
                  label={isRTL ? 'تغییر ۳۰ روز' : '30d change'}
                  value={fmtPct(data.tvl.change1m)}
                  tone={pctTone(data.tvl.change1m)}
                />
                <MetricRow
                  label={isRTL ? 'روند' : 'Trend'}
                  value={trendLabel(data.tvl.historyTrend)}
                  tone={trendTone}
                />
              </div>
              <Sparkline points={data.tvl.history.map((point) => point.tvl)} tone={pctTone(data.tvl.change1m)} />
              <div className="pa-subscores">
                <SubScoreBar
                  value={data.healthScore.tvlStrength}
                  label={isRTL ? 'قدرت TVL' : 'TVL strength'}
                />
                <SubScoreBar value={data.healthScore.growth} label={isRTL ? 'رشد' : 'Growth'} />
              </div>
            </Section>

            <Section title={isRTL ? 'درآمد و هزینه‌ها' : 'Fees & Revenue'} icon="💵">
              <div className="pa-metrics">
                <MetricRow label={isRTL ? 'کارمزد ۲۴س' : 'Fees 24h'} value={fmtUsd(data.revenue.fees24h)} />
                <MetricRow label={isRTL ? 'کارمزد ۷ روز' : 'Fees 7d'} value={fmtUsd(data.revenue.fees7d)} />
                <MetricRow label={isRTL ? 'کارمزد ۳۰ روز' : 'Fees 30d'} value={fmtUsd(data.revenue.fees30d)} />
                <MetricRow label={isRTL ? 'کارمزد ۱ سال' : 'Fees 1y'} value={fmtUsd(data.revenue.fees1y)} />
                <MetricRow
                  label={isRTL ? 'درآمد ۳۰ روز' : 'Revenue 30d'}
                  value={fmtUsd(data.revenue.revenue30d)}
                />
                <MetricRow
                  label={isRTL ? 'درآمد سالانه' : 'Annualized revenue'}
                  value={fmtUsd(data.revenue.annualizedRevenue30d)}
                />
                {data.revenue.volume30d !== null && (
                  <MetricRow
                    label={isRTL ? 'حجم ۳۰ روز' : 'Volume 30d'}
                    value={fmtUsd(data.revenue.volume30d)}
                  />
                )}
              </div>
              <Sparkline
                points={data.revenue.history.map((point) => point.value)}
                tone={pctTone(data.revenue.feesChange7d)}
              />
              <div className="pa-subscores">
                <SubScoreBar
                  value={data.healthScore.revenueQuality}
                  label={isRTL ? 'کیفیت درآمد' : 'Revenue quality'}
                />
              </div>
            </Section>

            <Section title={isRTL ? 'فعالیت شبکه' : 'On-chain Activity'} icon="🌐">
              <div className="pa-metrics">
                <MetricRow
                  label={isRTL ? 'کارمزد / TVL' : 'Fees / TVL'}
                  value={
                    data.activity.feesToTvlPercent !== null
                      ? `${data.activity.feesToTvlPercent.toFixed(3)}%`
                      : '-'
                  }
                />
                {data.activity.volumeToTvlPercent !== null && (
                  <MetricRow
                    label={isRTL ? 'حجم / TVL' : 'Volume / TVL'}
                    value={`${data.activity.volumeToTvlPercent.toFixed(0)}%`}
                  />
                )}
                <MetricRow
                  label={isRTL ? 'TVL / درآمد سالانه' : 'TVL / annual revenue'}
                  value={data.activity.revenueMultiple !== null ? `${data.activity.revenueMultiple.toFixed(1)}x` : '-'}
                />
                {data.activity.dominantChain && (
                  <MetricRow
                    label={isRTL ? 'سهم شبکه اصلی' : 'Top chain share'}
                    value={`${data.activity.topChainSharePercent?.toFixed(0) ?? 0}% (${
                      data.activity.dominantChain
                    })`}
                  />
                )}
                {data.activity.stablecoinSupplyUsd !== null && (
                  <>
                    <MetricRow
                      label={isRTL ? 'استیبل‌کوین شبکه' : 'Chain stablecoin float'}
                      value={fmtUsd(data.activity.stablecoinSupplyUsd)}
                    />
                    <MetricRow
                      label={isRTL ? 'سهم از استیبل‌کوین' : 'Share of stablecoin float'}
                      value={
                        data.activity.stablecoinSharePercent !== null
                          ? `${data.activity.stablecoinSharePercent.toFixed(1)}%`
                          : '-'
                      }
                    />
                  </>
                )}
                <MetricRow
                  label={isRTL ? 'تعداد شبکه' : 'Chains'}
                  value={String(data.activity.chainsCount)}
                />
              </div>
              <div className="pa-subscores">
                <SubScoreBar
                  value={data.healthScore.activity}
                  label={isRTL ? 'فعالیت' : 'Activity'}
                />
              </div>
            </Section>

            <Section title={isRTL ? 'توزیع TVL بین شبکه‌ها' : 'TVL by Chain'} icon="🗺️">
              <div className="pa-chain-list">
                {data.tvl.chainBreakdown.slice(0, 8).map((entry) => (
                  <div key={entry.chain} className="pa-chain-row">
                    <span className="pa-chain-name">{entry.chain}</span>
                    <div className="pa-chain-track">
                      <div
                        className="pa-chain-fill"
                        style={{ width: `${Math.min(100, entry.sharePercent)}%` }}
                      />
                    </div>
                    <span className="pa-chain-share">{entry.sharePercent.toFixed(1)}%</span>
                    <span className="pa-chain-value">{fmtUsd(entry.tvl)}</span>
                  </div>
                ))}
                {data.tvl.chainBreakdown.length === 0 && (
                  <p className="pa-muted">
                    {isRTL ? 'داده‌ای موجود نیست' : 'No chain breakdown available'}
                  </p>
                )}
              </div>
            </Section>

            <Section title={isRTL ? 'توکنومیکس' : 'Tokenomics'} icon="🪙">
              <div className="pa-metrics">
                <MetricRow
                  label={isRTL ? 'قیمت' : 'Price'}
                  value={fmtUsd(data.tokenomics.price)}
                />
                <MetricRow
                  label={isRTL ? 'تغییر ۷ روز' : '7d change'}
                  value={fmtPct(data.tokenomics.priceChange7d)}
                  tone={pctTone(data.tokenomics.priceChange7d)}
                />
                <MetricRow
                  label={isRTL ? 'تغییر ۳۰ روز' : '30d change'}
                  value={fmtPct(data.tokenomics.priceChange30d)}
                  tone={pctTone(data.tokenomics.priceChange30d)}
                />
                <MetricRow
                  label={isRTL ? 'ارزش بازار' : 'Market cap'}
                  value={fmtUsd(data.tokenomics.marketCap)}
                />
                <MetricRow label="FDV" value={fmtUsd(data.tokenomics.fdv)} />
                <MetricRow
                  label={isRTL ? 'عرضه در گردش' : 'Circulating supply'}
                  value={fmtNumber(data.tokenomics.circulatingSupply)}
                />
                <MetricRow
                  label={isRTL ? 'درصد گردش' : 'Circulating %'}
                  value={
                    data.tokenomics.circulatingPercent !== null
                      ? `${data.tokenomics.circulatingPercent.toFixed(1)}%`
                      : '-'
                  }
                />
                <MetricRow
                  label={isRTL ? 'عرضه کل' : 'Total supply'}
                  value={fmtNumber(data.tokenomics.totalSupply)}
                />
                {data.tokenomics.maxSupply !== null && (
                  <MetricRow
                    label={isRTL ? 'حداکثر عرضه' : 'Max supply'}
                    value={fmtNumber(data.tokenomics.maxSupply)}
                  />
                )}
              </div>
              <div className="pa-subscores">
                <SubScoreBar
                  value={data.healthScore.tokenomics}
                  label={isRTL ? 'توکنومیکس' : 'Tokenomics'}
                />
              </div>
            </Section>

            <Section title={isRTL ? 'ارزش‌گذاری' : 'Valuation'} icon="📐">
              <div className="pa-valuation-list">
                {data.valuation.labels.map((item) => (
                  <div key={item.label} className={`pa-valuation-item ${item.tone.toLowerCase()}`}>
                    <span className="pa-valuation-label">{item.label}</span>
                    <span className="pa-valuation-value">{item.value}</span>
                  </div>
                ))}
                {data.valuation.labels.length === 0 && (
                  <p className="pa-muted">
                    {isRTL
                      ? 'برای محاسبه نسبت‌ها به مارکت‌کپ و درآمد نیاز است'
                      : 'Needs market cap and revenue data'}
                  </p>
                )}
              </div>
              <div className="pa-subscores">
                <SubScoreBar
                  value={data.healthScore.valuation}
                  label={isRTL ? 'ارزش‌گذاری' : 'Valuation'}
                />
              </div>
            </Section>

            <Section title={isRTL ? 'امنیت' : 'Security'} icon="🔒">
              <div className="pa-metrics">
                <MetricRow
                  label={isRTL ? 'ممیزی' : 'Audited'}
                  value={data.security.isAudited
                    ? isRTL ? 'بله' : 'Yes'
                    : isRTL ? 'نامشخص' : 'Unknown'}
                  tone={data.security.isAudited ? 'pos' : 'neutral'}
                />
                {data.security.audits && (
                  <MetricRow
                    label={isRTL ? 'تعداد ممیزی' : 'Audit count'}
                    value={data.security.audits}
                  />
                )}
                <MetricRow
                  label={isRTL ? 'اورکل' : 'Oracles'}
                  value={
                    data.security.oracles && data.security.oracles.length > 0
                      ? data.security.oracles.join(', ')
                      : '-'
                  }
                />
                <MetricRow
                  label={isRTL ? 'تاریخچه هک' : 'Hack history'}
                  value={
                    data.security.hacks && data.security.hacks.length > 0
                      ? data.security.hacks.join(', ')
                      : isRTL ? 'ندارد' : 'None'
                  }
                  tone={data.security.hasHackHistory ? 'neg' : 'neutral'}
                />
                {data.security.hackLossUsd > 0 && (
                  <MetricRow
                    label={isRTL ? 'مبلغ خسارت' : 'Recorded loss'}
                    value={`${fmtUsd(data.security.hackLossUsd)} (${data.security.hackLossToTvlPercent.toFixed(
                      3,
                    )}% TVL)`}
                    tone={data.security.hasHackHistory ? 'neg' : 'neutral'}
                  />
                )}
                {data.security.latestHackDate && (
                  <MetricRow
                    label={isRTL ? 'آخرین حادثه' : 'Latest incident'}
                    value={fmtDate(data.security.latestHackDate)}
                    tone={data.security.hasHackHistory ? 'neg' : 'neutral'}
                  />
                )}
              </div>
              <div className="pa-subscores">
                <SubScoreBar
                  value={data.healthScore.security}
                  label={isRTL ? 'امنیت' : 'Security'}
                />
              </div>
              {data.security.auditLinks && data.security.auditLinks.length > 0 && (
                <div className="pa-links">
                  {data.security.auditLinks.slice(0, 4).map((link) => (
                    <a key={link} href={link} target="_blank" rel="noopener noreferrer" className="pa-link">
                      🔗 {isRTL ? 'گزارش ممیزی' : 'Audit report'}
                    </a>
                  ))}
                </div>
              )}
            </Section>

            <Section title={isRTL ? 'امتیاز سلامت' : 'Health Score'} icon="🎯">
              <div className="pa-subscores pa-subscores-grid">
                <SubScoreBar
                  value={data.healthScore.tvlStrength}
                  label={isRTL ? 'TVL' : 'TVL'}
                />
                <SubScoreBar value={data.healthScore.growth} label={isRTL ? 'رشد' : 'Growth'} />
                <SubScoreBar
                  value={data.healthScore.revenueQuality}
                  label={isRTL ? 'درآمد' : 'Revenue'}
                />
                <SubScoreBar
                  value={data.healthScore.activity}
                  label={isRTL ? 'فعالیت' : 'Activity'}
                />
                <SubScoreBar
                  value={data.healthScore.valuation}
                  label={isRTL ? 'ارزش‌گذاری' : 'Valuation'}
                />
                <SubScoreBar
                  value={data.healthScore.security}
                  label={isRTL ? 'امنیت' : 'Security'}
                />
                <SubScoreBar
                  value={data.healthScore.tokenomics}
                  label={isRTL ? 'توکنومیکس' : 'Tokenomics'}
                />
              </div>
              {data.identity.description && <p className="pa-description">{data.identity.description}</p>}
              <div className="pa-links">
                {data.identity.url && (
                  <a href={data.identity.url} target="_blank" rel="noopener noreferrer" className="pa-link">
                    🌐 {isRTL ? 'وب‌سایت' : 'Website'}
                  </a>
                )}
                {data.identity.twitter && (
                  <a href={data.identity.twitter} target="_blank" rel="noopener noreferrer" className="pa-link">
                    🐦 Twitter
                  </a>
                )}
                <span className="pa-link pa-link-muted">
                  {isRTL ? 'منبع:' : 'Source:'} DefiLlama + CoinGecko
                </span>
              </div>
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}