"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAllForms, type FormRow } from "@/lib/fetch";

const CACHE_KEY = "nvpsa_alumni_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ROWS = 2000;

interface CachePayload {
  timestamp: number;
  rows: FormRow[];
}

interface AlumniCacheState {
  rows: FormRow[];
  /** Date the current dataset was fetched (cache hit keeps the original time). */
  updatedAt: Date | null;
  loading: boolean;
  /** True when served from a fresh sessionStorage cache (0ms load). */
  fromCache: boolean;
  sync: () => Promise<void>;
  updateRow: (updated: FormRow) => void;
  removeRow: (id: string) => void;
}

function readCache(): CachePayload | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachePayload;
    if (
      typeof parsed.timestamp !== "number" ||
      !Array.isArray(parsed.rows) ||
      Date.now() - parsed.timestamp > CACHE_TTL_MS
    ) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rows: FormRow[]): void {
  try {
    if (rows.length > MAX_CACHE_ROWS) {
      sessionStorage.removeItem(CACHE_KEY);
      return;
    }
    const payload: CachePayload = { timestamp: Date.now(), rows };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage may be unavailable (private mode / quota) — degrade silently.
  }
}

export function useAlumniCache(): AlumniCacheState {
  const [rows, setRows] = useState<FormRow[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const rowsRef = useRef<FormRow[]>([]);

  rowsRef.current = rows;

  const load = useCallback(async () => {
    setLoading(true);

    const cached = readCache();
    if (cached) {
      setRows(cached.rows);
      setUpdatedAt(new Date(cached.timestamp));
      setFromCache(true);
      setLoading(false);
      return;
    }

    try {
      const fresh = await fetchAllForms();
      setRows(fresh);
      setUpdatedAt(new Date());
      setFromCache(false);
      writeCache(fresh);
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        window.location.replace("/signin");
        return;
      }
      console.error("Failed to load alumni data:", error);
      setRows([]);
      setUpdatedAt(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sync = useCallback(async () => {
    sessionStorage.removeItem(CACHE_KEY);
    await load();
  }, [load]);

  /** Optimistically update one row in memory and in sessionStorage. */
  const updateRow = useCallback((updated: FormRow) => {
    setRows((prev) => {
      const id = updated._id ?? String(updated.number);
      const next = prev.map((row) =>
        (row._id ?? String(row.number)) === id ? { ...row, ...updated } : row
      );
      writeCache(next);
      return next;
    });
  }, []);

  /** Optimistically remove one row from memory and sessionStorage. */
  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      const next = prev.filter((row) => row._id !== id);
      writeCache(next);
      return next;
    });
  }, []);

  return { rows, updatedAt, loading, fromCache, sync, updateRow, removeRow };
}
