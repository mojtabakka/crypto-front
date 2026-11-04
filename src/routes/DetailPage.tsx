import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useMarketData } from '../hooks/useMarketData';
import { useOpenInterest } from '../hooks/useOpenInterest';
import { useFundingRate } from '../hooks/useFundingRate';
import { useEvents } from '../hooks/useEvents';
import { useI18n } from '../i18n';
import { useExchange } from '../contexts/ExchangeContext';
import { MarketSignal } from '../components/MarketSignal';
import { NewsList } from '../components/NewsList';
import { VolumeProfileTab } from '../components/VolumeProfileTab';
import { TradingViewNews } from '../components/TradingViewNews';
import { ImportantNews } from '../components/ImportantNews';
import type { TabId } from '../types/app';
import { DetailPageHeader } from '../components/app/DetailPageHeader';
import { DetailTabs } from '../components/app/DetailTabs';
import { ChartsTab } from '../components/app/ChartsTab';
import { EventsTab } from '../components/app/EventsTab';

export function DetailPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isRTL } = useI18n();
    const { exchange } = useExchange();
    const [activeTab, setActiveTab] = useState<TabId>('charts');

    const symbol = searchParams.get('symbol') || 'BTCUSDT';

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

    const { data: openInterestData } = useOpenInterest({
        symbol,
        range: '24h',
        exchange,
    });

    const { data: fundingData } = useFundingRate({
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
        return data?.reduce((total, item) => total + item.volume, 0) ?? 0;
    }, [data]);

    return (
        <>
            <Toaster />
            <div className="detail-page">
                <DetailPageHeader symbol={symbol} onBack={() => navigate('/')} />
                <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="tab-content">
                    {activeTab === 'charts' && (
                        <ChartsTab
                            symbol={symbol}
                            data={data}
                            isLoading={isLoading}
                            isError={isError}
                            error={error}
                            totalVolume={totalVolume}
                            openInterestData={openInterestData}
                            fundingData={fundingData}
                        />
                    )}

                    {activeTab === 'signals' && (
                        <div className="tab-panel">
                            <MarketSignal symbol={symbol} exchange={exchange} />
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
                                <NewsList symbol={symbol} limit={10} />
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
                        <EventsTab
                            eventsData={eventsData}
                            eventsLoading={eventsLoading}
                            eventsError={eventsError}
                            symbol={symbol}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
