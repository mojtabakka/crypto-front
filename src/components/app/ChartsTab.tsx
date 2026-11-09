import { MarketSummary } from '../MarketSummary';
import { VolumeChart } from '../VolumeChart';
import { OpenInterestChart } from '../OpenInterestChart';
import { FundingRateChart } from '../FundingRateChart';
import { Loading } from '../Loading';
import { useI18n } from '../../i18n';

interface ChartsTabProps {
    symbol: string;
    data: any[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: any;
    totalVolume: number;
    openInterestData: any[] | undefined;
    fundingData: any[] | undefined;
}

export function ChartsTab({
    symbol,
    data,
    isLoading,
    isError,
    error,
    totalVolume,
    openInterestData,
    fundingData,
}: ChartsTabProps) {
    const { t, isRTL } = useI18n();

    return (
        <div className="tab-panel">
            {isLoading && <Loading isRTL={isRTL} />}

            {isError && (
                <div className="error-state">
                    <span>⚠️</span>
                    <span>{error?.message}</span>
                </div>
            )}

            {!isLoading && !isError && data && data.length > 0 && (
                <>
                    <div className="section">
                        <div className="glass-card">
                            <MarketSummary
                                symbol={symbol}
                                interval="15m"
                                range="24h"
                                totalVolume={totalVolume}
                            />
                        </div>
                    </div>

                    <div className="chart-type-buttons">
                        <button className="chart-type-btn active">
                            📊 {t.chart.bar}
                        </button>
                        <button className="chart-type-btn">
                            📈 {t.chart.line}
                        </button>
                        <button className="chart-type-btn">
                            📉 {t.chart.area}
                        </button>
                    </div>

                    <div className="section">
                        <div className="glass-card chart-container">
                            <VolumeChart
                                data={data}
                                range="24h"
                                chartType="bar"
                            />
                        </div>
                    </div>

                    {openInterestData && openInterestData.length > 0 && (
                        <div className="section">
                            <div className="glass-card chart-container chart-height-md">
                                <OpenInterestChart data={openInterestData} />
                            </div>
                        </div>
                    )}

                    {fundingData && fundingData.length > 0 && (
                        <div className="section">
                            <div className="glass-card chart-container chart-height-md">
                                <FundingRateChart data={fundingData} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
