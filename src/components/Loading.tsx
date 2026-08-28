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
}

export function Loading({ isRTL = false, compact = false }: LoadingProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const [dots, setDots] = useState('');

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

    if (compact) {
        return (
            <div className="loading-compact">
                <div className="loading-spinner" />
                <span className="loading-compact-text">{messages[messageIndex]}{dots}</span>
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
                    <div className="loading-progress-bar" />
                </div>
            </div>
        </div>
    );
}
