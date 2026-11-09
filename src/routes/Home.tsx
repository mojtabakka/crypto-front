import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HomePage } from '../pages/HomePage';
import { HomeHeader } from '../components/app/HomeHeader';
import { HomeNavButtons } from '../components/app/HomeNavButtons';

export function Home() {
    const navigate = useNavigate();

    const handleSearch = (newSymbol: string) => {
        navigate(`/detail?symbol=${newSymbol}`);
    };

    return (
        <>
            <Toaster />
            <div className="app-container">
                <HomeHeader />
                <HomeNavButtons
                    onNavigateToPullbacks={() => navigate('/signals')}
                    onNavigateToWatchlist={() => navigate('/watchlist')}
                    onNavigateToFourHourSignals={() => navigate('/four-hour-signals')}
                    onNavigateToLongShortSignals={() => navigate('/long-short-signals')}
                    onNavigateToVolumeProfile={() => navigate('/volume-profile')}
                    onNavigateToNewListings={() => navigate('/new-listings')}
                    onNavigateToLogs={() => navigate('/logs')}
                    onNavigateToPumpDetector={() => navigate('/pump-detector')}
                    onNavigateToDumpDetector={() => navigate('/dump-detector')}
                    onNavigateToPreMoveDetector={() => navigate('/pre-move-detector')}
                    onNavigateToSafeSell={() => navigate('/safe-sell')}
                    onNavigateToTVLAnalysis={() => navigate('/tvl-analysis')}
                    onNavigateToProtocolAnalysis={() => navigate('/protocol-analysis')}
                    onNavigateToCoinGlassSignals={() => navigate('/coinglass-signals')}
                    onNavigateToPressureScan={() => navigate('/pressure-scan')}
                    onNavigateToVolumeMarketCap={() => navigate('/volume-marketcap')}
                    onNavigateToIchimokuScanner={() => navigate('/ichimoku-scanner')}
                    onNavigateToIchimokuLaggingSpan={() => navigate('/ichimoku-lagging-span')}
                    onNavigateToIchimokuCombined={() => navigate('/ichimoku-combined')}
                    onNavigateToIchimokuChikouPullback={() => navigate('/ichimoku-chikou-pullback')}
                />
                <HomePage onSearch={handleSearch} />
            </div>
        </>
    );
}
