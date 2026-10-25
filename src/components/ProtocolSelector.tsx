import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProtocols } from '../api/protocol/protocol';
import type { ProtocolSearchItem } from '../types/protocol-analysis';
import './ProtocolSelector.css';

interface ProtocolSelectorProps {
  selected: ProtocolSearchItem | null;
  onSelect: (protocol: ProtocolSearchItem) => void;
  isRTL?: boolean;
}

const QUICK_PICKS = ['Aave', 'Uniswap', 'Lido', 'EigenLayer', 'Pendle', 'Curve DEX', 'MakerDAO', 'Aerodrome'];

function formatCompactUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function ProtocolSelector({ selected, onSelect, isRTL = false }: ProtocolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['protocol-search', term],
    queryFn: () => searchProtocols(term, 30),
    enabled: open,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const quickPicks = useMemo(
    () => QUICK_PICKS.map((name) => results.find((r) => r.name === name)).filter(Boolean) as ProtocolSearchItem[],
    [results],
  );

  const toggleOpen = () => {
    setOpen((prev) => {
      if (prev) setTerm('');
      return !prev;
    });
  };

  const handlePick = (protocol: ProtocolSearchItem) => {
    onSelect(protocol);
    setOpen(false);
    setTerm('');
  };

  return (
    <div className="protocol-selector" ref={containerRef}>
      <button
        type="button"
        className={`protocol-selector-trigger ${open ? 'open' : ''}`}
        onClick={toggleOpen}
      >
        {selected ? (
          <>
            <img src={selected.logo} alt="" className="protocol-selector-logo" />
            <span className="protocol-selector-value">
              <span className="protocol-selector-symbol">{selected.symbol}</span>
              <span className="protocol-selector-name">{selected.name}</span>
            </span>
          </>
        ) : (
          <span className="protocol-selector-placeholder">
            {isRTL ? 'یک ارز یا پروتکل انتخاب کنید' : 'Select a token or protocol'}
          </span>
        )}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`protocol-selector-arrow ${open ? 'open' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="protocol-selector-menu">
          <div className="protocol-selector-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={isRTL ? 'جستجوی اسم یا نماد...' : 'Search by name or symbol...'}
            />
          </div>

          {term.length === 0 && quickPicks.length > 0 && (
            <div className="protocol-selector-section">
              <div className="protocol-selector-label">
                {isRTL ? 'پیشنهادی' : 'Quick picks'}
              </div>
              {quickPicks.map((protocol) => (
                <button
                  key={protocol.slug}
                  type="button"
                  className="protocol-selector-item"
                  onClick={() => handlePick(protocol)}
                >
                  <img src={protocol.logo} alt="" className="protocol-selector-logo" />
                  <span className="protocol-selector-item-main">
                    <span className="protocol-selector-item-symbol">{protocol.symbol}</span>
                    <span className="protocol-selector-item-name">{protocol.name}</span>
                  </span>
                  <span className="protocol-selector-item-meta">
                    <span className="protocol-selector-item-category">{protocol.category}</span>
                    <span className="protocol-selector-item-tvl">{formatCompactUsd(protocol.tvl)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="protocol-selector-section">
            {term.length > 0 && (
              <div className="protocol-selector-label">
                {isRTL ? 'نتایج جستجو' : 'Search results'}
              </div>
            )}
            {isFetching && <div className="protocol-selector-empty">{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</div>}
            {!isFetching && results.length === 0 && (
              <div className="protocol-selector-empty">
                {isRTL ? 'نتیجه‌ای یافت نشد' : 'No protocols found'}
              </div>
            )}
            {results.map((protocol) => (
              <button
                key={protocol.slug}
                type="button"
                className={`protocol-selector-item ${
                  selected?.slug === protocol.slug ? 'active' : ''
                }`}
                onClick={() => handlePick(protocol)}
              >
                <img src={protocol.logo} alt="" className="protocol-selector-logo" />
                <span className="protocol-selector-item-main">
                  <span className="protocol-selector-item-symbol">{protocol.symbol}</span>
                  <span className="protocol-selector-item-name">{protocol.name}</span>
                </span>
                <span className="protocol-selector-item-meta">
                  <span className="protocol-selector-item-category">{protocol.category}</span>
                  <span className="protocol-selector-item-tvl">{formatCompactUsd(protocol.tvl)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
