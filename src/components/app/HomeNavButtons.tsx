import { Button } from '../Button';
import { useI18n } from '../../i18n';

interface HomeNavButtonsProps {
    onNavigateToPullbacks: () => void;
    onNavigateToWatchlist: () => void;
    onNavigateToVolumeProfile: () => void;
    onNavigateToPumpDetector: () => void;
    onNavigateToDumpDetector: () => void;
    onNavigateToPreMoveDetector: () => void;
    onNavigateToSafeSell: () => void;
    onNavigateToTVLAnalysis: () => void;
    onNavigateToProtocolAnalysis: () => void;
    onNavigateToCoinGlassSignals: () => void;
    onNavigateToPressureScan: () => void;
    onNavigateToVolumeMarketCap: () => void;
    onNavigateToIchimokuScanner: () => void;
    onNavigateToIchimokuLaggingSpan: () => void;
    onNavigateToIchimokuCombined: () => void;
    onNavigateToIchimokuChikouPullback: () => void;
}

export function HomeNavButtons(props: HomeNavButtonsProps) {
    const { isRTL } = useI18n();

    return (
        <div className="home-buttons">
            <Button
                variant="outline"
                size="md"
                className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                }
                onClick={props.onNavigateToPullbacks}
            >
                {isRTL ? 'سیگنال‌های بازار' : 'Market Signals'}
            </Button>
            <Button
                variant="outline"
                size="md"
                className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20"/>
                    </svg>
                }
                onClick={props.onNavigateToSafeSell}
            >
                {isRTL ? 'فروش ایمن' : 'Safe Sell'}
            </Button>
            <Button
                variant="outline"
                size="md"
                className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:border-violet-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                    </svg>
                }
                onClick={props.onNavigateToVolumeProfile}
            >
                {isRTL ? 'والیوم پروفایل' : 'Volume Profile'}
            </Button>
            <Button
                variant="outline"
                size="md"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/>
                        <circle cx="12" cy="6" r="3"/>
                    </svg>
                }
                onClick={props.onNavigateToPumpDetector}
            >
                {isRTL ? 'ردیاب پامپ' : 'Pump Detector'}
            </Button>
            <Button
                variant="outline"
                size="md"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 17.08V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.92"/>
                        <path d="M12 17V3"/>
                        <path d="M5 10l7 7 7-7"/>
                    </svg>
                }
                onClick={props.onNavigateToDumpDetector}
            >
                {isRTL ? 'ردیاب دامپ' : 'Dump Detector'}
            </Button>
            <Button
                variant="outline"
                size="md"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                }
                onClick={props.onNavigateToPreMoveDetector}
            >
                {isRTL ? 'پیش‌بینی حرکت' : 'Pre-Move'}
            </Button>
            <Button
                variant="outline"
                size="md"
                className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20"/>
                        <path d="M18 6L12 12L6 18"/>
                    </svg>
                }
                onClick={props.onNavigateToTVLAnalysis}
            >
                {isRTL ? 'تحلیل TVL' : 'TVL Analysis'}
            </Button>
            <Button variant="outline" size="sm" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400" onClick={props.onNavigateToProtocolAnalysis}>
                {isRTL ? 'تحلیل پروتکل' : 'Protocol Analysis'}
            </Button>
            <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400" onClick={props.onNavigateToCoinGlassSignals}>
                {isRTL ? 'کوين گلاس' : 'CoinGlass'}
            </Button>
            <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400" onClick={props.onNavigateToPressureScan}>
                {isRTL ? 'فشار حجم' : 'Volume Pressure'}
            </Button>
            <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400" onClick={props.onNavigateToVolumeMarketCap}>
                {isRTL ? 'حجم / مارکت‌کپ' : 'Volume / MCap'}
            </Button>
            <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400" onClick={props.onNavigateToIchimokuScanner}>
                {isRTL ? 'ابر Ichimoku' : 'Ichimoku Cloud'}
            </Button>
            <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400" onClick={props.onNavigateToIchimokuLaggingSpan}>
                {isRTL ? 'خروج لینگ-span' : 'Lagging Span Exit'}
            </Button>
            <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400" onClick={props.onNavigateToIchimokuCombined}>
                {isRTL ? 'ترکیبی ابر+لینگ-span' : 'Ichimoku Combined'}
            </Button>
            <Button variant="outline" size="sm" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400" onClick={props.onNavigateToIchimokuChikouPullback}>
                {isRTL ? 'چیکو پلکباک' : 'Chikou Pullback'}
            </Button>
            <Button
                variant="outline"
                size="md"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                }
                onClick={props.onNavigateToWatchlist}
            >
                {isRTL ? 'واچ لیست' : 'Watchlist'}
            </Button>
            <Button
                variant="outline"
                size="md"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20"/>
                    </svg>
                }
                onClick={props.onNavigateToNewListings}
            >
                {isRTL ? 'ارزهای جدید' : 'New Listings'}
            </Button>
            <Button
                variant="outline"
                size="md"
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                }
                onClick={props.onNavigateToLogs}
            >
                {isRTL ? 'لاگ‌ها' : 'Logs'}
            </Button>
        </div>
    );
}
