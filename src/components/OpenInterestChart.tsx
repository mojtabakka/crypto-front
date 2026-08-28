import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OpenInterestData } from "../api/market/market";
import { useI18n } from "../i18n";

interface OpenInterestChartProps {
  data: OpenInterestData[];
}

const tooltipStyle = {
  backgroundColor: 'rgba(10, 14, 23, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(10px)',
};

export function OpenInterestChart({
  data,
}: OpenInterestChartProps) {
  const { t } = useI18n();
  const chartData = data.map((item) => ({
    time: item.time,
    openInterest: item.openInterest,
  }));

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="chart-header">
        <h3 className="chart-title">
          <span className="icon">📊</span>
          {t.openInterest.title}
        </h3>
        <span className="chart-badge">
          {t.openInterest.badge}
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
              new Date(value).toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )
            }
          />

          <YAxis
            domain={["dataMin", "dataMax"]}
            stroke="#475569"
            style={{ fontSize: '12px', fontFamily: 'Vazirmatn, sans-serif' }}
            tick={{ fill: '#94a3b8' }}
            tickFormatter={(value) =>
              Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })
            }
          />

          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: '#94a3b8', fontFamily: 'Vazirmatn, sans-serif' }}
            cursor={{ stroke: 'rgba(167, 139, 250, 0.3)', strokeWidth: 1 }}
            labelFormatter={(value) =>
              new Date(
                Number(value),
              ).toLocaleString()
            }
            formatter={(value) => [
              Number(value).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }),
              t.openInterest.title,
            ]}
          />

          <Line
            type="monotone"
            dataKey="openInterest"
            stroke="#a78bfa"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, stroke: '#a78bfa', strokeWidth: 2, fill: '#0a0e17' }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
