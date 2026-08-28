import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { FundingRateData } from "../api/market/market";
import { useI18n } from "../i18n";

const tooltipStyle = {
  backgroundColor: 'rgba(10, 14, 23, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(10px)',
};

interface FundingRateChartProps {
    data: FundingRateData[];
}

export function FundingRateChart({
    data,
}: FundingRateChartProps) {
    const { t } = useI18n();
    const chartData = data.map((item) => ({
        time: item.time,
        fundingRate: item.fundingRate * 100,
    }));

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
            }}
        >
            <div className="chart-header">
              <h3 className="chart-title">
                <span className="icon">💰</span>
                {t.fundingRate.title}
              </h3>
              <span className="chart-badge">
                {t.fundingRate.badge}
              </span>
            </div>

            <ResponsiveContainer
                width="100%"
                height="100%"
            >
                <LineChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 20,
                        left: 20,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255, 255, 255, 0.05)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="time"
                        stroke="#475569"
                        style={{ fontSize: '12px', fontFamily: 'Vazirmatn, sans-serif' }}
                        tick={{ fill: '#94a3b8' }}
                        tickFormatter={(value) =>
                            new Date(
                                value,
                            ).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                        }
                    />

                    <YAxis
                        domain={["dataMin", "dataMax"]}
                        stroke="#475569"
                        style={{ fontSize: '12px', fontFamily: 'Vazirmatn, sans-serif' }}
                        tick={{ fill: '#94a3b8' }}
                        tickFormatter={(value) =>
                            `${Number(value).toFixed(3)}%`
                        }
                    />

                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: '#94a3b8', fontFamily: 'Vazirmatn, sans-serif' }}
                        cursor={{ stroke: 'rgba(249, 115, 22, 0.3)', strokeWidth: 1 }}
                        labelFormatter={(value) =>
                            new Date(
                                Number(value),
                            ).toLocaleString()
                        }
                        formatter={(value) => [
                            `${Number(value).toFixed(4)}%`,
                            t.fundingRate.title,
                        ]}
                    />

                    <Line
                        type="monotone"
                        dataKey="fundingRate"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2, fill: '#0a0e17' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
