import type { FilterQuery } from "mongoose";
import { Form } from "@/models/form.model";

export const SORTABLE_COLUMNS = ["serialNumber", "name", "number", "email", "address", "pass", "year", "createdAt"] as const;
export type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export const PASS_VALUES = ["SSLC", "PUC", "Degree", "Others"] as const;
export type PassValue = (typeof PASS_VALUES)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

export function isPassValue(value: string): value is PassValue {
  return (PASS_VALUES as readonly string[]).includes(value);
}

/**
 * Escapes RegExp metacharacters in user input so a search term can never
 * be used for ReDoS or NoSQL injection via regex operators.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export interface FormFilterParams {
  search?: string;
  pass?: PassValue | PassValue[];
  year?: string | string[];
  yearRange?: string;
}

export function buildFormFilter(params: FormFilterParams): FilterQuery<typeof Form> {
  const filter: FilterQuery<typeof Form> = {};

  if (params.search) {
    const term = escapeRegex(params.search);
    const rx = new RegExp(term, "i");
    filter.$or = [
      { name: rx },
      { email: rx },
      { address: rx },
      { aadhar: rx },
      { year: rx },
      { pass: rx },
    ];
  }

  if (params.pass) {
    const values = Array.isArray(params.pass) ? params.pass : [params.pass];
    filter.pass = { $in: values };
  }

  if (params.year && params.year.length > 0) {
    const years = Array.isArray(params.year) ? params.year : [params.year];
    filter.year = { $in: years };
  }

  if (params.yearRange) {
    const [min, max] = params.yearRange.split("-").map(Number);
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) {
      const range = { $gte: String(min), $lte: String(max) } as Record<string, unknown>;
      filter.year = { ...(filter.year as object), ...range } as FilterQuery<typeof Form>["year"];
    }
  }

  return filter;
}

/**
 * Guards CSV cells against formula injection: cells starting with = + - @
 * (and tab/CR variants) get a leading apostrophe.
 */
export function sanitizeCsvCell(value: unknown): unknown {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return value;
  }
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

export interface SanitizedFormRow {
  serialNumber: number;
  name: string;
  number: number;
  email: string;
  address: string;
  aadhar: string;
  pass: string;
  year: string;
}

export function sanitizeFormRow(row: Record<string, unknown>): SanitizedFormRow {
  return {
    serialNumber: Number(row.serialNumber),
    name: sanitizeCsvCell(row.name) as string,
    number: Number(row.number),
    email: sanitizeCsvCell(row.email) as string,
    address: sanitizeCsvCell(row.address) as string,
    aadhar: sanitizeCsvCell(row.aadhar) as string,
    pass: sanitizeCsvCell(row.pass) as string,
    year: sanitizeCsvCell(row.year) as string,
  };
}
