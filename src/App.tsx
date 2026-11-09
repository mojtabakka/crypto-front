import { Toaster } from 'react-hot-toast';
import { useScanNotification } from './hooks/useScanNotification';
<<<<<<< HEAD
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
import { TVLAnalysisPage } from './pages/TVLAnalysisPage';
import { ProtocolAnalysisPage } from './pages/ProtocolAnalysisPage';
import { PressureScanPage } from './pages/PressureScanPage';
import { VolumeMarketCapPage } from './pages/VolumeMarketCapPage';
import { IchimokuScannerPage } from './pages/IchimokuScannerPage';
import { IchimokuLaggingSpanPage } from './pages/IchimokuLaggingSpanPage';
import { IchimokuCombinedPage } from './pages/IchimokuCombinedPage';
import { CoinGlassSignalsPage } from './pages/CoinGlassSignalsPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { UserManagementPage } from './pages/UserManagementPage';
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
import { useAuth } from './contexts/AuthContext';
import { RoleGuard } from './components/AuthGuard';
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
import './pages/TVLAnalysisPage.css';
import './components/ExchangeDropdown.css';
import './pages/NewListingsPage.css';
import './pages/ProtocolAnalysisPage.css';
import './pages/CoinGlassSignalsPage.css';
import './pages/IchimokuScannerPage.css';
import './pages/IchimokuLaggingSpanPage.css';
import './pages/IchimokuCombinedPage.css';
import './pages/PressureScanPage.css';
import './pages/VolumeMarketCapPage.css';

type Page = 'home' | 'detail' | 'signals' | 'watchlist' | 'four-hour-signals' | 'long-short-signals' | 'volume-profile' | 'new-listings' | 'logs' | 'pump-detector' | 'dump-detector' | 'pre-move-detector' | 'safe-sell' | 'tvl-analysis' | 'protocol-analysis' | 'coinglass-signals' | 'volume-marketcap' | 'pressure-scan' | 'ichimoku-scanner' | 'ichimoku-lagging-span' | 'ichimoku-combined' | 'login' | 'signup' | 'user-management';
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
=======
import { useExchangeBlockNotifier } from './hooks/useExchangeBlockNotifier';
import { ExchangeBlockedOverlay } from './components/app/ExchangeBlockedOverlay';
import { AppRoutes } from './routes';
import './App.css';
>>>>>>> 90101238115694efe82a413bdbdb3c1860bdeff8

function PageLanguageToggle({ page }: { page: Page }) {
    // Pages that already render the switcher inside their own header.
    if (
        page === 'home' ||
        page === 'detail' ||
        page === 'login' ||
        page === 'signup' ||
        page === 'user-management'
    ) return null;
    return (
        <div className="global-lang-toggle">
            <LanguageSwitcher />
        </div>
    );
}

