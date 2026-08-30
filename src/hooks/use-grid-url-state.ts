"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export interface GridQueryState {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  pass: string[];
  year: string[];
  yearRange?: string;
}

export function parseGridQuery(searchParams: URLSearchParams): GridQueryState {
  const page = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);
  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "50");
  const pageSize = [10, 25, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 50;
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "serialNumber";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const pass = searchParams.getAll("pass");
  const year = searchParams.getAll("year");
  const yearRange = searchParams.get("yearRange") ?? undefined;

  return { page, pageSize, search, sortBy, sortOrder, pass, year, yearRange };
}

export function useGridUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state = useMemo(() => parseGridQuery(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<GridQueryState>, opts?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      const next = { ...state, ...patch };

      if (opts?.resetPage) {
        next.page = 1;
      }

      params.set("page", String(next.page));
      params.set("pageSize", String(next.pageSize));
      if (next.search) params.set("search", next.search);
      else params.delete("search");
      params.set("sortBy", next.sortBy);
      params.set("sortOrder", next.sortOrder);
      params.delete("pass");
      for (const p of next.pass) params.append("pass", p);
      params.delete("year");
      for (const y of next.year) params.append("year", y);
      if (next.yearRange) params.set("yearRange", next.yearRange);
      else params.delete("yearRange");

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    },
    [router, pathname, searchParams, state]
  );

  return { state, update, isPending };
}
