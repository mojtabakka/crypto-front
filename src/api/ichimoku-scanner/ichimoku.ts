import type { IchimokuScanParams, IchimokuScanResult } from '../../types/ichimoku';

const BASE = 'http://localhost:3000/ichimoku-scanner';

export async function fetchIchimokuScan(
  params: IchimokuScanParams = {},
): Promise<IchimokuScanResult> {
  const query = new URLSearchParams();
  if (params.symbols) query.set('symbols', params.symbols);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.interval) query.set('interval', params.interval);

  const response = await fetch(`${BASE}/scan?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch Ichimoku scan');
  }

  return response.json();
}
