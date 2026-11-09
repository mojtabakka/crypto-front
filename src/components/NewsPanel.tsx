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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-20" onClick={onClose}>
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            📰 {isRTL ? 'اخبار' : 'News'} {symbol}
          </h3>
          <button type="button" className="text-slate-400 hover:text-slate-200 transition-colors" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
          {isLoading && <Loading isRTL={isRTL} compact progress={progress} total={total} />}
          {newsData?.data?.length > 0 && (
            <div className="space-y-3">
              {newsData.data.map((item: TradingViewNewsItem) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all"
                >
                  <h4 className="font-semibold text-slate-100 mb-2 line-clamp-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.source}</span>
                    <span>
                      {new Date(item.publishedOn).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
          {newsData?.data?.length === 0 && !isLoading && (
            <p className="text-center text-slate-400 py-8">{isRTL ? 'خبری یافت نشد' : 'No news found'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
