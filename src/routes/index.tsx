import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './Home';
import { DetailPage } from './DetailPage';
import { SignalsPage } from '../pages/SignalsPage';
import { WatchlistPage } from '../pages/WatchlistPage';
import { FourHourSignalsPage } from '../pages/FourHourSignalsPage';
import { LongShortSignalsPage } from '../pages/LongShortSignalsPage';
import { VolumeProfilePage } from '../pages/VolumeProfilePage';
import { NewListingsPage } from '../pages/NewListingsPage';
import { LogsPage } from '../pages/LogsPage';
import { PumpDetectorPage } from '../pages/PumpDetectorPage';
import { DumpDetectorPage } from '../pages/DumpDetectorPage';
import { PreMoveDetectorPage } from '../pages/PreMoveDetectorPage';
import { SafeSellPage } from '../pages/SafeSellPage';
import { TVLAnalysisPage } from '../pages/TVLAnalysisPage';
import { ProtocolAnalysisPage } from '../pages/ProtocolAnalysisPage';
import { PressureScanPage } from '../pages/PressureScanPage';
import { VolumeMarketCapPage } from '../pages/VolumeMarketCapPage';
import { IchimokuScannerPage } from '../pages/IchimokuScannerPage';
import { IchimokuLaggingSpanPage } from '../pages/IchimokuLaggingSpanPage';
import { IchimokuCombinedPage } from '../pages/IchimokuCombinedPage';
import { IchimokuChikouPullbackPage } from '../pages/IchimokuChikouPullbackPage';
import { CoinGlassSignalsPage } from '../pages/CoinGlassSignalsPage';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/detail" element={<DetailPage />} />
            <Route path="/signals" element={<SignalsPage onSelectSymbol={(s) => window.location.href = `/detail?symbol=${s}`} onBack={() => window.history.back()} />} />
            <Route path="/watchlist" element={<WatchlistPage onSelectSymbol={(s) => window.location.href = `/detail?symbol=${s}`} onBack={() => window.history.back()} />} />
            <Route path="/four-hour-signals" element={<FourHourSignalsPage onSelectSymbol={(s) => window.location.href = `/detail?symbol=${s}`} onBack={() => window.history.back()} />} />
            <Route path="/long-short-signals" element={<LongShortSignalsPage />} />
            <Route path="/volume-profile" element={<VolumeProfilePage />} />
            <Route path="/new-listings" element={<NewListingsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/pump-detector" element={<PumpDetectorPage />} />
            <Route path="/dump-detector" element={<DumpDetectorPage />} />
            <Route path="/pre-move-detector" element={<PreMoveDetectorPage />} />
            <Route path="/safe-sell" element={<SafeSellPage />} />
            <Route path="/tvl-analysis" element={<TVLAnalysisPage />} />
            <Route path="/protocol-analysis" element={<ProtocolAnalysisPage />} />
            <Route path="/coinglass-signals" element={<CoinGlassSignalsPage />} />
            <Route path="/pressure-scan" element={<PressureScanPage />} />
            <Route path="/volume-marketcap" element={<VolumeMarketCapPage />} />
            <Route path="/ichimoku-scanner" element={<IchimokuScannerPage />} />
            <Route path="/ichimoku-lagging-span" element={<IchimokuLaggingSpanPage />} />
            <Route path="/ichimoku-combined" element={<IchimokuCombinedPage />} />
            <Route path="/ichimoku-chikou-pullback" element={<IchimokuChikouPullbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
