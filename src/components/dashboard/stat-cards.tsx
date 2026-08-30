"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  RotateCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import { fetchStats, type DashboardStats } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_STATS: DashboardStats = {
  totalAlumni: 0,
  uniqueBatches: 0,
  recentSignups7d: 0,
  recentSignups30d: 0,
  contactCoverage: { withContact: 0, total: 0, percentage: 0 },
  branchBreakdown: {},
  eraBreakdown: [],
};

const BRANCH_COLORS: Record<string, string> = {
  SSLC: "bg-cobalt text-white",
  Degree: "bg-navy text-white",
  PUC: "bg-heritage text-white",
  Others: "bg-slate-500 text-white",
};

function MetricCard({
  icon: Icon,
  value,
  label,
  subBadge,
  loading,
  delay,
}: {
  icon: typeof Users;
  value: string;
  label: string;
  subBadge: string;
  loading: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/5">
          <Icon className="size-5 text-navy" />
        </div>
        <div className="mt-3">
          {loading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <p className="text-3xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {value}
            </p>
          )}
          <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
        </div>
        <p className="mt-2 text-[11px] font-medium text-slate-400">{subBadge}</p>
      </div>
    </motion.div>
  );
}

export function StatCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(() => {
    let cancelled = false;
    setStatsError(false);
    setStats(null);
    fetchStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) {
          setStats(EMPTY_STATS);
          setStatsError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load, reloadKey]);

  const loading = stats === null;
  const total = stats?.totalAlumni ?? 0;
  const coveragePct = stats?.contactCoverage?.percentage ?? 0;
  const recent30d = stats?.recentSignups30d ?? 0;
  const recent7d = stats?.recentSignups7d ?? 0;

  const eraMax = Math.max(...(stats?.eraBreakdown?.map((e) => e.count) ?? [1]), 1);
  const branchEntries = Object.entries(stats?.branchBreakdown ?? {});
  const branchTotal = branchEntries.reduce((sum, [, c]) => sum + c, 0) || 1;

  return (
    <div className="space-y-4">
      {/* ─── Row 1: Primary Metrics (4 equal columns) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          value={loading ? "—" : String(total)}
          label="Total Registered Alumni"
          subBadge="100% Verified Members"
          loading={loading}
          delay={0}
        />
        <MetricCard
          icon={GraduationCap}
          value={loading ? "—" : String(stats?.uniqueBatches ?? 0)}
          label="Graduation Batches"
          subBadge="1950s – Present"
          loading={loading}
          delay={0.06}
        />
        <MetricCard
          icon={CheckCircle2}
          value={loading ? "—" : `${coveragePct}%`}
          label="Contact Reachability"
          subBadge="Phone & Email verified"
          loading={loading}
          delay={0.12}
        />
        <MetricCard
          icon={TrendingUp}
          value={loading ? "—" : String(recent30d)}
          label="New Registrations (30d)"
          subBadge={`Last 7 days: ${recent7d}`}
          loading={loading}
          delay={0.18}
        />
      </div>

      {/* ─── Row 2: Deep Analytics (2 equal columns) ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Panel: Era & Decade Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
        >
          <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange className="size-4 text-navy" />
              <h3 className="text-sm font-semibold text-navy">Alumni by Era</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                {stats?.eraBreakdown?.map((era, i) => {
                  const pct = total > 0 ? Math.round((era.count / total) * 1000) / 10 : 0;
                  const isUnclassified = era.label.includes("Unknown") || era.label.includes("Pre");
                  return (
                    <div key={era.label} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs text-slate-600">
                        {era.label}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max((era.count / eraMax) * 100, 2)}%` }}
                          transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${isUnclassified ? "bg-slate-400" : "bg-navy"}`}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-slate-700">
                        {era.count}
                      </span>
                      <span className="w-10 shrink-0 text-right font-mono text-[11px] text-slate-400">
                        {pct}%
                      </span>
                    </div>
                  );
                }) ?? null}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Panel: Program & Branch Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Award className="size-4 text-navy" />
              <h3 className="text-sm font-semibold text-navy">Academic Program Breakdown</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                {branchEntries.map(([branch, count], i) => {
                  const pct = Math.round((count / branchTotal) * 1000) / 10;
                  const max = Math.max(...branchEntries.map(([, c]) => c), 1);
                  return (
                    <div key={branch} className="flex items-center gap-3">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold ${BRANCH_COLORS[branch] ?? "bg-slate-400 text-white"}`}
                      >
                        {branch.charAt(0)}
                      </span>
                      <span className="w-20 shrink-0 text-xs font-medium text-slate-600">
                        {branch}
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max((count / max) * 100, 2)}%` }}
                          transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-navy"
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono text-xs font-semibold tabular-nums text-slate-700">
                        {count}
                      </span>
                      <span className="w-10 shrink-0 text-right font-mono text-[11px] text-slate-400">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[11px] text-slate-400">
              Aggregated across all verified historical entries.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Error retry */}
      {statsError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              Could not load dashboard statistics.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
