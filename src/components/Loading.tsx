import { useState, useEffect } from 'react';

const LOADING_MESSAGES_EN = [
    'Fetching market data...',
    'Analyzing price action...',
    'Calculating indicators...',
    'Scanning for signals...',
    'Almost there...',
];

const LOADING_MESSAGES_FA = [
    'در حال دریافت داده‌های بازار...',
    'تحلیل حرکات قیمت...',
    'محاسبه اندیکاتورها...',
    'اسکن برای سیگنال...',
    'چند لحظه دیگه...',
];

interface LoadingProps {
    isRTL?: boolean;
    compact?: boolean;
    progress?: number;
    total?: number;
}

export function Loading({ isRTL = false, compact = false, progress, total }: LoadingProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');
    const [animatedProgress, setAnimatedProgress] = useState(0);

    const messages = isRTL ? LOADING_MESSAGES_FA : LOADING_MESSAGES_EN;

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % messages.length);
        }, 2000);

        const dotsInterval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 400);

        return () => {
            clearInterval(messageInterval);
            clearInterval(dotsInterval);
        };
    }, [messages.length]);

    useEffect(() => {
        if (progress !== undefined && total !== undefined && total > 0) {
            const targetPercent = Math.round((progress / total) * 100);
            const interval = setInterval(() => {
                setAnimatedProgress(prev => {
                    if (prev < targetPercent) return Math.min(prev + 1, targetPercent);
                    clearInterval(interval);
                    return prev;
                });
            }, 20);
            return () => clearInterval(interval);
        }
    }, [progress, total]);

    const hasProgress = progress !== undefined && total !== undefined && total > 0;
    const displayProgress = hasProgress ? animatedProgress : 0;

    if (compact) {
        return (
            <div className="loading-compact">
                <div className="loading-spinner" />
                <span className="loading-compact-text">{messages[messageIndex]}{dots}</span>
                {hasProgress && (
                    <span className="loading-progress-text">
                        {progress}/{total}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="loading-overlay">
            <div className="loading-card">
                <div className="loading-spinner-wrapper">
                    <div className="loading-spinner" />
                    <div className="loading-spinner-inner" />
                </div>
                <p className="loading-message">{messages[messageIndex]}{dots}</p>
                <div className="loading-progress">
                    <div 
                        className="loading-progress-bar" 
                        style={{ width: hasProgress ? `${displayProgress}%` : '100%' }}
                    />
                </div>
                {hasProgress && (
                    <p className="loading-progress-label">
                        {progress} / {total} {isRTL ? 'ارز تحلیل شد' : 'symbols analyzed'}
                    </p>
                )}
            </div>
        </div>
    );
}
