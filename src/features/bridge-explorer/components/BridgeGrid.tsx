"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import type { BridgeGridDto } from "@/features/bridge-explorer/api/bridgeDtos";
import { useBridgeGridQuery } from "@/features/bridge-explorer/api/bridgeQueries";
import { ConditionBadge } from "@/features/bridge-explorer/components/ConditionBadge";
import { PriorityBadge } from "@/features/bridge-explorer/components/PriorityBadge";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { formatDate, formatNumber } from "@/features/bridge-explorer/utils/formatters";
import { cn } from "@/lib/utils";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Info,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useMemo } from "react";

const columns: Array<ColumnDef<BridgeGridDto>> = [
  {
    accessorKey: "structureNumber",
    header: "Structure",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-foreground">
          {row.original.structureNumber}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.facilityCarried ?? "Unknown facility"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "stateCode",
    header: "State",
    cell: ({ row }) => (
      <div>
        <div>{row.original.stateCode}</div>
        <div className="text-xs text-muted-foreground">{row.original.stateName}</div>
      </div>
    ),
  },
  {
    accessorKey: "countyName",
    header: "County",
    cell: ({ row }) => row.original.countyName,
  },
  {
    accessorKey: "bridgeCondition",
    header: "Condition",
    cell: ({ row }) => <ConditionBadge condition={row.original.bridgeCondition} />,
  },
  {
    accessorKey: "priorityLevel",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge priority={row.original.priorityLevel} />,
  },
  {
    accessorKey: "averageDailyTraffic",
    header: "ADT",
    cell: ({ row }) => formatNumber(row.original.averageDailyTraffic),
  },
  {
    accessorKey: "bridgeAge",
    header: "Age",
    cell: ({ row }) =>
      row.original.bridgeAge === null ? "Unknown" : `${row.original.bridgeAge} yrs`,
  },
  {
    accessorKey: "lastInspectionDate",
    header: "Inspection",
    cell: ({ row }) => formatDate(row.original.lastInspectionDate),
  },
];

const numericColumnIds = new Set(["averageDailyTraffic", "bridgeAge"]);
const headerTooltips: Record<string, string> = {
  bridgeAge: "Calculated from yearBuilt using the current year.",
  bridgeCondition: "FHWA/NBI bridge condition value normalized to Good, Fair, Poor, or Unknown.",
  averageDailyTraffic: "Average Daily Traffic: estimated vehicles per day.",
  lastInspectionDate: "Last recorded inspection date in the NBI data.",
  priorityLevel:
    "Application-derived, rule-based classification; this is not an official NBI field.",
};

function columnAlignmentClassName(columnId: string) {
  return numericColumnIds.has(columnId) ? "text-center" : "text-left";
}

function HeaderTooltip({ columnId }: { columnId: string }) {
  const label = headerTooltips[columnId];

  if (!label) {
    return null;
  }

  return (
    <Tooltip label={label}>
      <span
        aria-label={`About ${columnId}`}
        className="inline-flex rounded-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </span>
    </Tooltip>
  );
}

function LoadingRows() {
  return (
    <tbody>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <tr className="border-b border-border" key={rowIndex}>
          {Array.from({ length: columns.length }).map((__, cellIndex) => (
            <td className="px-3 py-3" key={cellIndex}>
              <Skeleton className="h-4 w-full max-w-32" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function BridgeGrid() {
  const query = useBridgeGridQuery();
  const selectedBridgeId = useBridgeExplorerStore((state) => state.selectedBridgeId);
  const setSelectedBridgeId = useBridgeExplorerStore(
    (state) => state.setSelectedBridgeId
  );
  const sort = useBridgeExplorerStore((state) => state.sort);
  const setSort = useBridgeExplorerStore((state) => state.setSort);
  const pagination = useBridgeExplorerStore((state) => state.pagination);
  const setPage = useBridgeExplorerStore((state) => state.setPage);
  const resetFilters = useBridgeExplorerStore((state) => state.resetFilters);
  const data = query.data?.bridges ?? [];
  const tableColumns = useMemo(() => columns, []);
  const table = useReactTable({
    columns: tableColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: query.data?.totalPages ?? -1,
  });

  const toggleSort = (columnId: string) => {
    if (sort.sortBy === columnId) {
      setSort({
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection === "asc" ? "desc" : "asc",
      });
      return;
    }

    setSort({
      sortBy: columnId as typeof sort.sortBy,
      sortDirection: "desc",
    });
  };

  const totalPages = query.data?.totalPages ?? 1;
  const isEmpty = !query.isLoading && !query.isError && data.length === 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 bg-surface">
        <div>
          <CardTitle>Bridge Grid</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Server-side filtered and sorted bridge inventory records.
          </p>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {query.data ? `${formatNumber(query.data.totalCount)} bridges` : "Loading"}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        {query.isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm font-medium">Bridge grid could not be loaded.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              The API request failed. Existing filters were kept so you can retry
              without losing context.
            </p>
            <Button onClick={() => void query.refetch()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm font-medium">No bridges match these filters.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try widening the state, condition, priority, age, or traffic filters.
            </p>
            <Button onClick={resetFilters} variant="outline">
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-border bg-[var(--surface-elevated)] text-xs font-semibold text-muted-foreground shadow-[0_1px_0_var(--border)]">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className={cn(
                            "px-3 py-2",
                            columnAlignmentClassName(header.column.id)
                          )}
                          key={header.id}
                          scope="col"
                        >
                          {header.column.getCanSort() === false ? (
                            <div className="inline-flex items-center gap-1">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              <HeaderTooltip columnId={header.column.id} />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "inline-flex items-center gap-1",
                                numericColumnIds.has(header.column.id) &&
                                "justify-end text-right"
                              )}
                            >
                              <button
                                className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={() => toggleSort(header.column.id)}
                                type="button"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {sort.sortBy === header.column.id ? (
                                  sort.sortDirection === "asc" ? (
                                    <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                                  ) : (
                                    <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                                  )
                                ) : (
                                  <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden />
                                )}
                              </button>
                              <HeaderTooltip columnId={header.column.id} />
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                {query.isLoading ? (
                  <LoadingRows />
                ) : (
                  <tbody>
                    {table.getRowModel().rows.map((row) => {
                      const isSelected = selectedBridgeId === row.original.id;

                      return (
                        <tr
                          aria-selected={isSelected}
                          className={cn(
                            "cursor-pointer border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                            isSelected &&
                            "bg-[var(--surface-selected)] shadow-[inset_3px_0_0_var(--ring)]"
                          )}
                          key={row.id}
                          onClick={() => setSelectedBridgeId(row.original.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              setSelectedBridgeId(row.original.id);
                            }
                          }}
                          tabIndex={0}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              className={cn(
                                "px-3 py-2 align-middle",
                                cell.column.id === "structureNumber" && "font-mono text-xs",
                                columnAlignmentClassName(cell.column.id)
                              )}
                              key={cell.id}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">
                Page {pagination.page} of {Math.max(totalPages, 1)}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(Math.max(1, pagination.page - 1))}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
