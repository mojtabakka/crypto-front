import { useState } from 'react';
import { useI18n } from '../i18n';
import { Button } from './Button';
import './MarketControls.css';

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
    const { t } =
        useI18n();
    const [symbolInput, setSymbolInput] =
        useState(symbol);

    const handleSearch = () => {
        const value =
            symbolInput.trim().toUpperCase();

        if (
            !/^[A-Z0-9]{5,20}$/.test(value)
        ) {
            return;
        }

        onSymbolChange(value);
    };

    return (
        <div className="controls-wrapper">
            {/* Symbol */}
            <div className="control-group symbol">
                <label className="control-label">
                    {t.controls.symbol}
                </label>

                <div className="input-wrapper">
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
                        className="control-input"
                    />

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSearch}
                        icon="🔍"
                    >
                        {t.controls.search}
                    </Button>
                </div>
            </div>

            {/* Interval */}
            <div className="control-group select">
                <label className="control-label">
                    {t.controls.interval}
                </label>

                <select
                    value={interval}
                    onChange={(event) =>
                        onIntervalChange(
                            event.target.value,
                        )
                    }
                    className="control-select"
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
            <div className="control-group select">
                <label className="control-label">
                    {t.controls.range}
                </label>

                <select
                    value={range}
                    onChange={(event) =>
                        onRangeChange(
                            event.target.value,
                        )
                    }
                    className="control-select"
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
