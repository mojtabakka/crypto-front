import type {
  IchimokuCombinedScanParams,
  IchimokuCombinedScanResult,
} from '../../types/ichimoku';

const BASE = 'http://localhost:3000/ichimoku-combined';
const SCHEDULER_BASE = 'http://localhost:3000/ichimoku-combined-scheduler';

export async function fetchIchimokuCombinedScan(
  params: IchimokuCombinedScanParams = {},
): Promise<IchimokuCombinedScanResult> {
  const query = new URLSearchParams();
  if (params.symbols) query.set('symbols', params.symbols);
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.interval) query.set('interval', params.interval);

  const response = await fetch(`${BASE}/scan?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to fetch Ichimoku combined scan');
  }

  return response.json();
}

export interface SendToTelegramResult {
  sent: boolean;
  matches: number;
  totalScanned: number;
}

export async function sendIchimokuToTelegram(
  interval: string,
  chatId: string,
  exchange: string = 'binance',
): Promise<SendToTelegramResult> {
  const query = new URLSearchParams();
  query.set('interval', interval);
  query.set('chatId', chatId);
  query.set('exchange', exchange);

  const response = await fetch(`${SCHEDULER_BASE}/send-to-telegram?${query.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || 'Failed to send to Telegram');
  }

  return response.json();
}
