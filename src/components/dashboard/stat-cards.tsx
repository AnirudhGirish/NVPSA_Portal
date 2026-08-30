"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, GraduationCap, RotateCcw, TrendingUp, Users } from "lucide-react";
import { fetchStats, type DashboardStats } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_STATS: DashboardStats = {
  totalAlumni: 0,
  uniqueBatches: 0,
  recentSignups: 0,
  branchBreakdown: {},
};

const METRICS = [
  { key: "totalAlumni", label: "Total Registered Alumni", icon: Users },
  { key: "uniqueBatches", label: "Unique Batches Represented", icon: GraduationCap },
  { key: "recentSignups", label: "Recent Signups (Last 7 Days)", icon: TrendingUp },
] as const;

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {METRICS.map(({ key, label, icon: Icon }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.3 }}
        >
          <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10">
                <Icon className="size-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                {stats === null ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900">
                    {stats[key as keyof DashboardStats] as number}
                  </p>
                )}
                <p className="truncate text-xs text-slate-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.3 }}
        className="sm:col-span-3"
      >
        <Card className="border-slate-200/70 bg-white/80 shadow-sm backdrop-blur">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10">
              <CalendarDays className="size-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">Branch Breakdown</p>
              {stats === null ? (
                <div className="mt-2 space-y-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-3 w-full max-w-xs" />
                  ))}
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(stats.branchBreakdown).map(([branch, count]) => (
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
          className="sm:col-span-3"
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
