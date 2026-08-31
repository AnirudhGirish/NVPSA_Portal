"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCheck,
  Clock,
  Inbox,
  Mail,
  MailOpen,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchInquiries,
  updateInquiryStatus,
  deleteInquiry,
  type InquiryRow,
} from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type StatusFilter = "all" | "unread" | "resolved";

function formatRelative(dateStr?: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

const STATUS_BADGES: Record<
  InquiryRow["status"],
  { label: string; className: string }
> = {
  unread: {
    label: "Unread",
    className: "bg-heritage/10 text-heritage-dark border-heritage/20",
  },
  read: {
    label: "Read",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function InquiriesPanel({
  onUnreadChange,
}: {
  onUnreadChange?: (count: number) => void;
}) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { inquiries, unreadCount } = await fetchInquiries();
      setInquiries(inquiries);
      setUnreadCount(unreadCount);
      onUnreadChange?.(unreadCount);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        router.replace("/signin");
        return;
      }
      toast.error("Could not load inquiries");
    } finally {
      setLoading(false);
    }
  }, [router, onUnreadChange]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = inquiries;
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          (i.subject ?? "").toLowerCase().includes(q) ||
          i.message.toLowerCase().includes(q)
      );
    }
    return result;
  }, [inquiries, statusFilter, search]);

  const handleStatusChange = async (
    id: string,
    status: InquiryRow["status"]
  ) => {
    setInquiries((prev) =>
      prev.map((i) => (i._id === id ? { ...i, status } : i))
    );
    try {
      const newUnread = await updateInquiryStatus(id, status);
      setUnreadCount(newUnread);
      onUnreadChange?.(newUnread);
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Could not update status");
      load();
    }
  };

  const handleDelete = async (id: string) => {
    setInquiries((prev) => prev.filter((i) => i._id !== id));
    try {
      const newUnread = await deleteInquiry(id);
      setUnreadCount(newUnread);
      onUnreadChange?.(newUnread);
      toast.success("Inquiry deleted");
    } catch {
      toast.error("Could not delete inquiry");
      load();
    }
  };

  const FILTER_TABS: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: inquiries.length },
    { value: "unread", label: "Unread", count: unreadCount },
    { value: "resolved", label: "Resolved", count: inquiries.filter((i) => i.status === "resolved").length },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-institutional-lg">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 tabular-nums">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="pl-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="mt-3 h-16 w-full" />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((inquiry, i) => {
            const badge = STATUS_BADGES[inquiry.status];
            return (
              <motion.div
                key={inquiry._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.25 }}
                className={`p-5 transition-colors hover:bg-slate-50/60 ${
                  inquiry.status === "unread" ? "border-l-2 border-l-heritage" : ""
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy/5 font-semibold text-navy">
                      {inquiry.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {inquiry.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="inline-flex items-center gap-1 hover:text-navy"
                        >
                          <Mail className="size-3" />
                          {inquiry.email}
                        </a>
                        {inquiry.phone && (
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="inline-flex items-center gap-1 hover:text-navy"
                          >
                            <Phone className="size-3" />
                            {inquiry.phone}
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatRelative(inquiry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-3">
                  <p className="text-sm font-semibold text-navy">
                    {inquiry.subject || "General Inquiry"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {inquiry.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {inquiry.status === "unread" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(inquiry._id, "read")}
                    >
                      <MailOpen className="size-3.5" />
                      Mark as Read
                    </Button>
                  )}
                  {inquiry.status !== "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(inquiry._id, "resolved")}
                    >
                      <CheckCheck className="size-3.5" />
                      Mark Resolved
                    </Button>
                  )}
                  {inquiry.status === "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(inquiry._id, "unread")}
                    >
                      <Mail className="size-3.5" />
                      Reopen
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <a
                        href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject || "General Inquiry")}`}
                      />
                    }
                  >
                    <Mail className="size-3.5" />
                    Reply via Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(inquiry._id)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-slate-100">
              <Inbox className="size-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No inquiries found</p>
            <p className="max-w-sm text-xs text-slate-500">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "New contact form submissions will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
