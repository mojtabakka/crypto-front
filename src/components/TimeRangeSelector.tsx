import { useI18n } from '../i18n';
import './TimeRangeSelector.css';

const RANGES = ['24h', '48h', '7d', '30d'] as const;

type TimeRange = typeof RANGES[number];

interface TimeRangeSelectorProps {
    value: TimeRange;
    onChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
    const { isRTL } = useI18n();

    return (
        <label className="time-range-selector">
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="time-range-label">
                {isRTL ? 'زمان' : 'Time'}
            </span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value as TimeRange)}
                aria-label={isRTL ? 'انتخاب بازه زمانی' : 'Select time range'}
            >
                {RANGES.map((range) => (
                    <option key={range} value={range}>
                        {range}
                    </option>
                ))}
            </select>
        </label>
    );
}