function App() {
<<<<<<< HEAD
    const { t, isRTL } = useI18n();
    const { user, token, isLoading: authIsLoading, checkSession, logout } = useAuth();
    useScanNotification();

    // Check session on mount
    useEffect(() => {
        if (token) {
            checkSession().catch(() => logout());
        }
    }, [token, checkSession, logout]);

    const publicPaths = ['/login', '/signup'];
    const isPublicPath = publicPaths.includes(window.location.pathname);

    // Redirect unauthenticated visitors to /login, and signed-in users away
    // from the auth pages. Navigation must happen in an effect, not in render.
    useEffect(() => {
        if (authIsLoading) return;

        if (user && token && isPublicPath) {
            window.location.href = '/';
        } else if (!user && !token && !isPublicPath) {
            window.location.href = '/login';
        }
    }, [authIsLoading, user, token, isPublicPath]);

    const getPageFromUrl = (): Page => {
        if (window.location.pathname === '/login') return 'login';
        if (window.location.pathname === '/signup') return 'signup';
        if (window.location.pathname === '/user-management') return 'user-management';
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
        if (window.location.pathname === '/tvl-analysis') return 'tvl-analysis';
        if (window.location.pathname === '/protocol-analysis') return 'protocol-analysis';
        if (window.location.pathname === '/coinglass-signals') return 'coinglass-signals';
        if (window.location.pathname === '/pressure-scan') return 'pressure-scan';
        if (window.location.pathname === '/volume-marketcap') return 'volume-marketcap';
        if (window.location.pathname === '/ichimoku-scanner') return 'ichimoku-scanner';
        if (window.location.pathname === '/ichimoku-lagging-span') return 'ichimoku-lagging-span';
        if (window.location.pathname === '/ichimoku-combined') return 'ichimoku-combined';
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
            } else if (window.location.pathname === '/tvl-analysis') {
                setPage('tvl-analysis');
            } else if (window.location.pathname === '/protocol-analysis') {
                setPage('protocol-analysis');
            } else if (window.location.pathname === '/coinglass-signals') {
                setPage('coinglass-signals');
            } else if (window.location.pathname === '/pressure-scan') {
                setPage('pressure-scan');
            } else if (window.location.pathname === '/volume-marketcap') {
                setPage('volume-marketcap');
            } else if (window.location.pathname === '/ichimoku-scanner') {
                setPage('ichimoku-scanner');
            } else if (window.location.pathname === '/ichimoku-lagging-span') {
                setPage('ichimoku-lagging-span');
            } else if (window.location.pathname === '/ichimoku-combined') {
                setPage('ichimoku-combined');
            } else if (window.location.pathname === '/login') {
                setPage('login');
            } else if (window.location.pathname === '/signup') {
                setPage('signup');
            } else if (window.location.pathname === '/user-management') {
                setPage('user-management');
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

    const handleNavigateToTVLAnalysis = useCallback(() => {
        window.history.pushState({}, '', '/tvl-analysis');
        setPage('tvl-analysis');
    }, []);

    const handleNavigateToProtocolAnalysis = useCallback(() => {
        window.history.pushState({}, '', '/protocol-analysis');
        setPage('protocol-analysis');
    }, []);

    const handleNavigateToCoinGlassSignals = useCallback(() => {
        window.history.pushState({}, '', '/coinglass-signals');
        setPage('coinglass-signals');
    }, []);

    const handleNavigateToPressureScan = useCallback(() => {
        window.history.pushState({}, '', '/pressure-scan');
        setPage('pressure-scan');
    }, []);

    const handleNavigateToVolumeMarketCap = useCallback(() => {
        window.history.pushState({}, '', '/volume-marketcap');
        setPage('volume-marketcap');
    }, []);

    const handleNavigateToIchimokuScanner = useCallback(() => {
        window.history.pushState({}, '', '/ichimoku-scanner');
        setPage('ichimoku-scanner');
    }, []);

    const handleNavigateToIchimokuLaggingSpan = useCallback(() => {
        window.history.pushState({}, '', '/ichimoku-lagging-span');
        setPage('ichimoku-lagging-span');
    }, []);

    const handleNavigateToIchimokuCombined = useCallback(() => {
        window.history.pushState({}, '', '/ichimoku-combined');
        setPage('ichimoku-combined');
    }, []);

=======
    useScanNotification();
>>>>>>> 90101238115694efe82a413bdbdb3c1860bdeff8
    const { blockCount } = useExchangeBlockNotifier();

    // Auth gates live below every hook so hook order stays identical on each
    // render (returning early above them crashed React when loading finished).
    if (authIsLoading) return null;
    if (!user && !token && !isPublicPath) return null;

    if (blockCount > 0) {
        return (
            <>
                <Toaster toastOptions={{ style: { zIndex: 10000 } }} />
                <ExchangeBlockedOverlay blockCount={blockCount} />
            </>
        );
    }

<<<<<<< HEAD
    if (page === 'home') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
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
                            {user ? (
                                <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid #334155' }}>
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{user.username}</span>
                                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: user.role === 'admin' ? '#fca5a5' : '#93c5fd' }}>
                                        {user.role}
                                    </span>
                                    {/* Admin-only entry point, sits beside Sign Out. */}
                                    {user.role === 'admin' && (
                                        <Button
                                            variant="purple"
                                            size="sm"
                                            onClick={() => { window.location.href = '/user-management'; }}
                                        >
                                            {isRTL ? '👥 مدیریت کاربران' : '👥 Manage Users'}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/'; }}>
                                        {isRTL ? 'خروج' : 'Sign Out'}
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => { window.location.href = '/login'; }}>
                                    {isRTL ? 'ورود' : 'Sign In'}
                                </Button>
                            )}
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
                        <Button
                            variant="success"
                            size="md"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v20M2 12h20"/>
                                    <path d="M18 6L12 12L6 18"/>
                                </svg>
                            }
                            onClick={handleNavigateToTVLAnalysis}
                        >
                            {isRTL ? 'تحلیل TVL' : 'TVL Analysis'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToProtocolAnalysis}
                        >
                            {isRTL ? 'تحلیل پروتکل' : 'Protocol Analysis'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToCoinGlassSignals}
                        >
                            {isRTL ? 'کوين گلاس' : 'CoinGlass'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToPressureScan}
                        >
                            {isRTL ? 'فشار حجم' : 'Volume Pressure'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToVolumeMarketCap}
                        >
                            {isRTL ? 'حجم / مارکت‌کپ' : 'Volume / MCap'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToIchimokuScanner}
                        >
                            {isRTL ? 'ابر 이chimoku' : 'Ichimoku Cloud'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToIchimokuLaggingSpan}
                        >
                            {isRTL ? 'خروج لینگ-span' : 'Lagging Span Exit'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNavigateToIchimokuCombined}
                        >
                            {isRTL ? 'ترکیبی ابر+لینگ-span' : 'Ichimoku Combined'}
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
                <PageLanguageToggle page={page} />
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
                <PageLanguageToggle page={page} />
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
                <PageLanguageToggle page={page} />
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
                <PageLanguageToggle page={page} />
                <LongShortSignalsPage />
            </>
        );
    }

    if (page === 'volume-profile') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <VolumeProfilePage />
            </>
        );
    }

    if (page === 'new-listings') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <NewListingsPage />
            </>
        );
    }

    if (page === 'login') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <LoginPage />
            </>
        );
    }

    if (page === 'signup') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <SignUpPage />
            </>
        );
    }

    if (page === 'user-management') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <RoleGuard allowedRoles={['admin']}>
                    <UserManagementPage />
                </RoleGuard>
            </>
        );
    }

    if (page === 'logs') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <LogsPage />
            </>
        );
    }

    if (page === 'pump-detector') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <PumpDetectorPage />
            </>
        );
    }

    if (page === 'dump-detector') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <DumpDetectorPage />
            </>
        );
    }

    if (page === 'pre-move-detector') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <PreMoveDetectorPage />
            </>
        );
    }

    if (page === 'safe-sell') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <SafeSellPage />
            </>
        );
    }

    if (page === 'tvl-analysis') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <TVLAnalysisPage />
            </>
        );
    }

    if (page === 'protocol-analysis') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <ProtocolAnalysisPage />
            </>
        );
    }

    if (page === 'coinglass-signals') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <CoinGlassSignalsPage />
            </>
        );
    }

    if (page === 'pressure-scan') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <PressureScanPage />
            </>
        );
    }

    if (page === 'volume-marketcap') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <VolumeMarketCapPage />
            </>
        );
    }

    if (page === 'ichimoku-scanner') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <IchimokuScannerPage />
            </>
        );
    }

    if (page === 'ichimoku-lagging-span') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <IchimokuLaggingSpanPage />
            </>
        );
    }

    if (page === 'ichimoku-combined') {
        return (
            <>
                <Toaster />
                <PageLanguageToggle page={page} />
                <IchimokuCombinedPage />
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
                <PageLanguageToggle page={page} />
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
=======
    return <AppRoutes />;
>>>>>>> 90101238115694efe82a413bdbdb3c1860bdeff8
}

export default App;
