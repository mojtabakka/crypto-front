import type { TabId } from '../../types/app';
import { useI18n } from '../../i18n';

interface DetailTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function DetailTabs({ activeTab, onTabChange }: DetailTabsProps) {
    const { isRTL } = useI18n();

    const tabs: { id: TabId; label: string; icon: string }[] =
        isRTL
            ? [
                  { id: 'charts', label: 'نمودارها', icon: '📊' },
                  { id: 'signals', label: 'سیگنال‌ها', icon: '📈' },
                  { id: 'volume-profile', label: 'والیوم پروفایل', icon: '📊' },
                  { id: 'news', label: 'اخبار', icon: '📰' },
                  { id: 'tradingview-news', label: 'اخبار تریدینگ‌ویو', icon: '📺' },
                  { id: 'important-news', label: 'اخبار مهم', icon: '🌍' },
                  { id: 'events', label: 'رویدادها', icon: '⚡' },
              ]
            : [
                  { id: 'charts', label: 'Charts', icon: '📊' },
                  { id: 'signals', label: 'Signals', icon: '📈' },
                  { id: 'volume-profile', label: 'Volume Profile', icon: '📊' },
                  { id: 'news', label: 'News', icon: '📰' },
                  { id: 'tradingview-news', label: 'TradingView News', icon: '📺' },
                  { id: 'important-news', label: 'Important News', icon: '🌍' },
                  { id: 'events', label: 'Events', icon: '⚡' },
              ];

    return (
        <div className="tabs-wrapper">
            <div className="tabs-list">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
