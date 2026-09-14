import type { ReactNode } from 'react';

interface SignalSectionProps<T> {
  title: string;
  items: T[];
  emptyText: string;
  isRTL: boolean;
  renderItem: (item: T, index: number) => ReactNode;
}

export function SignalSection<T>({
  title,
  items,
  emptyText,
  isRTL,
  renderItem,
}: SignalSectionProps<T>) {
  if (items.length === 0) {
    return <p className="empty">{isRTL ? emptyText : emptyText}</p>;
  }

  return (
    <div className="signals-section">
      <h4>{title}</h4>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
}
