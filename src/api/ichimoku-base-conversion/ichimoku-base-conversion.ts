import type {
  IchimokuBaseConversionScanParams,
  IchimokuBaseConversionScanResult,
} from '../../types/ichimoku';

const BASE = 'http://localhost:3000/ichimoku-base-conversion';

export async function fetchIchimokuBaseConversionScan(
  params: IchimokuBaseConversionScanParams = {},
): Promise<IchimokuBaseConversionScanResult> {
  const query = new URLSearchParams();
  if (params.symbols) query.set('symbols', params.symbols);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.interval) query.set('interval', params.interval);
  if (params.exchange) query.set('exchange', params.exchange);

  const response = await fetch(`${BASE}/scan?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch Ichimoku base-conversion scan');
  }

  return response.json();
}
