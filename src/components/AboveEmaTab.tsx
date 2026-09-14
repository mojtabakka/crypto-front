import { Loading } from './Loading';
import { SignalSection } from './SignalSection';
import type { ReactNode } from 'react';

interface AboveEmaTabProps<T> {
  data: { symbols: T[] } | undefined;
  isLoading: boolean;
  isRTL: boolean;
  scanProgress?: { current?: number; total?: number } | null;
  title: string;
  emptyText: string;
  renderItem: (item: T, index: number) => ReactNode;
}

export function AboveEmaTab<T>({
  data,
  isLoading,
  isRTL,
  scanProgress,
  title,
  emptyText,
  renderItem,
}: AboveEmaTabProps<T>) {
  return (
    <>
      {isLoading && <Loading isRTL={isRTL} progress={scanProgress?.current} total={scanProgress?.total} />}
      {data && (
        <>
          <SignalSection
            title={title}
            items={data.symbols}
            emptyText={emptyText}
            isRTL={isRTL}
            renderItem={renderItem}
          />
          {data.symbols.length === 0 && (
            <p className="empty">{emptyText}</p>
          )}
        </>
      )}
    </>
  );
}
