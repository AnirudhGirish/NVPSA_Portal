import type { PassCategory } from "@/types";

export interface FormRow {
  _id?: string;
  serialNumber?: number;
  name: string;
  number: number;
  email?: string;
  address: string;
  aadhar?: string;
  pass?: PassCategory | "";
  year?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse {
  success: boolean;
  message: string;
  responses: FormRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface EraBreakdownItem {
  label: string;
  count: number;
}

export interface DashboardStats {
  totalAlumni: number;
  uniqueBatches: number;
  recentSignups7d: number;
  recentSignups30d: number;
  contactCoverage: { withContact: number; total: number; percentage: number };
  branchBreakdown: Record<string, number>;
  eraBreakdown: EraBreakdownItem[];
}

export interface FetchParams {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  pass?: string[];
  year?: string[];
  yearRange?: string;
}

export async function fetchForms(params: FetchParams): Promise<PaginatedResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  for (const p of params.pass ?? []) query.append("pass", p);
  for (const y of params.year ?? []) query.append("year", y);
  if (params.yearRange) query.set("yearRange", params.yearRange);

  const response = await fetch(`/api/fetch?${query.toString()}`, { cache: "no-store" });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new Error(
      retryAfter
        ? `RATE_LIMITED:${retryAfter}`
        : "RATE_LIMITED"
    );
  }

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await response.json();
  if (!Array.isArray(result.responses)) {
    throw new Error("Invalid data format");
  }
  return result as PaginatedResponse;
}

export async function fetchAllForms(): Promise<FormRow[]> {
  const response = await fetch("/api/fetch?all=true", { cache: "no-store" });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const result = await response.json();
  if (!Array.isArray(result.responses)) {
    throw new Error("Invalid data format");
  }
  return result.responses as FormRow[];
}

export async function fetchStats(): Promise<DashboardStats> {
  const response = await fetch("/api/stats", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  const result = await response.json();
  return result.stats as DashboardStats;
}

export interface InquiryRow {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: "unread" | "read" | "resolved";
  createdAt?: string;
  updatedAt?: string;
}

export async function submitInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Submission failed");
  }
}

export async function fetchInquiries(): Promise<{
  inquiries: InquiryRow[];
  unreadCount: number;
}> {
  const response = await fetch("/api/admin/inquiries", { cache: "no-store" });
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    throw new Error("Failed to fetch inquiries");
  }
  const result = await response.json();
  return { inquiries: result.inquiries as InquiryRow[], unreadCount: result.unreadCount as number };
}

export async function updateInquiryStatus(
  id: string,
  status: "unread" | "read" | "resolved"
): Promise<number> {
  const response = await fetch("/api/admin/inquiries", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  if (!response.ok) {
    throw new Error("Could not update inquiry");
  }
  const result = await response.json();
  return result.unreadCount as number;
}

export async function deleteInquiry(id: string): Promise<number> {
  const response = await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Could not delete inquiry");
  }
  const result = await response.json();
  return result.unreadCount as number;
}

export async function checkPhoneExists(number: string): Promise<boolean> {
  const response = await fetch(`/api/form/check?number=${encodeURIComponent(number)}`);
  if (!response.ok) {
    throw new Error("Could not verify phone number");
  }
  const result = await response.json();
  return Boolean(result.exists);
}

export async function deleteMember(id: string): Promise<void> {
  const response = await fetch(`/api/members/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Could not delete member");
  }
}

export async function bulkDeleteMembers(ids: string[]): Promise<number> {
  const response = await fetch("/api/members/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Could not delete members");
  }
  const result = await response.json();
  return result.deletedCount as number;
}

export function buildExportUrl(params: {
  format: string;
  scope: "all" | "filtered" | "selected";
  search?: string;
  pass?: string[];
  year?: string[];
  yearRange?: string;
  ids?: string[];
}): string {
  const query = new URLSearchParams({ format: params.format, scope: params.scope });
  if (params.search) query.set("search", params.search);
  for (const p of params.pass ?? []) query.append("pass", p);
  for (const y of params.year ?? []) query.append("year", y);
  if (params.yearRange) query.set("yearRange", params.yearRange);
  for (const id of params.ids ?? []) query.append("id", id);
  return `/api/export?${query.toString()}`;
}

export async function downloadExport(url: string, fallbackName: string): Promise<void> {
  const response = await fetch(url);
  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Export failed");
  }
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(objectUrl);
}
