import { useQuery } from '@tanstack/react-query';
import { Loading } from './Loading';

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

export function ImportantNews({ isRTL }: { isRTL: boolean }) {
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
