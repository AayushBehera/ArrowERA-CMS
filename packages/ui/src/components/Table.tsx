import React, { forwardRef, useRef, useCallback, useState, useEffect } from 'react';
import type { HTMLAttributes } from 'react';
import { IconArrowUp } from '../icons/IconArrowUp';
import { IconArrowDown } from '../icons/IconArrowDown';
import { IconChevronDown } from '../icons/IconChevronDown';
import { Checkbox } from './Checkbox';
import { Skeleton } from './Skeleton';

/* ── Column Definition ── */

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

/* ── Table Props ── */

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (item: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  rowKey: (item: T, index: number) => string;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

/* ── Helpers ── */

const alignClasses: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/* ── Table Component ── */

function TableInner<T>(
  {
    columns,
    data,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    onRowClick,
    onSort,
    sortKey,
    sortDirection,
    rowKey,
    emptyMessage = 'No data.',
    loading = false,
    className = '',
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) {
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const [focusRow, setFocusRow] = useState<number>(-1);
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  /* ── Selection ── */

  const allIds = data.map((item, i) => rowKey(item, i));
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected =
    allIds.some((id) => selectedIds.includes(id)) && !allSelected;

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  }, [allSelected, allIds, onSelectionChange]);

  const toggleRow = useCallback(
    (id: string) => {
      if (!onSelectionChange) return;
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((s) => s !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    },
    [onSelectionChange, selectedIds]
  );

  /* ── Sorting ── */

  const handleSort = useCallback(
    (key: string) => {
      if (!onSort) return;
      const next: 'asc' | 'desc' =
        sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, next);
    },
    [onSort, sortKey, sortDirection]
  );

  /* ── Keyboard Navigation ── */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, index: number) => {
      let next = index;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        next = Math.min(index + 1, data.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        next = Math.max(index - 1, 0);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = rowKey(data[index], index);
        if (selectable && onSelectionChange) {
          toggleRow(id);
        } else if (onRowClick) {
          onRowClick(data[index], index);
        }
        return;
      } else if (e.key === 'Escape') {
        (e.currentTarget as HTMLElement).blur();
        setFocusRow(-1);
        return;
      }

      setFocusRow(next);
      const target = rowRefs.current.get(next);
      target?.focus();
    },
    [data, selectable, onSelectionChange, onRowClick, rowKey, toggleRow]
  );

  /* ── Render Helpers ── */

  const renderSortIcon = (key: string) => {
    const active = sortKey === key;
    return (
      <span className="inline-flex flex-col items-center ml-1 -space-y-1">
        <IconArrowUp
          size={10}
          strokeWidth={2.5}
          className={active && sortDirection === 'asc' ? 'text-ae-fg' : 'text-ae-text-disabled'}
        />
        <IconArrowDown
          size={10}
          strokeWidth={2.5}
          className={active && sortDirection === 'desc' ? 'text-ae-fg' : 'text-ae-text-disabled'}
        />
      </span>
    );
  };

  const renderCell = (col: Column<T>, item: T, index: number) => {
    if (col.render) return col.render(item, index);
    return String((item as Record<string, unknown>)[col.key] ?? '');
  };

  /* ── Loading Skeleton ── */

  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table ref={ref} className="w-full border-collapse" role="table">
          <thead>
            <tr className="border-b border-ae-border">
              {selectable && (
                <th className="w-10 px-3 py-2.5" />
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-ae-xs font-medium text-ae-text-secondary uppercase tracking-wider ${alignClasses[col.align ?? 'left']}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-ae-border-light">
                {selectable && (
                  <td className="px-3 py-2">
                    <Skeleton variant="rectangular" width={16} height={16} />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    <Skeleton variant="text" width={col.width ? undefined : '80%'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ── Empty State ── */

  if (data.length === 0) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table ref={ref} className="w-full border-collapse" role="table">
          <thead>
            <tr className="border-b border-ae-border">
              {selectable && (
                <th className="w-10 px-3 py-2.5 align-middle">
                  <Checkbox
                    checked={false}
                    disabled
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-ae-xs font-medium text-ae-text-secondary uppercase tracking-wider ${alignClasses[col.align ?? 'left']}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-3 py-16 text-center text-ae-sm text-ae-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        ref={ref}
        className="w-full border-collapse"
        role="table"
        data-selectable={selectable || undefined}
        data-sortable={!!onSort || undefined}
      >
        {/* ── Header ── */}
        <thead>
          <tr className="border-b border-ae-border">
            {selectable && (
              <th className="w-10 px-3 py-2.5 align-middle">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2.5 text-ae-xs font-medium text-ae-text-secondary uppercase tracking-wider select-none ${alignClasses[col.align ?? 'left']} ${
                  col.sortable && onSort ? 'cursor-pointer hover:text-ae-text-primary transition-colors duration-ae-fast' : ''
                }`}
                style={{ width: col.width }}
                onClick={col.sortable && onSort ? () => handleSort(col.key) : undefined}
                aria-sort={
                  sortKey === col.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                data-sortable={col.sortable || undefined}
                data-sorted={sortKey === col.key ? sortDirection : undefined}
              >
                <span className="inline-flex items-center">
                  {col.header}
                  {col.sortable && onSort && renderSortIcon(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody
          ref={bodyRef}
          role="rowgroup"
          onKeyDown={(e) => {
            if (focusRow >= 0) handleKeyDown(e, focusRow);
          }}
        >
          {data.map((item, index) => {
            const id = rowKey(item, index);
            const isSelected = selectedIds.includes(id);
            const isFocused = focusRow === index;

            return (
              <tr
                key={id}
                ref={(el) => {
                  if (el) rowRefs.current.set(index, el);
                  else rowRefs.current.delete(index);
                }}
                tabIndex={0}
                role="row"
                aria-selected={selectable ? isSelected : undefined}
                data-selected={isSelected || undefined}
                data-row-index={index}
                className={`border-b border-ae-border-light outline-none transition-colors duration-ae-fast
                  hover:bg-ae-hover
                  focus-visible:bg-ae-hover focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ae-focus-ring
                  ${isSelected ? 'bg-ae-surface-secondary' : ''}
                  ${onRowClick || selectable ? 'cursor-pointer' : ''}
                `}
                onClick={(e) => {
                  if (selectable && (e.target as HTMLElement).closest('input[type="checkbox"]')) {
                    return; // let checkbox handle its own click
                  }
                  if (selectable && onSelectionChange) {
                    toggleRow(id);
                  }
                  if (onRowClick) {
                    onRowClick(item, index);
                  }
                }}
                onFocus={() => setFocusRow(index)}
                onBlur={() => {
                  if (focusRow === index) setFocusRow(-1);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {selectable && (
                  <td className="px-3 py-2 align-middle">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleRow(id)}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 text-ae-sm text-ae-text-primary ${alignClasses[col.align ?? 'left']}`}
                    style={{ width: col.width }}
                  >
                    {renderCell(col, item, index)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Export with forwardRef & generic support ── */

export const Table = forwardRef(TableInner) as (<T>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLTableElement> }
) => ReturnType<typeof TableInner>) & { displayName?: string };

Table.displayName = 'Table';
