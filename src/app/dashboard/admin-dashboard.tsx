"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Delete,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import type { FormRow } from "@/lib/fetch";
import { useAlumniCache } from "@/hooks/use-alumni-cache";
import { useOnlineStatus } from "@/hooks/use-online";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCards } from "@/components/dashboard/stat-cards";
import {
  MemberDetailSheet,
  EditMemberDialog,
  DeleteMemberDialog,
} from "@/components/dashboard/member-actions";

const PAGE_SIZE = 25;
const PASS_VALUES = ["SSLC", "PUC", "Degree", "Others"];
const YEARS = Array.from({ length: 86 }, (_, i) => 1940 + i);

const SORTABLE_COLUMNS: { id: string; label: string }[] = [
  { id: "serialNumber", label: "Member ID" },
  { id: "name", label: "Name" },
  { id: "number", label: "Phone" },
  { id: "email", label: "Email" },
  { id: "year", label: "Year" },
];

function SerialCell({ serialNumber }: { serialNumber?: number }) {
  return (
    <span className="font-semibold text-indigo-600 tabular-nums">
      #{serialNumber ?? "—"}
    </span>
  );
}

function formatRelative(date: Date | null): string {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const { rows, updatedAt, loading, fromCache, sync, updateRow, removeRow } =
    useAlumniCache();

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "serialNumber", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [exportFormat, setExportFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [detailMember, setDetailMember] = useState<FormRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMember, setEditMember] = useState<FormRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteMember, setDeleteMember] = useState<FormRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const passFilter = useMemo(
    () => (columnFilters.find((f) => f.id === "pass")?.value as string[]) ?? [],
    [columnFilters]
  );
  const yearFilter = useMemo(
    () => (columnFilters.find((f) => f.id === "year")?.value as string[]) ?? [],
    [columnFilters]
  );

  const hasActiveFilters =
    globalFilter.length > 0 || passFilter.length > 0 || yearFilter.length > 0;

  const resetFilters = useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === "Escape") {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const columns = useMemo<ColumnDef<FormRow>[]>(() => {
    const selectCol: ColumnDef<FormRow> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          aria-label="Select all rows on page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.original.name}`}
        />
      ),
      size: 40,
    };

    const dataCols: ColumnDef<FormRow>[] = [
      {
        id: "serialNumber",
        accessorFn: (row) => row.serialNumber ?? 0,
        header: "Member ID",
        cell: ({ row }) => <SerialCell serialNumber={row.original.serialNumber} />,
        size: 90,
      },
      { id: "name", accessorFn: (row) => row.name, header: "Name" },
      { id: "address", accessorFn: (row) => row.address, header: "Address" },
      { id: "number", accessorFn: (row) => String(row.number), header: "Phone" },
      { id: "email", accessorFn: (row) => row.email ?? "", header: "Email" },
      { id: "aadhar", accessorFn: (row) => row.aadhar ?? "", header: "Aadhar" },
      { id: "pass", accessorFn: (row) => row.pass ?? "", header: "Education" },
      { id: "year", accessorFn: (row) => row.year ?? "", header: "Year" },
    ];

    return [selectCol, ...dataCols];
  }, []);

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter, columnFilters, sorting, pagination, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "auto",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row._id ?? String(row.number),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = Math.max(table.getPageCount(), 1);
  const currentPage = table.getState().pagination.pageIndex + 1;

  const selectedIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((key) => rows.find((row) => (row._id ?? String(row.number)) === key)?._id)
        .filter((id): id is string => Boolean(id)),
    [rowSelection, rows]
  );

  const selectedCount = Object.keys(rowSelection).length;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sync();
      toast.success("Data synced with server");
    } catch {
      toast.error("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async (scope: "all" | "filtered" | "selected", ids?: string[]) => {
    setExporting(true);
    try {
      const query = new URLSearchParams({ format: exportFormat, scope });
      if (scope === "filtered") {
        const filtered = table.getFilteredRowModel().rows.map((r) => r.original._id);
        for (const id of filtered.filter((i): i is string => Boolean(i))) {
          query.append("id", id);
        }
        query.set("scope", "selected");
      }
      if (scope === "selected" && ids) {
        for (const id of ids) query.append("id", id);
      }

      const response = await fetch(`/api/export?${query.toString()}`);
      if (response.status === 401) {
        router.replace("/signin");
        return;
      }
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Export failed");
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `members-${scope}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
      toast.success(
        `Exported ${scope === "selected" ? "selected members" : scope === "all" ? "all members" : "filtered view"}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    let deletedTotal = 0;
    try {
      const CHUNK = 500;
      for (let i = 0; i < selectedIds.length; i += CHUNK) {
        const chunk = selectedIds.slice(i, i + CHUNK);
        const response = await fetch("/api/members/bulk-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: chunk }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.message || "Could not delete members");
        }
        deletedTotal += result.deletedCount ?? chunk.length;
        for (const id of chunk) {
          removeRow(id);
        }
      }
      toast.success(`Deleted ${deletedTotal} members`);
      setBulkDeleteOpen(false);
      setRowSelection({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete members");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSavedMember = useCallback(
    (updated: FormRow) => {
      updateRow(updated);
    },
    [updateRow]
  );

  const handleDeletedMember = useCallback(
    (id: string) => {
      removeRow(id);
    },
    [removeRow]
  );

  const visibleRows = table.getRowModel().rows;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600/10">
              <User className="size-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">NV Past Students Association</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 sm:inline">
              {fromCache ? "Cached" : "Live"} · Updated {formatRelative(updatedAt)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing || !isOnline}
              title="Sync with server"
            >
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetch("/api/sign-out", { method: "POST" }).finally(() => {
                  router.replace("/signin");
                  router.refresh();
                });
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <StatCards />

        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/85 shadow-xl shadow-indigo-100/40 backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  ref={searchInputRef}
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  placeholder="Search name, phone, email, or #ID... (⌘K)"
                  className="pl-8 pr-16"
                  aria-label="Search members"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {globalFilter ? (
                    <button
                      type="button"
                      onClick={() => setGlobalFilter("")}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:inline">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>

              <div className="flex rounded-lg border border-input">
                <Button
                  variant={
                    sorting[0]?.id === "serialNumber" && sorting[0]?.desc
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="rounded-none rounded-l-lg"
                  onClick={() => setSorting([{ id: "serialNumber", desc: true }])}
                  title="Newest first (#564 → #1)"
                >
                  <ArrowDownNarrowWide className="size-4" />
                  Newest
                </Button>
                <Button
                  variant={
                    sorting[0]?.id === "serialNumber" && !sorting[0]?.desc
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="rounded-none rounded-r-lg"
                  onClick={() => setSorting([{ id: "serialNumber", desc: false }])}
                  title="Oldest first (#1 → #564)"
                >
                  <ArrowUpNarrowWide className="size-4" />
                  Oldest
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Filter className="size-4" />
                      Graduation Year
                      {yearFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {yearFilter.length}
                        </Badge>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-64">
                  <PopoverHeader>
                    <PopoverTitle>Graduation Year</PopoverTitle>
                  </PopoverHeader>
                  <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                    {YEARS.map((year) => {
                      const selected = yearFilter.includes(String(year));
                      return (
                        <label
                          key={year}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...yearFilter, String(year)]
                                : yearFilter.filter((y) => y !== String(year));
                              setColumnFilters((prev) =>
                                next.length > 0
                                  ? [
                                      ...prev.filter((f) => f.id !== "year"),
                                      { id: "year", value: next },
                                    ]
                                  : prev.filter((f) => f.id !== "year")
                              );
                              setPagination((p) => ({ ...p, pageIndex: 0 }));
                            }}
                          />
                          {year}
                        </label>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="size-4" />
                      Pass / Branch
                      {passFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {passFilter.length}
                        </Badge>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-56">
                  <PopoverHeader>
                    <PopoverTitle>Pass / Branch Type</PopoverTitle>
                  </PopoverHeader>
                  <div className="space-y-1">
                    {PASS_VALUES.map((value) => {
                      const selected = passFilter.includes(value);
                      return (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...passFilter, value]
                                : passFilter.filter((p) => p !== value);
                              setColumnFilters((prev) =>
                                next.length > 0
                                  ? [
                                      ...prev.filter((f) => f.id !== "pass"),
                                      { id: "pass", value: next },
                                    ]
                                  : prev.filter((f) => f.id !== "pass")
                              );
                              setPagination((p) => ({ ...p, pageIndex: 0 }));
                            }}
                          />
                          {value}
                        </label>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="rounded-lg border border-input bg-white px-2 py-1.5 text-sm"
                aria-label="Export format"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
              </select>

              <Button
                size="sm"
                onClick={() => handleExport("all")}
                disabled={exporting || !isOnline}
              >
                {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Export All
              </Button>
              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport("filtered")}
                  disabled={exporting || !isOnline}
                >
                  <Download className="size-4" />
                  Export Filtered
                </Button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/70 px-4 py-2">
              <span className="text-xs font-medium text-slate-500">Active filters:</span>
              {globalFilter && (
                <Badge variant="secondary">
                  Search: {globalFilter}
                  <button
                    type="button"
                    onClick={() => setGlobalFilter("")}
                    className="ml-1 hover:text-slate-900"
                    aria-label="Clear search filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {passFilter.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                  <button
                    type="button"
                    onClick={() => {
                      const next = passFilter.filter((x) => x !== p);
                      setColumnFilters((prev) =>
                        next.length > 0
                          ? [
                              ...prev.filter((f) => f.id !== "pass"),
                              { id: "pass", value: next },
                            ]
                          : prev.filter((f) => f.id !== "pass")
                      );
                    }}
                    className="ml-1 hover:text-slate-900"
                    aria-label={`Remove ${p} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              {yearFilter.map((y) => (
                <Badge key={y} variant="secondary">
                  {y}
                  <button
                    type="button"
                    onClick={() => {
                      const next = yearFilter.filter((x) => x !== y);
                      setColumnFilters((prev) =>
                        next.length > 0
                          ? [
                              ...prev.filter((f) => f.id !== "year"),
                              { id: "year", value: next },
                            ]
                          : prev.filter((f) => f.id !== "year")
                      );
                    }}
                    className="ml-1 hover:text-slate-900"
                    aria-label={`Remove ${y} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
                <RotateCcw className="size-3" />
                Reset Filters
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sortable = SORTABLE_COLUMNS.some((c) => c.id === header.column.id);
                      const sortState = header.column.getIsSorted();
                      return (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap"
                          style={{ width: header.column.columnDef.size }}
                        >
                          {sortable ? (
                            <button
                              type="button"
                              onClick={() => header.column.toggleSorting()}
                              className="inline-flex items-center gap-1 hover:text-indigo-700"
                              aria-label={`Sort by ${header.column.columnDef.header}`}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {sortState === "desc" ? (
                                <span className="text-indigo-600">↓</span>
                              ) : sortState === "asc" ? (
                                <span className="text-indigo-600">↑</span>
                              ) : (
                                <ChevronsUpDown className="size-3.5 text-slate-300" />
                              )}
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      {SORTABLE_COLUMNS.map((col) => (
                        <TableCell key={col.id}>
                          <Skeleton className="h-4 w-full max-w-36" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : visibleRows.length > 0 ? (
                  visibleRows.map((row) => (
                    <TableRow
                      key={row.id}
                      onClick={() => {
                        setDetailMember(row.original);
                        setDetailOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={SORTABLE_COLUMNS.length + 2} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
                          <Search className="size-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">No members found</p>
                        <p className="max-w-sm text-xs text-slate-500">
                          Try adjusting your search or clearing filters to see more results.
                        </p>
                        {hasActiveFilters && (
                          <Button variant="outline" size="sm" onClick={resetFilters}>
                            <RotateCcw className="size-3.5" />
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
              <span className="font-semibold text-slate-900">{pageCount}</span>
              <span className="text-slate-400">
                {" "}
                · {filteredCount} records
                {rows.length > 0 && ` (${rows.length} total)`}
              </span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl">
              <span className="text-sm font-medium">{selectedCount} selected</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => handleExport("selected", selectedIds)}
                disabled={exporting || selectedIds.length === 0}
              >
                <Download className="size-4" />
                Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={selectedIds.length === 0}
              >
                <Delete className="size-4" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-300 hover:bg-white/10"
                onClick={() => setRowSelection({})}
              >
                <X className="size-4" />
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MemberDetailSheet
        member={detailMember}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={(member) => {
          setEditMember(member);
          setEditOpen(true);
        }}
        onDelete={(member) => {
          setDeleteMember(member);
          setDeleteOpen(true);
        }}
      />

      <EditMemberDialog
        member={editMember}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={handleSavedMember}
      />

      <DeleteMemberDialog
        member={deleteMember}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={(id) => handleDeletedMember(id)}
      />

      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900">Delete Selected Members?</h2>
            <p className="mt-1 text-sm text-slate-600">
              You are about to permanently delete{" "}
              <span className="font-semibold">{selectedCount}</span> members. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                {bulkDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
