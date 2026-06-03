import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { expenses, categoryMeta, type Expense, type ExpenseStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ExpensesTableProps {
  data?: Expense[];
}

const statusStyles: Record<ExpenseStatus, string> = {
  Cleared: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Flagged: "bg-destructive/10 text-destructive border-destructive/20",
};

export function ExpensesTable({ data = expenses }: ExpensesTableProps) {
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 6;

  const sorted = useMemo(
    () => [...data].sort((a, b) => (sortAsc ? a.amount - b.amount : b.amount - a.amount)),
    [data, sortAsc]
  );
  const totalPages = Math.ceil(sorted.length / perPage);
  const rows = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Recent expenses</h2>
          <p className="text-xs text-muted-foreground">Auto‑categorized by AI · {data.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8">Export</Button>
          <Button variant="outline" size="sm" className="h-8">Filter</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-10 pl-5">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>
                <button
                  onClick={() => setSortAsc((v) => !v)}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-5">AI insight</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const meta = categoryMeta[row.category];
              return (
                <TableRow key={row.id} className="border-border transition-colors hover:bg-accent/40">
                  <TableCell className="pl-5">
                    <Checkbox aria-label={`Select ${row.id}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: `color-mix(in oklab, ${meta.color} 15%, transparent)`, color: meta.color }}
                      >
                        <meta.icon className="h-4 w-4" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-sm font-medium text-foreground">{row.merchant}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{row.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.category}</TableCell>
                  <TableCell className="font-mono text-sm font-semibold">
                    ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-medium", statusStyles[row.status])}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5 text-xs text-muted-foreground max-w-[220px] truncate">
                    {row.aiNote}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{(page - 1) * perPage + 1}</span>–
          <span className="font-medium text-foreground">{Math.min(page * perPage, sorted.length)}</span> of {sorted.length}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 font-mono text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}