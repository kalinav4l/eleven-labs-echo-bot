import React, { memo, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    width?: number;
    render?: (item: T) => React.ReactNode;
  }[];
  rowHeight?: number;
  height?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
}

function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 50,
  height = 400,
  className = '',
  onRowClick
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5
  });

  const items = virtualizer.getVirtualItems();
  
  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + (col.width || 150), 0), 
    [columns]
  );

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Table Header */}
      <div 
        className="bg-muted border-b sticky top-0 z-10"
        style={{ width: totalWidth }}
      >
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-left text-sm font-medium text-muted-foreground border-r last:border-r-0"
              style={{ width: column.width || 150 }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div 
        ref={parentRef} 
        className="overflow-auto"
        style={{ height }}
      >
        <div 
          style={{ 
            height: virtualizer.getTotalSize(), 
            position: 'relative',
            width: totalWidth
          }}
        >
          {items.map((virtualRow) => {
            const item = data[virtualRow.index];
            return (
              <div
                key={virtualRow.index}
                className={`absolute top-0 left-0 w-full border-b hover:bg-muted/50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                style={{
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                <div className="flex h-full items-center">
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="px-4 py-2 text-sm border-r last:border-r-0 flex items-center"
                      style={{ width: column.width || 150 }}
                    >
                      {column.render 
                        ? column.render(item) 
                        : String((item as any)[column.key] || '')
                      }
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}

export default memo(VirtualizedTable) as typeof VirtualizedTable;