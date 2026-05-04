import { useMemo, useState } from 'react';

type VirtualListProps<T> = {
  items: T[];
  itemHeight: number;
  height: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
};

/**
 * Small windowing utility used for long admin/game tables to keep DOM nodes low.
 */
export function VirtualList<T>({
  items,
  itemHeight,
  height,
  overscan = 4,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(height / itemHeight) + overscan * 2;
  const endIndex = Math.min(items.length, startIndex + visibleCount);

  const windowedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [endIndex, items, startIndex],
  );

  return (
    <div
      style={{ height, overflowY: 'auto' }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: startIndex * itemHeight,
            left: 0,
            right: 0,
          }}
        >
          {windowedItems.map((item, offset) => renderItem(item, startIndex + offset))}
        </div>
      </div>
    </div>
  );
}
