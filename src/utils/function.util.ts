export function formatChartTime(
    timestamp: number,
    range: string,
) {
    const date = new Date(timestamp);

    if (range === '24h' || range === '48h') {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}