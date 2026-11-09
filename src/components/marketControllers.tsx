import { useState } from 'react';
import { useI18n } from '../i18n';
import { Button } from './Button';

interface MarketControlsProps {
    symbol: string;
    interval: string;
    range: string;

    onSymbolChange: (
        symbol: string,
    ) => void;

    onIntervalChange: (
        interval: string,
    ) => void;

    onRangeChange: (
        range: string,
    ) => void;
}

const INTERVALS = [
    '1m',
    '5m',
    '15m',
    '30m',
    '1h',
];

const RANGES = [
    '24h',
    '48h',
    '7d',
    '30d',
];

export function MarketControls({
    symbol,
    interval,
    range,
    onSymbolChange,
    onIntervalChange,
    onRangeChange,
}: MarketControlsProps) {
    const { t } = useI18n();
    const [symbolInput, setSymbolInput] = useState(symbol);

    const handleSearch = () => {
        const value = symbolInput.trim().toUpperCase();

        if (!/^[A-Z0-9]{5,20}$/.test(value)) {
            return;
        }

        onSymbolChange(value);
    };

    return (
        <div className="flex flex-wrap items-end gap-4 p-4 rounded-xl bg-surface/60 border border-border-subtle">
            {/* Symbol */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary">
                    {t.controls.symbol}
                </label>

                <div className="flex gap-2">
                    <input
                        value={symbolInput}
                        onChange={(event) =>
                            setSymbolInput(
                                event.target.value.toUpperCase(),
                            )
                        }
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        placeholder="BTCUSDT"
                        className="px-3 py-1.5 rounded-lg bg-[#0f172a]/60 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-primary"
                    />

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSearch}
                    >
                        {t.controls.search}
                    </Button>
                </div>
            </div>

            {/* Interval */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary">
                    {t.controls.interval}
                </label>

                <select
                    value={interval}
                    onChange={(event) =>
                        onIntervalChange(
                            event.target.value,
                        )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#0f172a]/60 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                    {INTERVALS.map(
                        (item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ),
                    )}
                </select>
            </div>

            {/* Range */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary">
                    {t.controls.range}
                </label>

                <select
                    value={range}
                    onChange={(event) =>
                        onRangeChange(
                            event.target.value,
                        )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#0f172a]/60 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                    {RANGES.map(
                        (item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ),
                    )}
                </select>
            </div>
        </div>
    );
}
