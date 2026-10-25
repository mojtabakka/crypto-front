import type { ExchangeName } from '../market/market';
import type { TVLScanResult, TVLAnalysisResult } from '../../types/tvl-analysis';

const TVL_BASE_URL = 'http://localhost:3000/tvl-analysis';

export async function fetchTVLScan(exchange: ExchangeName = 'BINANCE'): Promise<TVLScanResult> {
  const response = await fetch(`${TVL_BASE_URL}/scan?exchange=${exchange}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch TVL scan');
  }

  return response.json();
}

export async function fetchTopOpportunities(exchange: ExchangeName = 'BINANCE', limit = 20): Promise<TVLAnalysisResult[]> {
  const response = await fetch(`${TVL_BASE_URL}/top-opportunities?exchange=${exchange}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch top opportunities');
  }

  return response.json();
}

export async function fetchTopByTVL(exchange: ExchangeName = 'BINANCE', limit = 20): Promise<TVLScanResult> {
  const response = await fetch(`${TVL_BASE_URL}/top-by-tvl?exchange=${exchange}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch top by TVL');
  }

  return response.json();
}

export async function fetchTopByGrowth(exchange: ExchangeName = 'BINANCE', limit = 20): Promise<TVLScanResult> {
  const response = await fetch(`${TVL_BASE_URL}/top-by-growth?exchange=${exchange}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch top by growth');
  }

  return response.json();
}

export async function fetchUndervalued(exchange: ExchangeName = 'BINANCE', limit = 20): Promise<TVLScanResult> {
  const response = await fetch(`${TVL_BASE_URL}/undervalued?exchange=${exchange}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch undervalued');
  }

  return response.json();
}

export async function fetchBlueChips(exchange: ExchangeName = 'BINANCE', limit = 20): Promise<TVLScanResult> {
  const response = await fetch(`${TVL_BASE_URL}/blue-chips?exchange=${exchange}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch blue chips');
  }

  return response.json();
}

export async function fetchMultiChain(exchange: ExchangeName = 'BINANCE', limit = 20): Promise<TVLScanResult> {
  const response = await fetch(`${TVL_BASE_URL}/multi-chain?exchange=${exchange}&limit=${limit}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch multi-chain');
  }

  return response.json();
}

export async function fetchProtocolBySymbol(symbol: string, exchange: ExchangeName = 'BINANCE'): Promise<TVLAnalysisResult | null> {
  const response = await fetch(`${TVL_BASE_URL}/protocol/${symbol}?exchange=${exchange}`);

  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch protocol');
  }

  return response.json();
}

export async function fetchByChain(chain: string, exchange: ExchangeName = 'BINANCE'): Promise<TVLAnalysisResult[]> {
  const response = await fetch(`${TVL_BASE_URL}/by-chain/${chain}?exchange=${exchange}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch by chain');
  }

  return response.json();
}

export async function fetchByCategory(category: string, exchange: ExchangeName = 'BINANCE'): Promise<TVLAnalysisResult[]> {
  const response = await fetch(`${TVL_BASE_URL}/by-category/${category}?exchange=${exchange}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch by category');
  }

  return response.json();
}