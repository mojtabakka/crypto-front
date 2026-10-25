import type { ProtocolSearchItem, ProtocolDeepDive } from '../../types/protocol-analysis';

const BASE = 'http://localhost:3000/protocol-analysis';

export async function searchProtocols(
  query = '',
  limit = 30,
): Promise<ProtocolSearchItem[]> {
  const params = new URLSearchParams();
  params.set('query', query);
  params.set('limit', String(limit));

  const response = await fetch(`${BASE}/search?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to search protocols');
  }

  return response.json();
}

export async function getProtocolDeepDive(slug: string): Promise<ProtocolDeepDive> {
  const response = await fetch(`${BASE}/${encodeURIComponent(slug)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to load protocol analysis');
  }

  const data = await response.json();
  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ProtocolDeepDive;
}

export async function getCategories(): Promise<
  { category: string; count: number; totalTvl: number }[]
> {
  const response = await fetch(`${BASE}/categories`);
  if (!response.ok) throw new Error('Failed to load categories');
  return response.json();
}
