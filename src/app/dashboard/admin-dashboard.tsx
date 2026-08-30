"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  Delete,
  Download,
  Filter,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { fetchForms, type FormRow, type FetchParams } from "@/lib/fetch";
import { useGridUrlState } from "@/hooks/use-grid-url-state";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCards } from "@/components/dashboard/stat-cards";
import {
  MemberDetailSheet,
  EditMemberDialog,
  DeleteMemberDialog,
} from "@/components/dashboard/member-actions";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const PASS_VALUES = ["SSLC", "PUC", "Degree", "Others"];
const YEARS = Array.from({ length: 86 }, (_, i) => 1940 + i);

const ALL_COLUMN_KEYS = ["name", "address", "number", "email", "aadhar", "pass", "year"] as const;
type ColumnKey = (typeof ALL_COLUMN_KEYS)[number];

const DEFAULT_HIDDEN: ColumnKey[] = ["aadhar", "address"];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  name: "Name",
  address: "Address",
  number: "Phone",
  email: "Email",
  aadhar: "Aadhar",
  pass: "Education",
  year: "Year",
};

function SerialCell({ serialNumber }: { serialNumber?: number }) {
  return (
    <span className="font-semibold text-indigo-600 tabular-nums">
      #{serialNumber ?? "—"}
    </span>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const { state, update, isPending } = useGridUrlState();

  const [data, setData] = useState<FormRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(state.search);
  const [debouncedSearch, setDebouncedSearch] = useState(state.search);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_COLUMN_KEYS.map((k) => [k, !DEFAULT_HIDDEN.includes(k)]))
  );

  const [exportFormat, setExportFormat] = useState("csv");
  const [exporting, setExporting] = useState(false);

  const [detailMember, setDetailMember] = useState<FormRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMember, setEditMember] = useState<FormRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteMember, setDeleteMember] = useState<FormRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [matchAllIds, setMatchAllIds] = useState<Set<string> | null>(null);
  const [fetchingMatchIds, setFetchingMatchIds] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    state.search.length > 0 || state.pass.length > 0 || state.year.length > 0 || Boolean(state.yearRange);

  const resetFilters = useCallback(() => {
    update(
      { search: "", pass: [], year: [], yearRange: undefined, page: 1 },
      { resetPage: true }
    );
  }, [update]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    update({ search: debouncedSearch }, { resetPage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const params: FetchParams = {
          page: state.page,
          pageSize: state.pageSize,
          search: state.search,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          pass: state.pass,
          year: state.year,
          yearRange: state.yearRange,
        };
        const result = await fetchForms(params);
        if (cancelled) return;
        setData(result.responses);
        setTotal(result.pagination.total);
        setTotalPages(Math.max(result.pagination.totalPages, 1));
        setRowSelection({});
        setMatchAllIds(null);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          router.replace("/signin");
          return;
        }
        if (err instanceof Error && err.message.startsWith("RATE_LIMITED")) {
          const seconds = err.message.split(":")[1];
          setError(
            seconds
              ? `Rate limited. Please retry after ${seconds} seconds.`
              : "Rate limited. Please retry later."
          );
          return;
        }
        setError(
          err instanceof Error ? err.message : "Failed to fetch data. Please try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [state, router]);

  const columns = useMemo<ColumnDef<FormRow>[]>(() => {
    const base: ColumnDef<FormRow>[] = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "address", header: "Address" },
      { accessorKey: "number", header: "Phone" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "aadhar", header: "Aadhar" },
      { accessorKey: "pass", header: "Education" },
      { accessorKey: "year", header: "Year" },
    ];

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
      enableSorting: false,
      size: 40,
    };

    const serialCol: ColumnDef<FormRow> = {
      id: "memberId",
      header: "Member ID",
      cell: ({ row }) => <SerialCell serialNumber={row.original.serialNumber} />,
      enableSorting: false,
      size: 90,
    };

    return [selectCol, serialCol, ...base];
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row._id ?? String(row.number),
  });

  const selectedIds = useMemo(() => {
    if (matchAllIds) {
      return Array.from(matchAllIds);
    }
    return Object.keys(rowSelection)
      .map((key) => data.find((row) => (row._id ?? String(row.number)) === key)?._id)
      .filter((id): id is string => Boolean(id));
  }, [rowSelection, data, matchAllIds]);

  const selectedCount = matchAllIds
    ? matchAllIds.size
    : Object.keys(rowSelection).length;

  const handleSelectAllMatching = async () => {
    if (matchAllIds) {
      setMatchAllIds(null);
      setRowSelection({});
      return;
    }

    setFetchingMatchIds(true);
    try {
      const query = new URLSearchParams();
      if (state.search) query.set("search", state.search);
      for (const p of state.pass) query.append("pass", p);
      for (const y of state.year) query.append("year", y);
      if (state.yearRange) query.set("yearRange", state.yearRange);

      const response = await fetch(`/api/fetch/ids?${query.toString()}`);
      if (response.status === 401) {
        router.replace("/signin");
        return;
      }
      if (!response.ok) {
        throw new Error("Could not fetch matching ids");
      }
      const result = await response.json();
      setMatchAllIds(new Set(result.ids as string[]));
      toast.success(`Selected all ${result.ids.length} matching members`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not select all matching members");
    } finally {
      setFetchingMatchIds(false);
    }
  };

  const handleSort = (columnId: string) => {
    const isCurrent = state.sortBy === columnId;
    const nextOrder = isCurrent && state.sortOrder === "desc" ? "asc" : "desc";
    update({ sortBy: columnId, sortOrder: nextOrder }, { resetPage: true });
  };

  const handleExport = async (scope: "all" | "filtered" | "selected", ids?: string[]) => {
    setExporting(true);
    try {
      const query = new URLSearchParams({ format: exportFormat, scope });
      if (scope === "filtered") {
        if (state.search) query.set("search", state.search);
        for (const p of state.pass) query.append("pass", p);
        for (const y of state.year) query.append("year", y);
        if (state.yearRange) query.set("yearRange", state.yearRange);
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
      toast.success(`Exported ${scope === "selected" ? "selected members" : scope === "all" ? "all members" : "filtered view"}`);
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
      }
      toast.success(`Deleted ${deletedTotal} members`);
      setBulkDeleteOpen(false);
      setMatchAllIds(null);
      setRowSelection({});
      update({}, { resetPage: true });
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete members");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSavedMember = (updated: FormRow) => {
    setData((prev) => prev.map((row) => (row._id === updated._id ? updated : row)));
  };

  const handleDeletedMember = () => {
    setData((prev) => prev.filter((row) => row._id !== deleteMember?._id));
    setTotal((prev) => Math.max(prev - 1, 0));
  };

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
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <StatCards />

        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/85 shadow-xl shadow-indigo-100/40 backdrop-blur">
          <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                ref={searchInputRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search members..."
                className="pl-8 pr-16"
                aria-label="Search members"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isPending && <Loader2 className="size-3.5 animate-spin text-indigo-500" />}
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
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

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Filter className="size-4" />
                      Graduation Year
                      {state.year.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {state.year.length}
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
                      const selected = state.year.includes(String(year));
                      return (
                        <label
                          key={year}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...state.year, String(year)]
                                : state.year.filter((y) => y !== String(year));
                              update({ year: next }, { resetPage: true });
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
                      {state.pass.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {state.pass.length}
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
                      const selected = state.pass.includes(value);
                      return (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...state.pass, value]
                                : state.pass.filter((p) => p !== value);
                              update({ pass: next }, { resetPage: true });
                            }}
                          />
                          {value}
                        </label>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Columns3 className="size-4" />
                      Columns
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {ALL_COLUMN_KEYS.map((key) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={Boolean(columnVisibility[key])}
                      onCheckedChange={(checked) => {
                        table.getColumn(key)?.toggleVisibility(checked);
                      }}
                    >
                      {COLUMN_LABELS[key]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={String(state.pageSize)}
                onValueChange={(value) => {
                  if (value) update({ pageSize: Number(value) }, { resetPage: true });
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={exportFormat}
                onValueChange={(value) => {
                  if (value) setExportFormat(value);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>

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
              {state.search && (
                <Badge variant="secondary">
                  Search: {state.search}
                  <button
                    type="button"
                    onClick={() => update({ search: "" }, { resetPage: true })}
                    className="ml-1 hover:text-slate-900"
                    aria-label="Clear search filter"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {state.pass.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                  <button
                    type="button"
                    onClick={() =>
                      update({ pass: state.pass.filter((x) => x !== p) }, { resetPage: true })
                    }
                    className="ml-1 hover:text-slate-900"
                    aria-label={`Remove ${p} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              {state.year.map((y) => (
                <Badge key={y} variant="secondary">
                  {y}
                  <button
                    type="button"
                    onClick={() =>
                      update({ year: state.year.filter((x) => x !== y) }, { resetPage: true })
                    }
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
                      const canSort = header.column.getCanSort();
                      const isSorted = header.column.getIsSorted();
                      return (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap"
                          style={{ width: header.column.columnDef.size }}
                        >
                          {canSort ? (
                            <button
                              type="button"
                              onClick={() => handleSort(header.column.id)}
                              className="inline-flex items-center gap-1 hover:text-indigo-700"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {isSorted ? (
                                <span className="text-indigo-600">
                                  {isSorted === "desc" ? "↓" : "↑"}
                                </span>
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
                      <TableCell>
                        <Skeleton className="h-4 w-6" />
                      </TableCell>
                      {ALL_COLUMN_KEYS.map((key) => (
                        <TableCell key={key}>
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
                        <TableCell key={cell.id} onClick={undefined}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={ALL_COLUMN_KEYS.length + 2} className="h-48 text-center">
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
              Page <span className="font-semibold text-slate-900">{state.page}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
              <span className="text-slate-400"> · {total} records</span>
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => update({ page: state.page - 1 })}
                disabled={state.page <= 1 || loading}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => update({ page: state.page + 1 })}
                disabled={state.page >= totalPages || loading}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {Object.keys(rowSelection).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl">
              <span className="text-sm font-medium">{selectedCount} selected</span>
              {matchAllIds ? (
                <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-xs text-indigo-200">
                  All matching results
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-300 hover:bg-white/10"
                  onClick={handleSelectAllMatching}
                  disabled={fetchingMatchIds || total === 0}
                >
                  {fetchingMatchIds ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Select all {total}
                </Button>
              )}
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
                onClick={() => {
                  setRowSelection({});
                  setMatchAllIds(null);
                }}
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
        onDeleted={handleDeletedMember}
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

      {error && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-xl">
          {error}
        </div>
      )}
    </div>
  );
}
