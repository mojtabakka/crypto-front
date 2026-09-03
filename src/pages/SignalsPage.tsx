import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../i18n';
import { Loading } from '../components/Loading';
import { Button } from '../components/Button';
import { useScanProgress } from '../hooks/useScanProgress';
import './SignalsPage.css';

interface SymbolSignal {
    symbol: string;
    score: number;
    signal: string;
    confidence: number;
    priceChange: number;
    oiChange: number;
    fundingRate: number;
    sma50: number | null;
    priceVsSma50: number | null;
    maSignal: 'ABOVE' | 'BELOW' | 'NEUTRAL';
}

interface PullbackSignal {
    symbol: string;
    score: number;
    signal: string;
    priceChange: number;
    oiChange: number;
    maPullback: 'BULLISH_PULLBACK' | 'BEARISH_PULLBACK';
    maPullbackTouches: number;
    priceVsEma50: number | null;
    currentPrice: number;
    ema50: number | null;
}

interface ReapproachSignal {
    symbol: string;
    score: number;
    signal: string;
    priceChange: number;
    oiChange: number;
    maReapproach: 'BULLISH_REAPPROACH' | 'BEARISH_REAPPROACH';
    breakoutDay: number | null;
    currentDistance: number | null;
    priceVsEma50: number | null;
    currentPrice: number;
    ema50: number | null;
}

async function fetchLongs(): Promise<{ longs: SymbolSignal[]; shorts: SymbolSignal[] }> {
    const response = await fetch('http://localhost:3000/market-scanner?limit=30');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
}

async function fetchPullbacks(): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[] }> {
    const response = await fetch('http://localhost:3000/market-scanner/pullbacks?limit=30');
    if (!response.ok) throw new Error('Failed to fetch pullbacks');
    return response.json();
}

async function fetchReapproach(): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[] }> {
    const response = await fetch('http://localhost:3000/market-scanner/reapproach?limit=30');
    if (!response.ok) throw new Error('Failed to fetch reapproach');
    return response.json();
}

async function fetchWeeklyPullbacks(): Promise<{ longs: PullbackSignal[]; shorts: PullbackSignal[] }> {
    const response = await fetch('http://localhost:3000/market-scanner/weekly-pullbacks?limit=30');
    if (!response.ok) throw new Error('Failed to fetch weekly pullbacks');
    return response.json();
}

async function fetchWeeklyReapproach(): Promise<{ longs: ReapproachSignal[]; shorts: ReapproachSignal[] }> {
    const response = await fetch('http://localhost:3000/market-scanner/weekly-reapproach?limit=30');
    if (!response.ok) throw new Error('Failed to fetch weekly reapproach');
    return response.json();
}

async function fetchWeeklyAboveEma50(): Promise<{ symbols: Array<{ symbol: string; priceVsEma50: number | null; currentPrice: number; ema50: number | null }> }> {
    const response = await fetch('http://localhost:3000/market-scanner/weekly-above-ema50?limit=30');
    if (!response.ok) throw new Error('Failed to fetch weekly above EMA50');
    return response.json();
}

async function fetchDailyAboveEma50Long(): Promise<{
    symbols: Array<{
        symbol: string;
        priceVsEma50: number | null;
        currentPrice: number;
        ema50: number | null;
        score: number;
        signal: string;
        confidence: number;
        priceChange: number;
        oiChange: number;
        fundingRate: number;
    }>;
}> {
    const response = await fetch('http://localhost:3000/market-scanner/daily-above-ema50-long?limit=20');
    if (!response.ok) throw new Error('Failed to fetch daily above EMA50 with long conditions');
    return response.json();
}

async function fetchWeeklyAboveEma50Long(): Promise<{
    symbols: Array<{
        symbol: string;
        priceVsEma50: number | null;
        currentPrice: number;
        ema50: number | null;
        score: number;
        signal: string;
        confidence: number;
        priceChange: number;
        oiChange: number;
        fundingRate: number;
    }>;
}> {
    const response = await fetch('http://localhost:3000/market-scanner/weekly-above-ema50-long?limit=20');
    if (!response.ok) throw new Error('Failed to fetch weekly above EMA50 with long conditions');
    return response.json();
}

async function fetch4hPullbacks(): Promise<{
    longs: PullbackSignal[];
    shorts: PullbackSignal[];
    all: PullbackSignal[];
}> {
    const response = await fetch('http://localhost:3000/market-scanner/4h-pullbacks?limit=20');
    if (!response.ok) throw new Error('Failed to fetch 4h pullbacks');
    return response.json();
}

