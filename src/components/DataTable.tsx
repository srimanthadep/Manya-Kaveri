import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { EmptyState } from './EmptyState';
import { Skeleton } from './LoadingSkeleton';
import { cn } from '../lib/utils';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  headerAction?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items matching your criteria.',
  emptyAction,
  headerAction,
  title,
  subtitle,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const activeSearch = searchValue !== undefined ? searchValue : internalSearch;
  const handleSearch = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
    setCurrentPage(1);
  };

  // Client side search filter if no onSearchChange supplied
  const filteredData = onSearchChange
    ? data
    : data.filter((item: any) => {
        if (!activeSearch.trim()) return true;
        const query = activeSearch.toLowerCase();
        return Object.values(item).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(query)
        );
      });

  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const startRecord = totalRecords === 0 ? 0 : startIndex + 1;
  const endRecord = Math.min(startIndex + pageSize, totalRecords);

  return (
    <GlassCard className="p-5 sm:p-6 space-y-4">
      {/* Table Header Controls */}
      {(title || searchable || headerAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          {title && (
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
            </div>
          )}

          <div className="flex items-center gap-3 flex-1 sm:justify-end">
            {searchable && (
              <div className="relative w-full max-w-xs">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={activeSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input placeholder:text-zinc-500"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Table Structure */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0E0E10] -mx-1 sm:mx-0">
        <table className="w-full text-left text-sm text-zinc-200">
          <thead className="bg-[#141416] text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-white/[0.08]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'px-4 py-3.5 whitespace-nowrap',
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id ? String(item.id) : rowIdx}
                  className="hover:bg-white/[0.04] transition-colors duration-150 group"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn(
                        'px-4 py-3.5 text-xs sm:text-sm whitespace-nowrap',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                        col.className
                      )}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : col.accessor
                        ? (item[col.accessor] as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs text-zinc-400">
          <div>
            Showing <span className="font-semibold text-zinc-200">{startRecord}</span>–
            <span className="font-semibold text-zinc-200">{endRecord}</span> of{' '}
            <span className="font-semibold text-zinc-200">{totalRecords}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-[#18181A] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none transition-colors text-zinc-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-zinc-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-[#18181A] border border-white/[0.08] hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none transition-colors text-zinc-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
