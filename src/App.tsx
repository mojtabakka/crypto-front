import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketData } from './hooks/useMarketData';
import { useOpenInterest } from './hooks/useOpenInterest';
import { useFundingRate } from './hooks/useFundingRate';
import { useEvents } from './hooks/useEvents';
import { HomePage } from './pages/HomePage';
import { SignalsPage } from './pages/SignalsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { LoginPage } from './pages/LoginPage';
import { AlertsPage } from './pages/AlertsPage';
import { SentimentPage } from './pages/SentimentPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { BacktestPage } from './pages/BacktestPage';
import { ExecutorPage } from './pages/ExecutorPage';
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
import { useI18n } from './i18n';
import { useAuth } from './contexts/AuthContext';
import './App.css';
import './components/MarketControls.css';
import './components/NewsList.css';
import './pages/SignalsPage.css';
import './pages/WatchlistPage.css';
import './pages/AuthPages.css';
import './pages/AlertsPage.css';
import './pages/SentimentPage.css';
import './pages/AdminUsersPage.css';
import './pages/CorrelationPage.css';
import './pages/BacktestPage.css';
import './pages/ExecutorPage.css';

type Page = 'home' | 'detail' | 'signals' | 'watchlist' | 'alerts' | 'sentiment' | 'admin-users' | 'correlation' | 'backtest' | 'executor';
type TabId = 'charts' | 'signals' | 'news' | 'events' | 'tradingview-news' | 'important-news';

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
    const { t } = useI18n();
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
                <span>{t.error.generic}</span>
            </div>
        );
    }

    const items: TradingViewNewsItem[] = newsData?.data ?? [];

    if (items.length === 0) {
        return (
            <p className="placeholder-text">
                {t.news.empty}
            </p>
        );
    }

    return (
        <div className="tradingview-news-list">
            <h3 className="news-section-title">
                {t.tabs.tradingviewNews} - {symbol}
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
    const { t } = useI18n();
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
                <span>{t.error.generic}</span>
            </div>
        );
    }

    const items: TradingViewNewsItem[] = newsData?.data ?? [];

    if (items.length === 0) {
        return (
            <p className="placeholder-text">
                {t.news.empty}
            </p>
        );
    }

    return (
        <div className="tradingview-news-list">
            <h3 className="news-section-title">
                {t.tabs.importantNews}
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
    const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();

    const getPageFromUrl = (): Page => {
        if (window.location.pathname === '/signals') return 'signals';
        if (window.location.pathname === '/watchlist') return 'watchlist';
        if (window.location.pathname === '/alerts') return 'alerts';
        if (window.location.pathname === '/sentiment') return 'sentiment';
        if (window.location.pathname === '/admin-users') return 'admin-users';
        if (window.location.pathname === '/correlation') return 'correlation';
        if (window.location.pathname === '/backtest') return 'backtest';
        if (window.location.pathname === '/executor') return 'executor';
        const params = new URLSearchParams(window.location.search);
        return params.get('symbol') ? 'detail' : 'home';
    };

    const [page, setPage] = useState<Page>(getPageFromUrl);
    const [symbol, setSymbol] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('symbol') || 'BTCUSDT';
    });
    const [activeTab, setActiveTab] = useState<TabId>('charts');

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const s = params.get('symbol');

            if (window.location.pathname === '/signals') {
                setPage('signals');
            } else if (window.location.pathname === '/watchlist') {
                setPage('watchlist');
            } else if (window.location.pathname === '/alerts') {
                setPage('alerts');
            } else if (window.location.pathname === '/sentiment') {
                setPage('sentiment');
            } else if (window.location.pathname === '/admin-users') {
                setPage('admin-users');
            } else if (window.location.pathname === '/correlation') {
                setPage('correlation');
            } else if (window.location.pathname === '/backtest') {
                setPage('backtest');
            } else if (window.location.pathname === '/executor') {
                setPage('executor');
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
    });

    const {
        data: openInterestData,
    } = useOpenInterest({
        symbol,
        range: '24h',
    });

    const {
        data: fundingData,
    } = useFundingRate({
        symbol,
        range: '24h',
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

    const handleNavigateToAlerts = useCallback(() => {
        window.history.pushState({}, '', '/alerts');
        setPage('alerts');
    }, []);

    const handleBackFromAlerts = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToSentiment = useCallback(() => {
        window.history.pushState({}, '', '/sentiment');
        setPage('sentiment');
    }, []);

    const handleBackFromSentiment = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleBackFromAdminUsers = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToCorrelation = useCallback(() => {
        window.history.pushState({}, '', '/correlation');
        setPage('correlation');
    }, []);

    const handleBackFromCorrelation = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToBacktest = useCallback(() => {
        window.history.pushState({}, '', '/backtest');
        setPage('backtest');
    }, []);

    const handleBackFromBacktest = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToExecutor = useCallback(() => {
        window.history.pushState({}, '', '/executor');
        setPage('executor');
    }, []);

    const handleBackFromExecutor = useCallback(() => {
        window.history.pushState({}, '', '/');
        setPage('home');
    }, []);

    const handleNavigateToAdminUsers = useCallback(() => {
        window.history.pushState({}, '', '/admin-users');
        setPage('admin-users');
    }, []);

    if (authLoading) {
        return (
            <div className="auth-page">
                <div className="auth-container" style={{ textAlign: 'center' }}>
                    <p className="auth-subtitle">{t.auth.loading}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    if (page === 'home') {
        return (
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
                        <LanguageSwitcher />
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
                            {t.nav.marketSignals}
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
                            {t.nav.watchlist}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            }
                            onClick={handleNavigateToAlerts}
                        >
                            {t.nav.alerts}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                                </svg>
                            }
                            onClick={handleNavigateToSentiment}
                        >
                            {t.nav.sentiment}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"/>
                                    <rect x="14" y="3" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/>
                                </svg>
                            }
                            onClick={handleNavigateToCorrelation}
                        >
                            {t.nav.correlation}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                            }
                            onClick={handleNavigateToBacktest}
                        >
                            {t.nav.backtest}
                        </Button>
                        <Button
                            variant="purple"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                            }
                            onClick={handleNavigateToExecutor}
                        >
                            {t.nav.executor}
                        </Button>
                        {user?.role === 'admin' && (
                            <Button
                                variant="purple"
                                size="md"
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                }
                                onClick={handleNavigateToAdminUsers}
                            >
                                {t.nav.userManagement}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={logout}
                        >
                            {t.nav.logoutWithUser.replace(
                                '{username}',
                                user?.username ?? '',
                            )}
                        </Button>
                    </div>
                </div>
                <HomePage onSearch={handleSearch} />
            </div>
        );
    }

    if (page === 'signals') {
        return (
            <SignalsPage
                onSelectSymbol={handleSearch}
                onBack={handleBackFromPullbacks}
            />
        );
    }

    if (page === 'watchlist') {
        return (
            <WatchlistPage
                onSelectSymbol={handleSearch}
                onBack={handleBackFromWatchlist}
            />
        );
    }

    if (page === 'alerts') {
        return <AlertsPage onBack={handleBackFromAlerts} />;
    }

    if (page === 'sentiment') {
        return <SentimentPage onBack={handleBackFromSentiment} />;
    }

    if (page === 'admin-users') {
        return <AdminUsersPage onBack={handleBackFromAdminUsers} />;
    }

    if (page === 'correlation') {
        return <CorrelationPage onBack={handleBackFromCorrelation} />;
    }

    if (page === 'backtest') {
        return <BacktestPage onBack={handleBackFromBacktest} />;
    }

    if (page === 'executor') {
        return <ExecutorPage onBack={handleBackFromExecutor} />;
    }

    const tabs: { id: TabId; label: string; icon: string }[] = [
        { id: 'charts', label: t.tabs.charts, icon: '#' },
        { id: 'signals', label: t.tabs.signals, icon: '^' },
        { id: 'news', label: t.tabs.news, icon: '@' },
        { id: 'tradingview-news', label: t.tabs.tradingviewNews, icon: 'TV' },
        { id: 'important-news', label: t.tabs.importantNews, icon: '!' },
        { id: 'events', label: t.tabs.events, icon: '*' },
    ];

    return (
        <div className="detail-page">
            <div className="detail-header">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                    ← {t.controls.back}
                </Button>
                <h1 className="detail-title">
                    {symbol}
                </h1>
                <LanguageSwitcher />
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
                            />
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
                                        {t.error.failedToLoadEvents}
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
                                                                {t.events.price}:{' '}
                                                                {event.price.toLocaleString()}
                                                            </span>
                                                        )}
                                                        {event.quantity && (
                                                            <span>
                                                                {t.events.quantity}:{' '}
                                                                {event.quantity.toLocaleString()}
                                                            </span>
                                                        )}
                                                        {event.value && (
                                                            <span>
                                                                {t.events.value}:{' '}
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
                                        {t.error.noEventsFor}{' '}
                                        {symbol}
                                    </p>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
