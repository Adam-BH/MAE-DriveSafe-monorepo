import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T extends { id?: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-[rgba(43,52,151,0.08)]">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-heading font-semibold text-text-muted text-small uppercase tracking-wide">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-[rgba(43,52,151,0.06)]">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-[rgba(43,52,151,0.08)] bg-white py-16 text-center">
        <p className="text-text-muted text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[rgba(43,52,151,0.08)]">
      <table className="w-full text-body">
        <thead className="bg-surface">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-heading font-semibold text-text-muted text-small uppercase tracking-wide ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[rgba(43,52,151,0.06)]">
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-surface transition-colors' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-text-primary ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
