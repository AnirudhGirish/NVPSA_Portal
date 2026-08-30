"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  GraduationCap,
  RotateCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import { fetchStats, type DashboardStats } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const METRICS = [
  { key: "totalAlumni", label: "Total Registered Alumni", icon: Users },
  { key: "uniqueBatches", label: "Unique Batches Represented", icon: GraduationCap },
  { key: "recentSignups7d", label: "Recent Signups (Last 7 Days)", icon: TrendingUp },
] as const;

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  delay,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  loading: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10">
            <Icon className="size-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
            <p className="truncate text-xs text-slate-500">{label}</p>
          </div>
        </CardContent>
      </Card>
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
  const recent30d = stats?.recentSignups30d ?? 0;
  const coverage = stats?.contactCoverage;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {METRICS.map(({ key, label, icon }, index) => (
        <StatCard
          key={key}
          icon={icon}
          label={label}
          value={loading ? "—" : String((stats?.[key] as number) ?? 0)}
          loading={loading}
          delay={index * 0.06}
        />
      ))}

      <StatCard
        icon={TrendingUp}
        label={`Signups in Last 30 Days (${recent30d} total)`}
        value={loading ? "—" : `${recent30d}`}
        loading={loading}
        delay={0.18}
      />

      <StatCard
        icon={CalendarDays}
        label="Contact Coverage"
        value={loading ? "—" : `${coverage?.percentage ?? 0}%`}
        loading={loading}
        delay={0.24}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="sm:col-span-2"
      >
        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-700">Era Breakdown</p>
            {loading ? (
              <div className="mt-3 space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-4 w-full max-w-xs" />
                ))}
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {stats?.eraBreakdown?.map((era) => {
                  const max = Math.max(...(stats.eraBreakdown?.map((e) => e.count) ?? [1]), 1);
                  return (
                    <div key={era.label} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs text-slate-600">{era.label}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(era.count / max) * 100}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-indigo-500"
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-900">
                        {era.count}
                      </span>
                    </div>
                  );
                }) ?? null}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.3 }}
        className="sm:col-span-2"
      >
        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10">
              <GraduationCap className="size-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">Branch Breakdown</p>
              {loading ? (
                <div className="mt-2 space-y-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-3 w-full max-w-xs" />
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(stats?.branchBreakdown ?? {}).map(([branch, count]) => (
                    <span
                      key={branch}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100"
                    >
                      {branch}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {statsError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:col-span-2 xl:col-span-4"
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
