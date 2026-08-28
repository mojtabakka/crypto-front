import { useState, useEffect, useRef } from 'react';
import { useNews } from '../hooks/useNews';
import { useI18n } from '../i18n';
import type { NewsItem } from '../api/market/market';
import { translateNewsItem } from '../utils/translator';
import { NewsModal } from './NewsModal';
import './NewsList.css';

interface NewsListProps {
    symbol?: string;
    limit?: number;
}

function formatNewsDate(
    isoString: string,
): string {
    const date = new Date(isoString);

    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function NewsItemCard({
    item,
    onClick,
}: {
    item: NewsItem;
    onClick: () => void;
}) {
    const sentimentLabel =
        item.sentiment === 'positive'
            ? 'Positive'
            : item.sentiment === 'negative'
                ? 'Negative'
                : 'Neutral';

    return (
        <div
            className="news-item"
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <div className="news-item-header">
                <div className="news-item-title">
                    {item.url ? (
                        <span>
                            {item.title}
                        </span>
                    ) : (
                        item.title
                    )}
                </div>
            </div>

            {item.summary && (
                <p className="news-item-summary">
                    {item.summary}
                </p>
            )}

            <div className="news-item-meta">
                <span className="news-item-source">
                    {item.source || 'Unknown'}
                </span>
                <span className="news-item-date">
                    {formatNewsDate(item.publishedAt)}
                </span>
            </div>

            <div className="news-item-footer">
                {item.sentiment && (
                    <span
                        className={`news-sentiment ${item.sentiment}`}
                    >
                        {sentimentLabel}
                    </span>
                )}

                {item.relatedSymbols &&
                    item.relatedSymbols.length >
                    0 && (
                        <div className="news-related-symbols">
                            {item.relatedSymbols.map(
                                (sym) => (
                                    <span
                                        key={sym}
                                        className="news-related-symbol"
                                    >
                                        {sym}
                                    </span>
                                ),
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}

export function NewsList({
    symbol,
    limit = 10,
}: NewsListProps) {
    const { t, isRTL } = useI18n();
    const {
        data,
        isLoading,
        isError,
        error,
    } = useNews({
        symbol,
        lang: isRTL ? 'fa' : 'en',
        limit,
    });

    const [translatedItems, setTranslatedItems] =
        useState<NewsItem[]>([]);
    const [selectedItem, setSelectedItem] =
        useState<NewsItem | null>(null);
    const dataKeyRef = useRef<string | null>(
        null,
    );

    useEffect(() => {
        const currentKey = JSON.stringify(
            data?.data,
        );

        if (dataKeyRef.current === currentKey) {
            return;
        }

        dataKeyRef.current = currentKey;

        if (!data?.data || !isRTL) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTranslatedItems(data?.data || []);
            return;
        }

        let cancelled = false;

        (async () => {
            const translated =
                await Promise.all(
                    data.data.map(
                        (item) =>
                            translateNewsItem(
                                {
                                    title: item.title,
                                    summary: item.summary,
                                },
                                'fa',
                            ).then(
                                (result) => ({
                                    ...item,
                                    title: result.title,
                                    summary:
                                        result.summary,
                                }),
                            ),
                    ),
                );

            if (!cancelled) {
                setTranslatedItems(translated);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [data?.data, isRTL]);

    if (isLoading) {
        return (
            <div className="news-loading">
                <p>{t.signal.loading}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="news-error">
                <span>⚠️</span>
                <span>
                    {error instanceof Error
                        ? error.message
                        : 'Failed to load news'}
                </span>
            </div>
        );
    }

    if (!translatedItems || translatedItems.length === 0) {
        return (
            <div className="news-empty">
                {t.signal.noData}
            </div>
        );
    }

    return (
        <>
            <div className="news-list">
                {translatedItems.map((item) => (
                    <NewsItemCard
                        key={item.id}
                        item={item}
                        onClick={() =>
                            setSelectedItem(item)
                        }
                    />
                ))}
            </div>

            <NewsModal
                item={selectedItem}
                onClose={() =>
                    setSelectedItem(null)
                }
            />
        </>
    );
}
