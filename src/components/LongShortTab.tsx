import { Loading } from './Loading';
import { SignalSection } from './SignalSection';
import type { ReactNode } from 'react';

interface LongShortTabProps<T> {
  data: { longs: T[]; shorts: T[] } | undefined;
  isLoading: boolean;
  isRTL: boolean;
  scanProgress?: { current?: number; total?: number } | null;
  longTitle: string;
  shortTitle: string;
  emptyText: string;
  renderItem: (item: T, index: number) => ReactNode;
}

export function LongShortTab<T>({
  data,
  isLoading,
  isRTL,
  scanProgress,
  longTitle,
  shortTitle,
  emptyText,
  renderItem,
}: LongShortTabProps<T>) {
  return (
    <>
      {isLoading && <Loading isRTL={isRTL} progress={scanProgress?.current} total={scanProgress?.total} />}
      {data && (
        <>
          <SignalSection
            title={longTitle}
            items={data.longs}
            emptyText={emptyText}
            isRTL={isRTL}
            renderItem={renderItem}
          />
          <SignalSection
            title={shortTitle}
            items={data.shorts}
            emptyText={emptyText}
            isRTL={isRTL}
            renderItem={renderItem}
          />
          {data.longs.length === 0 && data.shorts.length === 0 && (
            <p className="empty">{emptyText}</p>
          )}
        </>
      )}
    </>
  );
}