async function fetchMonthlyPullbacks(): Promise<{
    longs: PullbackSignal[];
    shorts: PullbackSignal[];
    all: PullbackSignal[];
}> {
    const response = await fetch('http://localhost:3000/market-scanner/monthly-pullbacks?limit=20');
    if (!response.ok) throw new Error('Failed to fetch monthly pullbacks');
    return response.json();
}

async function fetch4hReapproach(): Promise<{
    longs: ReapproachSignal[];
    shorts: ReapproachSignal[];
    all: ReapproachSignal[];
}> {
    const response = await fetch('http://localhost:3000/market-scanner/4h-reapproach?limit=20');
    if (!response.ok) throw new Error('Failed to fetch 4h reapproach');
    return response.json();
}

async function fetchMonthlyReapproach(): Promise<{
    longs: ReapproachSignal[];
    shorts: ReapproachSignal[];
    all: ReapproachSignal[];
}> {
    const response = await fetch('http://localhost:3000/market-scanner/monthly-reapproach?limit=20');
    if (!response.ok) throw new Error('Failed to fetch monthly reapproach');
    return response.json();
}

async function addToWatchlist(symbol: string): Promise<void> {
    const response = await fetch('http://localhost:3000/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
    });
    if (!response.ok) throw new Error('Failed to add to watchlist');
}

interface TradingViewNewsItem {
    id: string;
    title: string;
    description: string;
    source: string;
    url: string;
    publishedOn: number;
    tags: string;
    imageUrl: string;
}

interface NewsPanelProps {
    symbol: string;
    isRTL: boolean;
    progress?: number;
    total?: number;
    onClose: () => void;
}

function NewsPanel({ symbol, isRTL, onClose }: NewsPanelProps) {
    const { data: newsData, isLoading } = useQuery({
        queryKey: ['tradingview-news', symbol, isRTL ? 'fa' : 'en'],
        queryFn: async () => {
            const lang = isRTL ? 'fa' : 'en';
            const res = await fetch(`http://localhost:3000/news/tradingview?symbol=${symbol}&limit=10&lang=${lang}`);
            if (!res.ok) throw new Error('Failed to fetch news');
            return res.json();
        },
        staleTime: 120000,
    });

    return (
        <div className="news-panel-overlay" onClick={onClose}>
            <div className="news-panel" onClick={(e) => e.stopPropagation()}>
                <div className="news-panel-header">
                    <h3>📰 {isRTL ? 'اخبار' : 'News'} {symbol}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        ✕
                    </Button>
                </div>
                <div className="news-panel-content">
                    {isLoading && <Loading isRTL={isRTL} compact />}
                    {newsData?.data?.length > 0 && (
                        <div className="news-list">
                            {newsData.data.map((item: TradingViewNewsItem) => (
                                <a
                                    key={item.id}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="news-item"
                                >
                                    <div className="news-item-content">
                                        <h4 className="news-item-title">{item.title}</h4>
                                        {item.description && (
                                            <p className="news-item-desc">{item.description}</p>
                                        )}
                                        <div className="news-item-meta">
                                            <span className="news-item-source">{item.source}</span>
                                            <span className="news-item-date">
                                                {new Date(item.publishedOn).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                    {newsData?.data?.length === 0 && !isLoading && (
                        <p className="news-empty">{isRTL ? 'خبری یافت نشد' : 'No news found'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface SignalsPageProps {
    onSelectSymbol: (symbol: string) => void;
    onBack: () => void;
}

type Tab = 'signals' | 'pullbacks' | 'reapproach' | 'weekly-pullbacks' | 'weekly-reapproach' | 'weekly-above-ema50' | 'daily-above-ema50-long' | 'weekly-above-ema50-long' | '4h-pullbacks' | '4h-reapproach' | 'monthly-pullbacks' | 'monthly-reapproach';

const Icons = {
    trending: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M7 16l4-4 4 4 5-5"/>
        </svg>
    ),
    pullback4h: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V8"/>
            <path d="M8 16v-4"/>
            <path d="M16 16v-2"/>
            <circle cx="12" cy="6" r="2"/>
        </svg>
    ),
    reapproach4h: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h4l3-7 4 14 3-7h4"/>
        </svg>
    ),
    pullback: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h-6l-3 3-3-3H5"/>
            <path d="M12 3v14"/>
            <path d="M8 7l-4 4 4 4"/>
        </svg>
    ),
    reapproach: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    ),
    pullbackWeekly: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4"/>
            <path d="M8 2v4"/>
            <path d="M3 10h18"/>
            <path d="M8 14h.01"/>
            <path d="M12 14h.01"/>
            <path d="M16 14h.01"/>
        </svg>
    ),
    reapproachWeekly: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    pullbackMonthly: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2"/>
            <path d="M2 9h20"/>
            <path d="M6 13h2"/>
            <path d="M10 13h2"/>
            <path d="M14 13h2"/>
            <path d="M18 13h2"/>
            <path d="M6 17h2"/>
            <path d="M10 17h2"/>
            <path d="M14 17h2"/>
            <path d="M18 17h2"/>
        </svg>
    ),
    reapproachMonthly: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
    ),
    aboveEma: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5"/>
            <path d="M5 12l7-7 7 7"/>
        </svg>
    ),
    longEma: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5"/>
            <path d="M5 12l7-7 7 7"/>
            <path d="M5 19h14"/>
        </svg>
    ),
    longWeekly: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
    ),
};

