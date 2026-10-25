import type { VolumeMarketCapScanResult } from '../../types/volume-marketcap';

const BASE = 'http://localhost:3000/volume-marketcap';

export interface ScanParams {
  minRatio?: number;
  minMarketCap?: number;
  limit?: number;
  pages?: number;
  refresh?: boolean;
  includeSqueeze?: boolean;
}

export async function fetchVolumeMarketCapScan(
  params: ScanParams = {},
): Promise<VolumeMarketCapScanResult> {
  const query = new URLSearchParams();
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.minRatio !== undefined) query.set('minRatio', String(params.minRatio));
  if (params.minMarketCap !== undefined) query.set('minMarketCap', String(params.minMarketCap));
  if (params.pages !== undefined) query.set('pages', String(params.pages));
  if (params.refresh) query.set('refresh', 'true');
  if (params.includeSqueeze === false) query.set('includeSqueeze', 'false');

  const response = await fetch(`${BASE}?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch volume/market-cap scan');
  }

  return response.json();
}
