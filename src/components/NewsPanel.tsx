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

interface NewsPanelProps {
  symbol: string;
  isRTL: boolean;
  progress?: number;
  total?: number;
  onClose: () => void;
}

export function NewsPanel({ symbol, isRTL, progress, total, onClose }: NewsPanelProps) {
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['tradingview-news', symbol, isRTL ? 'fa' : 'en'],
    queryFn: async () => {
      const lang = isRTL ? 'fa' : 'en';
      const res = await fetch(`http://localhost:3000/news/tradingview?symbol=${symbol}&limit=10&lang=${lang}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    },
    staleTime: 120000,
  });

  return (
    <div className="news-panel-overlay" onClick={onClose}>
      <div className="news-panel" onClick={(e) => e.stopPropagation()}>
        <div className="news-panel-header">
          <h3>📰 {isRTL ? 'اخبار' : 'News'} {symbol}</h3>
          <button type="button" className="news-panel-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="news-panel-content">
          {isLoading && <Loading isRTL={isRTL} compact progress={progress} total={total} />}
          {newsData?.data?.length > 0 && (
            <div className="news-list">
              {newsData.data.map((item: TradingViewNewsItem) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-item"
                >
                  <div className="news-item-content">
                    <h4 className="news-item-title">{item.title}</h4>
                    {item.description && (
                      <p className="news-item-desc">{item.description}</p>
                    )}
                    <div className="news-item-meta">
                      <span className="news-item-source">{item.source}</span>
                      <span className="news-item-date">
                        {new Date(item.publishedOn).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {newsData?.data?.length === 0 && !isLoading && (
            <p className="news-empty">{isRTL ? 'خبری یافت نشد' : 'No news found'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
