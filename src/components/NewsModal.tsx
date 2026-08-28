import { useEffect, useCallback } from 'react';
import type { NewsItem } from '../api/market/market';
import { useI18n } from '../i18n';
import { Button } from './Button';
import './NewsModal.css';

interface NewsModalProps {
    item: NewsItem | null;
    onClose: () => void;
}

function formatNewsDate(
    isoString: string,
): string {
    const date = new Date(isoString);

    return date.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function NewsModal({
    item,
    onClose,
}: NewsModalProps) {
    const { t } = useI18n();

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (!item) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener(
            'keydown',
            handleKeyDown,
        );
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );
            document.body.style.overflow = '';
        };
    }, [item, onClose]);

    if (!item) {
        return null;
    }

    const sentimentLabel =
        item.sentiment === 'positive'
            ? 'Positive'
            : item.sentiment === 'negative'
              ? 'Negative'
              : 'Neutral';

    return (
        <div
            className="news-modal-backdrop"
            onClick={handleBackdropClick}
        >
            <div className="news-modal">
                <div className="news-modal-header">
                    <h2 className="news-modal-title">
                        {item.title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </Button>
                </div>

                <div className="news-modal-meta">
                    <span>
                        {item.source || 'Unknown'}
                    </span>
                    <span>
                        {formatNewsDate(item.publishedAt)}
                    </span>
                </div>

                {item.summary && (
                    <p className="news-modal-summary">
                        {item.summary}
                    </p>
                )}

                <div className="news-modal-footer">
                    {item.sentiment && (
                        <span
                            className={`news-sentiment ${item.sentiment}`}
                        >
                            {sentimentLabel}
                        </span>
                    )}

                    {item.url && (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="news-modal-link"
                        >
                            {t.news.readMore} →
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
