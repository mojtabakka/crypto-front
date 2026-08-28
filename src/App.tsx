import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMarketData } from './hooks/useMarketData';
import { useOpenInterest } from './hooks/useOpenInterest';
import { useFundingRate } from './hooks/useFundingRate';
import { useEvents } from './hooks/useEvents';
import { HomePage } from './pages/HomePage';
import { SignalsPage } from './pages/SignalsPage';
import { WatchlistPage } from './pages/WatchlistPage';
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
import './App.css';
import './components/MarketControls.css';
import './components/NewsList.css';
import './pages/SignalsPage.css';
import './pages/WatchlistPage.css';

type Page = 'home' | 'detail' | 'signals' | 'watchlist';
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

    const getPageFromUrl = (): Page => {
        if (window.location.pathname === '/signals') return 'signals';
        if (window.location.pathname === '/watchlist') return 'watchlist';
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
        <div className="detail-page">
            <div className="detail-header">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                    ← {isRTL ? 'بازگشت' : 'Back'}
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
    );
}

export default App;