export function SignalsPage({ onSelectSymbol, onBack }: SignalsPageProps) {
    const { isRTL } = useI18n();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<Tab | null>(null);
    const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());
    const [newsSymbol, setNewsSymbol] = useState<string | null>(null);
    const { progress: scanProgress, resetProgress } = useScanProgress();

    const { data: watchlistData } = useQuery({
        queryKey: ['watchlist'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3000/watchlist');
            if (!res.ok) return [];
            return res.json();
        },
    });

    useEffect(() => {
        if (watchlistData) {
            setWatchlistSymbols(new Set(watchlistData.map((item: { symbol: string }) => item.symbol)));
        }
    }, [watchlistData]);

    const addMutation = useMutation({
        mutationFn: addToWatchlist,
        onSuccess: (_, symbol) => {
            setWatchlistSymbols(prev => new Set([...prev, symbol]));
            queryClient.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });

    const handleAddToWatchlist = (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation();
        addMutation.mutate(symbol);
    };

    const { data: signalsData, isLoading: signalsLoading, refetch: refetchSignals } = useQuery({
        queryKey: ['signals'],
        queryFn: fetchLongs,
        enabled: activeTab === 'signals',
        staleTime: 60000,
    });

    const { data: pullbacksData, isLoading: pullbacksLoading, refetch: refetchPullbacks } = useQuery({
        queryKey: ['pullbacks'],
        queryFn: fetchPullbacks,
        enabled: activeTab === 'pullbacks',
        staleTime: 60000,
    });

    const { data: reapproachData, isLoading: reapproachLoading, refetch: refetchReapproach } = useQuery({
        queryKey: ['reapproach'],
        queryFn: fetchReapproach,
        enabled: activeTab === 'reapproach',
        staleTime: 60000,
    });

    const { data: weeklyPullbacksData, isLoading: weeklyPullbacksLoading, refetch: refetchWeeklyPullbacks } = useQuery({
        queryKey: ['weekly-pullbacks'],
        queryFn: fetchWeeklyPullbacks,
        enabled: activeTab === 'weekly-pullbacks',
        staleTime: 120000,
    });

    const { data: weeklyReapproachData, isLoading: weeklyReapproachLoading, refetch: refetchWeeklyReapproach } = useQuery({
        queryKey: ['weekly-reapproach'],
        queryFn: fetchWeeklyReapproach,
        enabled: activeTab === 'weekly-reapproach',
        staleTime: 120000,
    });

    const { data: weeklyAboveEma50Data, isLoading: weeklyAboveEma50Loading, refetch: refetchWeeklyAboveEma50 } = useQuery({
        queryKey: ['weekly-above-ema50'],
        queryFn: fetchWeeklyAboveEma50,
        enabled: activeTab === 'weekly-above-ema50',
        staleTime: 120000,
    });

    const { data: dailyAboveEma50LongData, isLoading: dailyAboveEma50LongLoading, refetch: refetchDailyAboveEma50Long } = useQuery({
        queryKey: ['daily-above-ema50-long'],
        queryFn: fetchDailyAboveEma50Long,
        enabled: activeTab === 'daily-above-ema50-long',
        staleTime: 120000,
    });

    const { data: weeklyAboveEma50LongData, isLoading: weeklyAboveEma50LongLoading, refetch: refetchWeeklyAboveEma50Long } = useQuery({
        queryKey: ['weekly-above-ema50-long'],
        queryFn: fetchWeeklyAboveEma50Long,
        enabled: activeTab === 'weekly-above-ema50-long',
        staleTime: 120000,
    });

    const { data: pullbacks4hData, isLoading: pullbacks4hLoading, refetch: refetchPullbacks4h } = useQuery({
        queryKey: ['4h-pullbacks'],
        queryFn: fetch4hPullbacks,
        enabled: activeTab === '4h-pullbacks',
        staleTime: 120000,
    });

    const { data: monthlyPullbacksData, isLoading: monthlyPullbacksLoading, refetch: refetchMonthlyPullbacks } = useQuery({
        queryKey: ['monthly-pullbacks'],
        queryFn: fetchMonthlyPullbacks,
        enabled: activeTab === 'monthly-pullbacks',
        staleTime: 300000,
    });

    const { data: monthlyReapproachData, isLoading: monthlyReapproachLoading, refetch: refetchMonthlyReapproach } = useQuery({
        queryKey: ['monthly-reapproach'],
        queryFn: fetchMonthlyReapproach,
        enabled: activeTab === 'monthly-reapproach',
        staleTime: 300000,
    });

    const { data: reapproach4hData, isLoading: reapproach4hLoading, refetch: refetchReapproach4h } = useQuery({
        queryKey: ['4h-reapproach'],
        queryFn: fetch4hReapproach,
        enabled: activeTab === '4h-reapproach',
        staleTime: 120000,
    });

    const handleRefresh = () => {
        if (activeTab === 'signals') refetchSignals();
        else if (activeTab === 'pullbacks') refetchPullbacks();
        else if (activeTab === 'reapproach') refetchReapproach();
        else if (activeTab === 'weekly-pullbacks') refetchWeeklyPullbacks();
        else if (activeTab === 'weekly-reapproach') refetchWeeklyReapproach();
        else if (activeTab === 'weekly-above-ema50') refetchWeeklyAboveEma50();
        else if (activeTab === 'daily-above-ema50-long') refetchDailyAboveEma50Long();
        else if (activeTab === '4h-pullbacks') refetchPullbacks4h();
        else if (activeTab === '4h-reapproach') refetchReapproach4h();
        else if (activeTab === 'monthly-pullbacks') refetchMonthlyPullbacks();
        else if (activeTab === 'monthly-reapproach') refetchMonthlyReapproach();
        else refetchWeeklyAboveEma50Long();
    };

    const isLoading = signalsLoading || pullbacksLoading || reapproachLoading || weeklyPullbacksLoading || weeklyReapproachLoading || weeklyAboveEma50Loading || dailyAboveEma50LongLoading || weeklyAboveEma50LongLoading || pullbacks4hLoading || monthlyPullbacksLoading || monthlyReapproachLoading || reapproach4hLoading;

    const handleOpenTradingView = (symbol: string) => {
        window.open(`https://www.tradingview.com/symbols/${symbol}/`, '_blank');
    };

    const handleOpenNews = (symbol: string) => {
        setNewsSymbol(symbol);
    };

    const renderSignalItem = (item: SymbolSignal, index: number) => (
        <div key={item.symbol} className="signal-item" onClick={() => onSelectSymbol(item.symbol)}>
            <div className="signal-rank">{index + 1}</div>
            <div className="signal-info">
                <span className="signal-symbol">{item.symbol}</span>
                <span className={`signal-badge ${item.signal.includes('LONG') ? 'long' : 'short'}`}>
                    {item.signal === 'STRONG_LONG' || item.signal === 'STRONG_SHORT' ? '🚀' : '📈'} {item.score.toFixed(0)}
                </span>
            </div>
            <div className="signal-stats">
                <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                    {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                </span>
                <span className="signal-stat">OI {item.oiChange > 0 ? '+' : ''}{item.oiChange.toFixed(1)}%</span>
            </div>
            <div className="signal-actions">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenNews(item.symbol); }}
                    title={isRTL ? 'اخبار' : 'News'}
                >
                    📰
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenTradingView(item.symbol); }}
                    title="TradingView"
                >
                    📉
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleAddToWatchlist(e, item.symbol)}
                >
                    {watchlistSymbols.has(item.symbol) ? '⭐' : '☆'}
                </Button>
            </div>
        </div>
    );

    const renderPullbackItem = (item: PullbackSignal, index: number) => (
        <div key={item.symbol} className={`signal-item ${item.maPullback === 'BULLISH_PULLBACK' ? 'pullback-bull' : 'pullback-bear'}`} onClick={() => onSelectSymbol(item.symbol)}>
            <div className="signal-rank">{index + 1}</div>
            <div className="signal-info">
                <span className="signal-symbol">{item.symbol}</span>
                <span className="signal-badge pullback">
                    {item.maPullback === 'BULLISH_PULLBACK' ? '🟢' : '🔴'} ×{item.maPullbackTouches}
                </span>
            </div>
            <div className="signal-stats">
                <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                    {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                </span>
                <span className="signal-stat">EMA50: {item.priceVsEma50 !== null ? `${item.priceVsEma50 > 0 ? '+' : ''}${item.priceVsEma50.toFixed(1)}%` : '-'}</span>
            </div>
            <div className="signal-actions">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenNews(item.symbol); }}
                    title={isRTL ? 'اخبار' : 'News'}
                >
                    📰
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenTradingView(item.symbol); }}
                    title="TradingView"
                >
                    📉
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleAddToWatchlist(e, item.symbol)}
                >
                    {watchlistSymbols.has(item.symbol) ? '⭐' : '☆'}
                </Button>
            </div>
        </div>
    );

    const renderReapproachItem = (item: ReapproachSignal, index: number) => (
        <div key={item.symbol} className={`signal-item ${item.maReapproach === 'BULLISH_REAPPROACH' ? 'pullback-bull' : 'pullback-bear'}`} onClick={() => onSelectSymbol(item.symbol)}>
            <div className="signal-rank">{index + 1}</div>
            <div className="signal-info">
                <span className="signal-symbol">{item.symbol}</span>
                <span className="signal-badge reapproach">
                    {item.maReapproach === 'BULLISH_REAPPROACH' ? '🔼' : '🔽'} {item.currentDistance !== null ? `${item.currentDistance > 0 ? '+' : ''}${item.currentDistance.toFixed(1)}%` : '-'}
                </span>
            </div>
            <div className="signal-stats">
                <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                    {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                </span>
                <span className="signal-stat">EMA50: {item.priceVsEma50 !== null ? `${item.priceVsEma50 > 0 ? '+' : ''}${item.priceVsEma50.toFixed(1)}%` : '-'}</span>
            </div>
            <div className="signal-actions">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenNews(item.symbol); }}
                    title={isRTL ? 'اخبار' : 'News'}
                >
                    📰
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleOpenTradingView(item.symbol); }}
                    title="TradingView"
                >
                    📉
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleAddToWatchlist(e, item.symbol)}
                >
                    {watchlistSymbols.has(item.symbol) ? '⭐' : '☆'}
                </Button>
            </div>
        </div>
    );

    return (
        <>
        <div className="signals-page">
            <div className="signals-header">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    ← {isRTL ? 'بازگشت' : 'Back'}
                </Button>
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                        <path d="M3 3v18h18"/>
                        <path d="M7 16l4-4 4 4 5-5"/>
                    </svg>
                    {isRTL ? 'سیگنال‌های بازار' : 'Market Signals'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    🔄
                </Button>
            </div>

            <div className="signals-tabs">
                <button className={`signals-tab ${activeTab === 'signals' ? 'active' : ''}`} onClick={() => setActiveTab('signals')}>
                    {Icons.trending}
                    <span>{isRTL ? 'لانگ/شورت' : 'Longs/Shorts'}</span>
                </button>
                <button className={`signals-tab ${activeTab === '4h-pullbacks' ? 'active' : ''}`} onClick={() => setActiveTab('4h-pullbacks')}>
                    {Icons.pullback4h}
                    <span>{isRTL ? 'پولبک 4ساعته' : '4h Pullback'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === '4h-reapproach' ? 'active' : ''}`} onClick={() => setActiveTab('4h-reapproach')}>
                    {Icons.reapproach4h}
                    <span>{isRTL ? 'برخورد 4ساعته' : '4h Reapproach'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'pullbacks' ? 'active' : ''}`} onClick={() => setActiveTab('pullbacks')}>
                    {Icons.pullback}
                    <span>{isRTL ? 'پولبک روزانه' : 'Daily Pullback'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'reapproach' ? 'active' : ''}`} onClick={() => setActiveTab('reapproach')}>
                    {Icons.reapproach}
                    <span>{isRTL ? 'برخورد روزانه' : 'Daily Reapproach'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'weekly-pullbacks' ? 'active' : ''}`} onClick={() => setActiveTab('weekly-pullbacks')}>
                    {Icons.pullbackWeekly}
                    <span>{isRTL ? 'پولبک هفتگی' : 'Weekly Pullback'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'weekly-reapproach' ? 'active' : ''}`} onClick={() => setActiveTab('weekly-reapproach')}>
                    {Icons.reapproachWeekly}
                    <span>{isRTL ? 'برخورد هفتگی' : 'Weekly Reapproach'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'monthly-pullbacks' ? 'active' : ''}`} onClick={() => setActiveTab('monthly-pullbacks')}>
                    {Icons.pullbackMonthly}
                    <span>{isRTL ? 'پولبک ماهانه' : 'Monthly Pullback'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'monthly-reapproach' ? 'active' : ''}`} onClick={() => setActiveTab('monthly-reapproach')}>
                    {Icons.reapproachMonthly}
                    <span>{isRTL ? 'برخورد ماهانه' : 'Monthly Reapproach'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'weekly-above-ema50' ? 'active' : ''}`} onClick={() => setActiveTab('weekly-above-ema50')}>
                    {Icons.aboveEma}
                    <span>{isRTL ? 'بالای EMA' : 'Above EMA'}</span>
                    <span className="tab-subtitle">{isRTL ? 'هفتگی' : 'Weekly'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'daily-above-ema50-long' ? 'active' : ''}`} onClick={() => setActiveTab('daily-above-ema50-long')}>
                    {Icons.longEma}
                    <span>{isRTL ? 'لانگ + EMA' : 'Long + EMA'}</span>
                    <span className="tab-subtitle">{isRTL ? 'روزانه' : 'Daily'}</span>
                </button>
                <button className={`signals-tab ${activeTab === 'weekly-above-ema50-long' ? 'active' : ''}`} onClick={() => setActiveTab('weekly-above-ema50-long')}>
                    {Icons.longWeekly}
                    <span>{isRTL ? 'لانگ + هفتگی' : 'Long + Weekly'}</span>
                    <span className="tab-subtitle">{isRTL ? 'EMA50' : 'EMA50'}</span>
                </button>
            </div>

            {activeTab === 'signals' && (
                <div className="signals-content">
                    {signalsLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {signalsData && (
                        <>
                            {signalsData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🟢 {isRTL ? 'فرصت‌های لانگ' : 'Long Opportunities'}</h4>
                                    {signalsData.longs.map((item, i) => renderSignalItem(item, i))}
                                </div>
                            )}
                            {signalsData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔴 {isRTL ? 'فرصت‌های شورت' : 'Short Opportunities'}</h4>
                                    {signalsData.shorts.map((item, i) => renderSignalItem(item, i))}
                                </div>
                            )}
                            {signalsData.longs.length === 0 && signalsData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'pullbacks' && (
                <div className="signals-content">
                    {pullbacksLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {pullbacksData && (
                        <>
                            {pullbacksData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🟢 {isRTL ? 'پولبک صعودی (حمایت)' : 'Bullish Pullback (Support)'}</h4>
                                    {pullbacksData.longs.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {pullbacksData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔴 {isRTL ? 'پولبک نزولی (مقاومت)' : 'Bearish Pullback (Resistance)'}</h4>
                                    {pullbacksData.shorts.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {pullbacksData.longs.length === 0 && pullbacksData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'پولبکی یافت نشد' : 'No pullbacks found'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'reapproach' && (
                <div className="signals-content">
                    {reapproachLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {reapproachData && (
                        <>
                            {reapproachData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔼 {isRTL ? 'برخورد صعودی' : 'Bullish Reapproach'}</h4>
                                    {reapproachData.longs.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {reapproachData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔽 {isRTL ? 'برخورد نزولی' : 'Bearish Reapproach'}</h4>
                                    {reapproachData.shorts.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {reapproachData.longs.length === 0 && reapproachData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No reapproach signals'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'weekly-pullbacks' && (
                <div className="signals-content">
                    {weeklyPullbacksLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {weeklyPullbacksData && (
                        <>
                            {weeklyPullbacksData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🟢 {isRTL ? 'پولبک صعودی هفتگی' : 'Weekly Bullish Pullback'}</h4>
                                    {weeklyPullbacksData.longs.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {weeklyPullbacksData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔴 {isRTL ? 'پولبک نزولی هفتگی' : 'Weekly Bearish Pullback'}</h4>
                                    {weeklyPullbacksData.shorts.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {weeklyPullbacksData.longs.length === 0 && weeklyPullbacksData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'پولبکی یافت نشد' : 'No weekly pullbacks'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'weekly-reapproach' && (
                <div className="signals-content">
                    {weeklyReapproachLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {weeklyReapproachData && (
                        <>
                            {weeklyReapproachData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔼 {isRTL ? 'برخورد صعودی هفتگی' : 'Weekly Bullish Reapproach'}</h4>
                                    {weeklyReapproachData.longs.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {weeklyReapproachData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔽 {isRTL ? 'برخورد نزولی هفتگی' : 'Weekly Bearish Reapproach'}</h4>
                                    {weeklyReapproachData.shorts.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {weeklyReapproachData.longs.length === 0 && weeklyReapproachData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No weekly reapproach'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'weekly-above-ema50' && (
                <div className="signals-content">
                    {weeklyAboveEma50Loading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {weeklyAboveEma50Data && (
                        <>
                            {weeklyAboveEma50Data.symbols.length > 0 && (
                                <div className="signals-section">
                                    <h4>⬆️ {isRTL ? 'بالای EMA50 هفتگی' : 'Weekly Above EMA50'}</h4>
                                     {weeklyAboveEma50Data.symbols.map((item, i) => (
                                        <div key={item.symbol} className="signal-item pullback-bull" onClick={() => onSelectSymbol(item.symbol)}>
                                            <div className="signal-rank">{i + 1}</div>
                                            <div className="signal-info">
                                                <span className="signal-symbol">{item.symbol}</span>
                                                <span className="signal-badge long">↑ {item.priceVsEma50 !== null ? `+${item.priceVsEma50.toFixed(1)}%` : '-'}</span>
                                            </div>
                                            <div className="signal-stats">
                                                <span className="signal-stat pos">{item.priceVsEma50 !== null ? `+${item.priceVsEma50.toFixed(2)}%` : '-'}</span>
                                            </div>
                                             <div className="signal-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenNews(item.symbol); }}
                                                    title={isRTL ? 'اخبار' : 'News'}
                                                >
                                                    📰
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenTradingView(item.symbol); }}
                                                    title="TradingView"
                                                >
                                                    📉
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleAddToWatchlist(e, item.symbol)}
                                                >
                                                    {watchlistSymbols.has(item.symbol) ? '⭐' : '☆'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {weeklyAboveEma50Data.symbols.length === 0 && (
                                <p className="empty">{isRTL ? 'ارزی بالای EMA50 هفتگی یافت نشد' : 'No symbols above weekly EMA50'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'daily-above-ema50-long' && (
                <div className="signals-content">
                    {dailyAboveEma50LongLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {dailyAboveEma50LongData && (
                        <>
                            {dailyAboveEma50LongData.symbols.length > 0 && (
                                <div className="signals-section">
                                    <h4>🚀 {isRTL ? 'لانگ + بالای EMA50 روزانه' : 'Long + Daily Above EMA50'}</h4>
                                    {dailyAboveEma50LongData.symbols.map((item, i) => (
                                        <div key={item.symbol} className="signal-item pullback-bull" onClick={() => onSelectSymbol(item.symbol)}>
                                            <div className="signal-rank">{i + 1}</div>
                                            <div className="signal-info">
                                                <span className="signal-symbol">{item.symbol}</span>
                                                <span className="signal-badge long">↑ {item.priceVsEma50 !== null ? `+${item.priceVsEma50.toFixed(1)}%` : '-'}</span>
                                            </div>
                                            <div className="signal-stats">
                                                <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                                                    {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                                                </span>
                                                <span className="signal-stat">Score: {item.score.toFixed(0)}</span>
                                            </div>
                                            <div className="signal-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenNews(item.symbol); }}
                                                    title={isRTL ? 'اخبار' : 'News'}
                                                >
                                                    📰
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenTradingView(item.symbol); }}
                                                    title="TradingView"
                                                >
                                                    📉
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleAddToWatchlist(e, item.symbol)}
                                                >
                                                    {watchlistSymbols.has(item.symbol) ? '⭐' : '☆'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {dailyAboveEma50LongData.symbols.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'weekly-above-ema50-long' && (
                <div className="signals-content">
                    {weeklyAboveEma50LongLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {weeklyAboveEma50LongData && (
                        <>
                            {weeklyAboveEma50LongData.symbols.length > 0 && (
                                <div className="signals-section">
                                    <h4>🌟 {isRTL ? 'لانگ + بالای EMA50 هفتگی' : 'Long + Weekly Above EMA50'}</h4>
                                    {weeklyAboveEma50LongData.symbols.map((item, i) => (
                                        <div key={item.symbol} className="signal-item pullback-bull" onClick={() => onSelectSymbol(item.symbol)}>
                                            <div className="signal-rank">{i + 1}</div>
                                            <div className="signal-info">
                                                <span className="signal-symbol">{item.symbol}</span>
                                                <span className="signal-badge long">↑ {item.priceVsEma50 !== null ? `+${item.priceVsEma50.toFixed(1)}%` : '-'}</span>
                                            </div>
                                            <div className="signal-stats">
                                                <span className={`signal-stat ${item.priceChange >= 0 ? 'pos' : 'neg'}`}>
                                                    {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}%
                                                </span>
                                                <span className="signal-stat">Score: {item.score.toFixed(0)}</span>
                                            </div>
                                            <div className="signal-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenNews(item.symbol); }}
                                                    title={isRTL ? 'اخبار' : 'News'}
                                                >
                                                    📰
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenTradingView(item.symbol); }}
                                                    title="TradingView"
                                                >
                                                    📉
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => handleAddToWatchlist(e, item.symbol)}
                                                >
                                                    {watchlistSymbols.has(item.symbol) ? '⭐' : '☆'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {weeklyAboveEma50LongData.symbols.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No signals found'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === '4h-pullbacks' && (
                <div className="signals-content">
                    {pullbacks4hLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {pullbacks4hData && (
                        <>
                            {pullbacks4hData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🟢 {isRTL ? 'پولبک صعودی 4ساعته' : '4h Bullish Pullback'}</h4>
                                    {pullbacks4hData.longs.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {pullbacks4hData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔴 {isRTL ? 'پولبک نزولی 4ساعته' : '4h Bearish Pullback'}</h4>
                                    {pullbacks4hData.shorts.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {pullbacks4hData.longs.length === 0 && pullbacks4hData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'پولبکی یافت نشد' : 'No 4h pullbacks'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'monthly-pullbacks' && (
                <div className="signals-content">
                    {monthlyPullbacksLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {monthlyPullbacksData && (
                        <>
                            {monthlyPullbacksData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🟢 {isRTL ? 'پولبک صعودی ماهانه' : 'Monthly Bullish Pullback'}</h4>
                                    {monthlyPullbacksData.longs.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {monthlyPullbacksData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔴 {isRTL ? 'پولبک نزولی ماهانه' : 'Monthly Bearish Pullback'}</h4>
                                    {monthlyPullbacksData.shorts.map((item, i) => renderPullbackItem(item, i))}
                                </div>
                            )}
                            {monthlyPullbacksData.longs.length === 0 && monthlyPullbacksData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'پولبکی یافت نشد' : 'No monthly pullbacks'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'monthly-reapproach' && (
                <div className="signals-content">
                    {monthlyReapproachLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {monthlyReapproachData && (
                        <>
                            {monthlyReapproachData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔼 {isRTL ? 'برخورد صعودی ماهانه' : 'Monthly Bullish Reapproach'}</h4>
                                    {monthlyReapproachData.longs.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {monthlyReapproachData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔽 {isRTL ? 'برخورد نزولی ماهانه' : 'Monthly Bearish Reapproach'}</h4>
                                    {monthlyReapproachData.shorts.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                             {monthlyReapproachData.longs.length === 0 && monthlyReapproachData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No monthly reapproach'}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === '4h-reapproach' && (
                <div className="signals-content">
                    {reapproach4hLoading && <Loading isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0} />}
                    {reapproach4hData && (
                        <>
                            {reapproach4hData.longs.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔼 {isRTL ? 'برخورد صعودی 4ساعته' : '4h Bullish Reapproach'}</h4>
                                    {reapproach4hData.longs.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {reapproach4hData.shorts.length > 0 && (
                                <div className="signals-section">
                                    <h4>🔽 {isRTL ? 'برخورد نزولی 4ساعته' : '4h Bearish Reapproach'}</h4>
                                    {reapproach4hData.shorts.map((item, i) => renderReapproachItem(item, i))}
                                </div>
                            )}
                            {reapproach4hData.longs.length === 0 && reapproach4hData.shorts.length === 0 && (
                                <p className="empty">{isRTL ? 'سیگنالی یافت نشد' : 'No 4h reapproach'}</p>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
        {newsSymbol && (
            <NewsPanel
                symbol={newsSymbol}
                isRTL={isRTL} progress={scanProgress?.current ?? 0} total={scanProgress?.total ?? 0}
                onClose={() => setNewsSymbol(null)}
            />
        )}
        </>
    );
}
