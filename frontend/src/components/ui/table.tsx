import React from 'react';
import { cn } from '@/lib/utils';

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(function Table(
  { className = '', ...props },
  ref,
) {
  return <table ref={ref} className={cn('min-w-full divide-y divide-border', className)} {...props} />;
});

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableHeader(
  { className = '', ...props },
  ref,
) {
  return <thead ref={ref} className={cn(className)} {...props} />;
});

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableBody(
  { className = '', ...props },
  ref,
) {
  return <tbody ref={ref} className={cn('divide-y divide-border', className)} {...props} />;
});

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(function TableRow(
  { className = '', ...props },
  ref,
) {
  return <tr ref={ref} className={cn(className)} {...props} />;
});

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(function TableHead(
  { className = '', ...props },
  ref,
) {
  return <th ref={ref} className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground', className)} {...props} />;
});

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(function TableCell(
  { className = '', ...props },
  ref,
) {
  return <td ref={ref} className={cn('px-4 py-4 text-sm text-foreground', className)} {...props} />;
});

export default Table;
