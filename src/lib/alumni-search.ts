import type { FormRow } from "@/lib/fetch";

/**
 * Client-side alumni search: matches strictly 4 fields and ranks exact
 * Member ID matches first (same behavior as the server-side aggregation).
 */

export function escapeRegexClient(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True when `row` matches `term` in any of:
 * 1. name      — case-insensitive substring
 * 2. email     — case-insensitive substring
 * 3. number    — phone string substring
 * 4. serialNumber — exact integer match when term is numeric
 */
export function matchesAlumniSearch(row: FormRow, term: string): boolean {
  const query = term.trim();
  if (!query) return true;

  const isNumeric = /^\d+$/.test(query);

  if (isNumeric && row.serialNumber === Number(query)) {
    return true;
  }

  const escaped = escapeRegexClient(query);
  const rx = new RegExp(escaped, "i");

  if (rx.test(row.name)) return true;
  if (row.email && rx.test(row.email)) return true;
  if (rx.test(String(row.number))) return true;

  return false;
}

/**
 * Filters rows with `matchesAlumniSearch` and pins exact Member ID matches
 * to the top (when the query is numeric), keeping the input order otherwise.
 */
export function applyAlumniSearch(rows: FormRow[], term: string): FormRow[] {
  const query = term.trim();
  if (!query) return rows;

  const matched = rows.filter((row) => matchesAlumniSearch(row, query));

  if (!/^\d+$/.test(query)) {
    return matched;
  }

  const target = Number(query);
  return [...matched].sort((a, b) => {
    const aExact = a.serialNumber === target ? 0 : 1;
    const bExact = b.serialNumber === target ? 0 : 1;
    return aExact - bExact;
  });
}
