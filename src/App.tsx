import { Toaster } from 'react-hot-toast';
import { useScanNotification } from './hooks/useScanNotification';
import { useExchangeBlockNotifier } from './hooks/useExchangeBlockNotifier';
import { ExchangeBlockedOverlay } from './components/app/ExchangeBlockedOverlay';
import { AppRoutes } from './routes';
import './App.css';

function App() {
    useScanNotification();
    const { blockCount } = useExchangeBlockNotifier();

    if (blockCount > 0) {
        return (
            <>
                <Toaster toastOptions={{ style: { zIndex: 10000 } }} />
                <ExchangeBlockedOverlay blockCount={blockCount} />
            </>
        );
    }

    return <AppRoutes />;
}

export default App;
