import { Toaster, toast } from 'react-hot-toast';
import { useExchangeBlockNotifier } from './hooks/useExchangeBlockNotifier';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketData } from './hooks/useMarketData';
import { useOpenInterest } from './hooks/useOpenInterest';
import { useFundingRate } from './hooks/useFundingRate';
import { useEvents } from './hooks/useEvents';
import { useScanNotification } from './hooks/useScanNotification';
import { HomePage } from './pages/HomePage';
import { SignalsPage } from './pages/SignalsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { FourHourSignalsPage } from './pages/FourHourSignalsPage';
import { LongShortSignalsPage } from './pages/LongShortSignalsPage';
import { VolumeProfilePage } from './pages/VolumeProfilePage';
import { NewListingsPage } from './pages/NewListingsPage';
import { LogsPage } from './pages/LogsPage';
import { PumpDetectorPage } from './pages/PumpDetectorPage';
import { DumpDetectorPage } from './pages/DumpDetectorPage';
import { PreMoveDetectorPage } from './pages/PreMoveDetectorPage';
import { SafeSellPage } from './pages/SafeSellPage';
import { MarketSummary } from './components/MarketSummary';
import { VolumeChart } from './components/VolumeChart';
import { OpenInterestChart } from './components/OpenInterestChart';
import { FundingRateChart } from './components/FundingRateChart';
import { MarketSignal } from './components/MarketSignal';
import { NewsList } from './components/NewsList';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { FuturesSymbolsButton } from './components/FuturesSymbolsButton';
import { Loading } from './components/Loading';
import { Button } from './components/Button';
import { VolumeProfileTab } from './components/VolumeProfileTab';
import { ExchangeDropdown } from './components/ExchangeDropdown';
import { useI18n } from './i18n';
import { useExchange } from './contexts/ExchangeContext';
import './App.css';
import './components/MarketControls.css';
import './components/NewsList.css';
import './pages/SignalsPage.css';
import './pages/WatchlistPage.css';
import './pages/FourHourSignalsPage.css';
import './pages/LongShortSignalsPage.css';
import './pages/VolumeProfilePage.css';
import './pages/NewListingsPage.css';
import './pages/LogsPage.css';
import './pages/PumpDetectorPage.css';
import './pages/SafeSellPage.css';
import './components/ExchangeDropdown.css';
import './pages/NewListingsPage.css';

type Page = 'home' | 'detail' | 'signals' | 'watchlist' | 'four-hour-signals' | 'long-short-signals' | 'volume-profile' | 'new-listings' | 'logs' | 'pump-detector' | 'dump-detector' | 'pre-move-detector' | 'safe-sell';
type TabId = 'charts' | 'signals' | 'news' | 'events' | 'tradingview-news' | 'important-news' | 'volume-profile';

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

