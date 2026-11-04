import { Loading } from '../Loading';
import { useI18n } from '../../i18n';

interface EventsTabProps {
    eventsData: any;
    eventsLoading: boolean;
    eventsError: boolean;
    symbol: string;
}

export function EventsTab({ eventsData, eventsLoading, eventsError, symbol }: EventsTabProps) {
    const { isRTL } = useI18n();

    return (
        <div className="tab-panel">
            {eventsLoading && <Loading isRTL={isRTL} compact />}

            {eventsError && (
                <div className="error-state">
                    <span>⚠️</span>
                    <span>Failed to load events</span>
                </div>
            )}

            {!eventsLoading && !eventsError && eventsData?.items && eventsData.items.length > 0 && (
                <div className="events-list">
                    {eventsData.items.map((event: any) => (
                        <div key={event.id} className="event-item">
                            <div className="event-header">
                                <span className={`event-type event-type-${event.type}`}>
                                    {event.type}
                                </span>
                                <span className="event-time">
                                    {new Date(event.timestamp).toLocaleString()}
                                </span>
                            </div>

                            {event.description && (
                                <p className="event-description">
                                    {event.description}
                                </p>
                            )}

                            <div className="event-meta">
                                {event.side && (
                                    <span className={`event-side event-side-${event.side}`}>
                                        {event.side === 'long' ? 'LONG' : 'SHORT'}
                                    </span>
                                )}
                                {event.price && (
                                    <span>Price: {event.price.toLocaleString()}</span>
                                )}
                                {event.quantity && (
                                    <span>Qty: {event.quantity.toLocaleString()}</span>
                                )}
                                {event.value && (
                                    <span>Value: {event.value.toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!eventsLoading && !eventsError && (!eventsData?.items || eventsData.items.length === 0) && (
                <p className="placeholder-text">
                    No events for {symbol}
                </p>
            )}
        </div>
    );
}
