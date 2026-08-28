import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { MarketCandle } from '../api/market/market';
import { useI18n } from '../i18n';

export type ChartType =
    | 'bar'
    | 'line'
    | 'area';

interface VolumeChartProps {
    data: MarketCandle[];
    range: string;
    chartType: ChartType;
}

function formatChartTime(
    timestamp: number,
    range: string,
) {
    const date = new Date(timestamp);

    if (
        range === '24h' ||
        range === '48h'
    ) {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const tooltipStyle = {
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
};

export function VolumeChart({
    data,
    range,
    chartType,
}: VolumeChartProps) {
    const { t } = useI18n();
    const chartData = data.map((item) => ({
        time: formatChartTime(
            item.time,
            range,
        ),
        volume: item.volume,
    }));

    const xAxisInterval = Math.max(
        0,
        Math.floor(chartData.length / 8),
    );

    const commonAxis = (
        <>
            <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
            />

            <XAxis
                dataKey="time"
                interval={xAxisInterval}
                stroke="#475569"
                style={{ fontSize: '12px', fontFamily: 'Vazirmatn, sans-serif' }}
                tick={{ fill: '#94a3b8' }}
            />

            <YAxis
                stroke="#475569"
                style={{ fontSize: '12px', fontFamily: 'Vazirmatn, sans-serif' }}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) =>
                    value >= 1e9
                        ? `${(value / 1e9).toFixed(1)}B`
                        : value >= 1e6
                        ? `${(value / 1e6).toFixed(1)}M`
                        : value >= 1e3
                        ? `${(value / 1e3).toFixed(1)}K`
                        : value.toString()
                }
            />

            <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: '#94a3b8', fontFamily: 'Vazirmatn, sans-serif' }}
                cursor={{ stroke: 'rgba(96, 165, 250, 0.3)', strokeWidth: 1 }}
                formatter={(value) => [
                    Number(
                        value,
                    ).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                    }),
                    t.chart.volume,
                ]}
            />
        </>
    );

    if (chartType === 'line') {
        return (
            <ResponsiveContainer
                width="100%"
                height={300}
            >
                <LineChart data={chartData}>
                    {commonAxis}

                    <Line
                        type="monotone"
                        dataKey="volume"
                        name={t.chart.volume}
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2, fill: '#0a0e17' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    if (chartType === 'area') {
        return (
            <ResponsiveContainer
                width="100%"
                height={300}
            >
                <AreaChart data={chartData}>
                    {commonAxis}

                    <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <Area
                        type="monotone"
                        dataKey="volume"
                        name={t.chart.volume}
                        fill="url(#colorVolume)"
                        stroke="#60a5fa"
                        strokeWidth={2.5}
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer
            width="100%"
            height={300}
        >
            <BarChart data={chartData}>
                {commonAxis}

                <Bar
                    dataKey="volume"
                    name={t.chart.volume}
                    fill="#60a5fa"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