function TradingViewNews({ symbol, isRTL }: { symbol: string; isRTL: boolean }) {
    const { data: newsData, isLoading, isError } = useQuery({
        queryKey: ['tradingview-news', symbol, isRTL ? 'fa' : 'en'],
        queryFn: async () => {
            const lang = isRTL ? 'fa' : 'en';
            const res = await fetch(`http://localhost:3000/news/tradingview?symbol=${symbol}&limit=20&lang=${lang}`);
            if (!res.ok) throw new Error('Failed to fetch news');
            return res.json();
        },
        staleTime: 120000,
    });

    if (isLoading) {
        return <Loading isRTL={isRTL} />;
    }

    if (isError) {
        return (
            <div className="error-state">
                <span>⚠️</span>
                <span>{isRTL ? 'خطا در بارگذاری اخبار' : 'Failed to load news'}</span>
            </div>
        );
    }

    const items: TradingViewNewsItem[] = newsData?.data ?? [];

    if (items.length === 0) {
        return (
            <p className="placeholder-text">
                {isRTL ? 'خبری یافت نشد' : 'No news found'}
            </p>
        );
    }

    return (
        <div className="tradingview-news-list">
            <h3 className="news-section-title">
                📺 {isRTL ? 'اخبار تریدینگ‌ویو' : 'TradingView News'} - {symbol}
            </h3>
            {items.map((item) => (
                <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tradingview-news-item"
                >
                    <div className="tradingview-news-content">
                        <h4 className="tradingview-news-title">{item.title}</h4>
                        {item.description && (
                            <p className="tradingview-news-desc">{item.description}</p>
                        )}
                        <div className="tradingview-news-meta">
                            <span className="tradingview-news-source">{item.source}</span>
                            <span className="tradingview-news-date">
                                {new Date(item.publishedOn).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}

function ImportantNews({ isRTL }: { isRTL: boolean }) {
    const { data: newsData, isLoading, isError } = useQuery({
        queryKey: ['important-news', isRTL ? 'fa' : 'en'],
        queryFn: async () => {
            const lang = isRTL ? 'fa' : 'en';
            const res = await fetch(`http://localhost:3000/news/important?limit=30&lang=${lang}`);
            if (!res.ok) throw new Error('Failed to fetch important news');
            return res.json();
        },
        staleTime: 120000,
    });

    if (isLoading) {
        return <Loading isRTL={isRTL} />;
    }

    if (isError) {
        return (
            <div className="error-state">
                <span>⚠️</span>
                <span>{isRTL ? 'خطا در بارگذاری اخبار' : 'Failed to load news'}</span>
            </div>
        );
    }

    const items: TradingViewNewsItem[] = newsData?.data ?? [];

    if (items.length === 0) {
        return (
            <p className="placeholder-text">
                {isRTL ? 'خبری یافت نشد' : 'No news found'}
            </p>
        );
    }

    return (
        <div className="tradingview-news-list">
            <h3 className="news-section-title">
                🌍 {isRTL ? 'اخبار مهم بازار' : 'Important Market News'}
            </h3>
            {items.map((item) => (
                <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tradingview-news-item"
                >
                    <div className="tradingview-news-content">
                        <h4 className="tradingview-news-title">{item.title}</h4>
                        {item.description && (
                            <p className="tradingview-news-desc">{item.description}</p>
                        )}
                        <div className="tradingview-news-meta">
                            <span className="tradingview-news-source">{item.source}</span>
                            <span className="tradingview-news-date">
                                {new Date(item.publishedOn).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}

function App() {
    const { t, isRTL } = useI18n();
    useScanNotification();

    const getPageFromUrl = (): Page => {
        if (window.location.pathname === '/signals') return 'signals';
        if (window.location.pathname === '/watchlist') return 'watchlist';
        if (window.location.pathname === '/four-hour-signals') return 'four-hour-signals';
        if (window.location.pathname === '/long-short-signals') return 'long-short-signals';
        if (window.location.pathname === '/volume-profile') return 'volume-profile';
    if (window.location.pathname === '/new-listings') return 'new-listings';
    if (window.location.pathname === '/logs') return 'logs';
        if (window.location.pathname === '/pump-detector') return 'pump-detector';
        if (window.location.pathname === '/dump-detector') return 'dump-detector';
        if (window.location.pathname === '/pre-move-detector') return 'pre-move-detector';
        if (window.location.pathname === '/safe-sell') return 'safe-sell';
        const params = new URLSearchParams(window.location.search);
        return params.get('symbol') ? 'detail' : 'home';
    };

    const [page, setPage] = useState<Page>(getPageFromUrl);
    const [symbol, setSymbol] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('symbol') || 'BTCUSDT';
    });
    const [activeTab, setActiveTab] = useState<TabId>('charts');
    const { exchange, setExchange } = useExchange();

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const s = params.get('symbol');

            if (window.location.pathname === '/signals') {
                setPage('signals');
            } else if (window.location.pathname === '/watchlist') {
                setPage('watchlist');
            } else if (window.location.pathname === '/four-hour-signals') {
                setPage('four-hour-signals');
            } else if (window.location.pathname === '/long-short-signals') {
                setPage('long-short-signals');
            } else if (window.location.pathname === '/volume-profile') {
                setPage('volume-profile');
            } else if (window.location.pathname === '/new-listings') {
                setPage('new-listings');
            } else if (window.location.pathname === '/logs') {
                setPage('logs');
            } else if (window.location.pathname === '/pump-detector') {
                setPage('pump-detector');
            } else if (window.location.pathname === '/dump-detector') {
                setPage('dump-detector');
            } else if (window.location.pathname === '/pre-move-detector') {
                setPage('pre-move-detector');
            } else if (window.location.pathname === '/safe-sell') {
                setPage('safe-sell');
            } else if (s) {
                setSymbol(s.toUpperCase());
                setPage('detail');
            } else {
                setPage('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleSearch = useCallback(
        (newSymbol: string) => {
            const url = new URL(window.location.href);
            url.searchParams.set('symbol', newSymbol);
            window.history.pushState({}, '', url.toString());
            setSymbol(newSymbol);
            setActiveTab('charts');
            setPage('detail');
        },
        [],
    );

    const handleBack = useCallback(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('symbol');
        window.history.pushState({}, '', url.toString());
        setPage('home');
    }, []);

    const handleNavigateToPullbacks = useCallback(() => {
        window.history.pushState({}, '', '/signals');
        setPage('signals');
    }, []);

    const handleBackFromPullbacks = useCallback(() => {
        window.history.pushState({}, '', window.location.pathname === '/signals' ? '/' : window.location.pathname);
        setPage('home');
    }, []);

    const {
        data,
        isLoading,
        isError,
        error,
    } = useMarketData({
        symbol,
        interval: '15m',
        range: '24h',
        exchange,
    });

    const {
        data: openInterestData,
    } = useOpenInterest({
        symbol,
        range: '24h',
        exchange,
    });

    const {
        data: fundingData,
    } = useFundingRate({
        symbol,
        range: '24h',
        exchange,
    });

    const {
        data: eventsData,
        isLoading: eventsLoading,
        isError: eventsError,
    } = useEvents({
        symbol,
        limit: 20,
        lang: isRTL ? 'fa' : 'en',
    });

    const totalVolume = useMemo(() => {
        return (
            data?.reduce(
                (total, item) =>
                    total + item.volume,
                0,
            ) ?? 0
        );
    }, [data]);

    const handleNavigateToWatchlist = useCallback(() => {
        window.history.pushState({}, '', '/watchlist');
        setPage('watchlist');
    }, []);

    const handleBackFromWatchlist = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToFourHourSignals = useCallback(() => {
        window.history.pushState({}, '', '/four-hour-signals');
        setPage('four-hour-signals');
    }, []);

    const handleBackFromFourHourSignals = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToLongShortSignals = useCallback(() => {
        window.history.pushState({}, '', '/long-short-signals');
        setPage('long-short-signals');
    }, []);

    const handleNavigateToVolumeProfile = useCallback(() => {
        window.history.pushState({}, '', '/volume-profile');
        setPage('volume-profile');
    }, []);

    const handleNavigateToNewListings = useCallback(() => {
        window.history.pushState({}, '', '/new-listings');
        setPage('new-listings');
    }, []);

    const handleNavigateToLogs = useCallback(() => {
        window.history.pushState({}, '', '/logs');
        setPage('logs');
    }, []);

    const handleNavigateToPumpDetector = useCallback(() => {
        window.history.pushState({}, '', '/pump-detector');
        setPage('pump-detector');
    }, []);

    const handleNavigateToDumpDetector = useCallback(() => {
        window.history.pushState({}, '', '/dump-detector');
        setPage('dump-detector');
    }, []);

    const handleNavigateToPreMoveDetector = useCallback(() => {
        window.history.pushState({}, '', '/pre-move-detector');
        setPage('pre-move-detector');
    }, []);

    const handleNavigateToSafeSell = useCallback(() => {
        window.history.pushState({}, '', '/safe-sell');
        setPage('safe-sell');
    }, []);

    const { blockCount } = useExchangeBlockNotifier();

    if (blockCount > 0) {
        return (
            <>
                <Toaster toastOptions={{ style: { zIndex: 10000 } }} />
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9000,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'all',
                    cursor: 'not-allowed',
                }}>
                    <div style={{
                        background: '#1e293b',
                        border: '2px solid #ef4444',
                        borderRadius: '16px',
                        padding: '32px 40px',
                        textAlign: 'center',
                        maxWidth: '450px',
                        color: '#e2e8f0',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                        <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#fca5a5' }}>
                            IP Rate Limited / Banned
                        </h2>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.8 }}>
                            All features disabled — circuit breaker active ({blockCount} blocks)
                        </p>
                        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
                            Wait for automatic reset or click below to retry
                        </p>
                        <button
                            onClick={async () => {
                                try {
                                    await fetch('http://localhost:3000/exchange/circuit-breakers/reset', { method: 'POST' });
                                    window.location.reload();
                                } catch {
                                    toast.error('Failed to reset circuit breaker');
                                }
                            }}
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 24px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                        >
                            🔄 Try Reset Circuit Breaker
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (page === 'home') {
        return (
            <>
                <Toaster />
                <div className="app-container">
                <div className="app-header">
                    <div className="header-content">
                        <div>
                            <h1 className="app-title">
                                {t.app.title}
                            </h1>
                            <p className="app-subtitle">
                                {t.app.subtitle}
                            </p>
                        </div>
                        <div className="header-actions">
                            <LanguageSwitcher />
                            <ExchangeDropdown
                                selected={exchange}
                                onChange={setExchange}
                                isRTL={isRTL}
                            />
                        </div>
                    </div>
                    <FuturesSymbolsButton />
                    <div className="home-buttons">
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                            }
                            onClick={handleNavigateToPullbacks}
                        >
                            {isRTL ? 'سیگنال‌های بازار' : 'Market Signals'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                                </svg>
                            }
                            onClick={handleNavigateToWatchlist}
                        >
                            {isRTL ? 'واچ لیست' : 'Watchlist'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                            }
                            onClick={handleNavigateToFourHourSignals}
                        >
                            {isRTL ? 'سیگنال‌های ۴ساعته' : '4h Signals'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20V10"/>
                                    <path d="M18 20V4"/>
                                    <path d="M6 20v-4"/>
                                </svg>
                            }
                            onClick={handleNavigateToLongShortSignals}
                        >
                            {isRTL ? 'لانگ و شورت' : 'Long & Short'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <path d="M3 9h18"/>
                                    <path d="M9 21V9"/>
                                </svg>
                            }
                            onClick={handleNavigateToVolumeProfile}
                        >
                            {isRTL ? 'والیوم پروفایل' : 'Volume Profile'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M2 12h20"/>
                                </svg>
                            }
                            onClick={handleNavigateToNewListings}
                        >
                            {isRTL ? 'ارزهای جدید' : 'New Listings'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                            }
                            onClick={handleNavigateToLogs}
                        >
                            {isRTL ? 'لاگ‌ها' : 'Logs'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/>
                                    <circle cx="12" cy="6" r="3"/>
                                </svg>
                            }
                            onClick={handleNavigateToPumpDetector}
                        >
                            {isRTL ? 'ردیاب پامپ' : 'Pump Detector'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 17.08V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.92"/>
                                    <path d="M12 17V3"/>
                                    <path d="M5 10l7 7 7-7"/>
                                </svg>
                            }
                            onClick={handleNavigateToDumpDetector}
                        >
                            {isRTL ? 'ردیاب دامپ' : 'Dump Detector'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            }
                            onClick={handleNavigateToPreMoveDetector}
                        >
                            {isRTL ? 'پیش‌بینی حرکت' : 'Pre-Move'}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M2 12h20"/>
                                </svg>
                            }
                            onClick={handleNavigateToSafeSell}
                        >
                            {isRTL ? 'فروش ایمن' : 'Safe Sell'}
                        </Button>
                    </div>
                </div>
                <HomePage onSearch={handleSearch} />
            </div>
            </>
        );
    }

    if (page === 'signals') {
        return (
            <>
                <Toaster />
                <SignalsPage
                    onSelectSymbol={handleSearch}
                    onBack={handleBackFromPullbacks}
                />
            </>
        );
    }

    if (page === 'watchlist') {
        return (
            <>
                <Toaster />
                <WatchlistPage
                    onSelectSymbol={handleSearch}
                    onBack={handleBackFromWatchlist}
                />
            </>
        );
    }

    if (page === 'four-hour-signals') {
        return (
            <>
                <Toaster />
                <FourHourSignalsPage
                    onSelectSymbol={handleSearch}
                    onBack={handleBackFromFourHourSignals}
                />
            </>
        );
    }

    if (page === 'long-short-signals') {
        return (
            <>
                <Toaster />
                <LongShortSignalsPage />
            </>
        );
    }

    if (page === 'volume-profile') {
        return (
            <>
                <Toaster />
                <VolumeProfilePage />
            </>
        );
    }

    if (page === 'new-listings') {
        return (
            <>
                <Toaster />
                <NewListingsPage />
            </>
        );
    }

    if (page === 'logs') {
        return (
            <>
                <Toaster />
                <LogsPage />
            </>
        );
    }

    if (page === 'pump-detector') {
        return (
            <>
                <Toaster />
                <PumpDetectorPage />
            </>
        );
    }

    if (page === 'dump-detector') {
        return (
            <>
                <Toaster />
                <DumpDetectorPage />
            </>
        );
    }

    if (page === 'pre-move-detector') {
        return (
            <>
                <Toaster />
                <PreMoveDetectorPage />
            </>
        );
    }

    if (page === 'safe-sell') {
        return (
            <>
                <Toaster />
                <SafeSellPage />
            </>
        );
    }

    const tabs: { id: TabId; label: string; icon: string }[] =
        isRTL
            ? [
                  {
                      id: 'charts',
                      label: 'نمودارها',
                      icon: '📊',
                  },
                  {
                      id: 'signals',
                      label: 'سیگنال‌ها',
                      icon: '📈',
                  },
                  {
                      id: 'volume-profile',
                      label: 'والیوم پروفایل',
                      icon: '📊',
                  },
                  {
                      id: 'news',
                      label: 'اخبار',
                      icon: '📰',
                  },
                  {
                      id: 'tradingview-news',
                      label: 'اخبار تریدینگ‌ویو',
                      icon: '📺',
                  },
                  {
                      id: 'important-news',
                      label: 'اخبار مهم',
                      icon: '🌍',
                  },
                  {
                      id: 'events',
                      label: 'رویدادها',
                      icon: '⚡',
                  },
              ]
            : [
                  {
                      id: 'charts',
                      label: 'Charts',
                      icon: '📊',
                  },
                  {
                      id: 'signals',
                      label: 'Signals',
                      icon: '📈',
                  },
                  {
                      id: 'volume-profile',
                      label: 'Volume Profile',
                      icon: '📊',
                  },
                  {
                      id: 'news',
                      label: 'News',
                      icon: '📰',
                  },
                  {
                      id: 'tradingview-news',
                      label: 'TradingView News',
                      icon: '📺',
                  },
                  {
                      id: 'important-news',
                      label: 'Important News',
                      icon: '🌍',
                  },
                  {
                      id: 'events',
                      label: 'Events',
                      icon: '⚡',
                  },
              ];

    return (
        <>
            <Toaster />
            <div className="detail-page">
            <div className="detail-header">
                <div className="detail-header-controls">
                    <LanguageSwitcher />
                    <ExchangeDropdown
                        selected={exchange}
                        onChange={setExchange}
                        isRTL={isRTL}
                    />
                </div>
                <div className="detail-header-title">
                    <Button variant="ghost" size="sm" onClick={handleBack}>
                        ← {isRTL ? 'بازگشت' : 'Back'}
                    </Button>
                    <h1 className="detail-title">
                        {symbol}
                    </h1>
                </div>
            </div>

            <div className="tabs-wrapper">
                <div className="tabs-list">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() =>
                                setActiveTab(
                                    tab.id,
                                )
                            }
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            <span className="tab-icon">
                                {tab.icon}
                            </span>
                            <span>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === 'charts' && (
                        <div className="tab-panel">
                            {isLoading && <Loading isRTL={isRTL} />}

                            {isError && (
                                <div className="error-state">
                                    <span>
                                        ⚠️
                                    </span>
                                    <span>
                                        {error?.message}
                                    </span>
                                </div>
                            )}

                            {!isLoading &&
                                !isError &&
                                data &&
                                data.length >
                                    0 && (
                                    <>
                                        <div className="section">
                                            <div className="glass-card">
                                                <MarketSummary
                                                    symbol={symbol}
                                                    interval="15m"
                                                    range="24h"
                                                    totalVolume={
                                                        totalVolume
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="chart-type-buttons">
                                            <button className="chart-type-btn active">
                                                📊{' '}
                                                {t.chart.bar}
                                            </button>
                                            <button className="chart-type-btn">
                                                📈{' '}
                                                {t.chart.line}
                                            </button>
                                            <button className="chart-type-btn">
                                                📉{' '}
                                                {t.chart.area}
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

                                        {openInterestData &&
                                            openInterestData.length >
                                                0 && (
                                                <div className="section">
                                                    <div className="glass-card chart-container chart-height-md">
                                                        <OpenInterestChart
                                                            data={
                                                                openInterestData
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                        {fundingData &&
                                            fundingData.length >
                                                0 && (
                                                <div className="section">
                                                    <div className="glass-card chart-container chart-height-md">
                                                        <FundingRateChart
                                                            data={
                                                                fundingData
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                    </>
                                )}
                        </div>
                    )}

                    {activeTab === 'signals' && (
                        <div className="tab-panel">
                            <MarketSignal
                                symbol={symbol}
                                exchange={exchange}
                            />
                        </div>
                    )}

                    {activeTab === 'volume-profile' && (
                        <div className="tab-panel">
                            <div className="glass-card">
                                <VolumeProfileTab symbol={symbol} isRTL={isRTL} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="tab-panel">
                            <div className="glass-card news-section">
                                <NewsList
                                    symbol={
                                        symbol
                                    }
                                    limit={
                                        10
                                    }
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'tradingview-news' && (
                        <div className="tab-panel">
                            <div className="glass-card news-section">
                                <TradingViewNews symbol={symbol} isRTL={isRTL} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'important-news' && (
                        <div className="tab-panel">
                            <div className="glass-card news-section">
                                <ImportantNews isRTL={isRTL} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="tab-panel">
                            {eventsLoading && <Loading isRTL={isRTL} compact />}

                            {eventsError && (
                                <div className="error-state">
                                    <span>⚠️</span>
                                    <span>
                                        Failed to load events
                                    </span>
                                </div>
                            )}

                            {!eventsLoading &&
                                !eventsError &&
                                eventsData?.items &&
                                eventsData.items.length >
                                    0 && (
                                    <div className="events-list">
                                        {eventsData.items.map(
                                            (event) => (
                                                <div
                                                    key={
                                                        event.id
                                                    }
                                                    className="event-item"
                                                >
                                                    <div className="event-header">
                                                        <span
                                                            className={`event-type event-type-${event.type}`}
                                                        >
                                                            {event.type}
                                                        </span>
                                                        <span className="event-time">
                                                            {new Date(
                                                                event.timestamp
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {event.description && (
                                                        <p className="event-description">
                                                            {event.description}
                                                        </p>
                                                    )}

                                                    <div className="event-meta">
                                                        {event.side && (
                                                            <span
                                                                className={`event-side event-side-${event.side}`}
                                                            >
                                                                {event.side === 'long'
                                                                    ? 'LONG'
                                                                    : 'SHORT'}
                                                            </span>
                                                        )}
                                                        {event.price && (
                                                            <span>
                                                                Price:{' '}
                                                                {event.price.toLocaleString()}
                                                            </span>
                                                        )}
                                                        {event.quantity && (
                                                            <span>
                                                                Qty:{' '}
                                                                {event.quantity.toLocaleString()}
                                                            </span>
                                                        )}
                                                        {event.value && (
                                                            <span>
                                                                Value:{' '}
                                                                {event.value.toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                            {!eventsLoading &&
                                !eventsError &&
                                (!eventsData?.items ||
                                    eventsData.items
                                        .length === 0) && (
                                    <p className="placeholder-text">
                                        No events for{' '}
                                        {symbol}
                                    </p>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

export default App;
