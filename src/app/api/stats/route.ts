import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { PASS_VALUES } from "@/lib/query";
import { requireAdmin } from "@/utils/auth";

export interface EraBreakdown {
  label: string;
  count: number;
}

const ZERO_STATS = {
  totalAlumni: 0,
  uniqueBatches: 0,
  recentSignups7d: 0,
  recentSignups30d: 0,
  contactCoverage: { withContact: 0, total: 0, percentage: 0 },
  branchBreakdown: Object.fromEntries(PASS_VALUES.map((p) => [p, 0])) as Record<
    string,
    number
  >,
  eraBreakdown: [] as EraBreakdown[],
};

const ERA_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "1950s–1970s", min: 1950, max: 1979 },
  { label: "1980s–1990s", min: 1980, max: 1999 },
  { label: "2000s–Present", min: 2000, max: 2100 },
];

function bucketYear(yearValue: unknown): string | null {
  const year = Number(yearValue);
  if (!Number.isFinite(year)) return null;
  const bucket = ERA_BUCKETS.find((b) => year >= b.min && year <= b.max);
  return bucket?.label ?? null;
}

export async function GET() {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const since7d = new Date();
    since7d.setUTCDate(since7d.getUTCDate() - 7);
    const since30d = new Date();
    since30d.setUTCDate(since30d.getUTCDate() - 30);

    const [total, batchCount, recent7d, recent30d, withContact, yearCounts, passCounts] =
      await Promise.all([
        Form.countDocuments({}),
        Form.distinct("year").then((years) => years.filter((y) => y).length),
        Form.countDocuments({ createdAt: { $gte: since7d } }),
        Form.countDocuments({ createdAt: { $gte: since30d } }),
        Form.countDocuments({ email: { $type: "string", $ne: "" }, number: { $type: "number" } }),
        Form.aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$year", count: { $sum: 1 } } },
        ]),
        Form.aggregate<{ _id: string; count: number }>([
          { $match: { pass: { $in: [...PASS_VALUES] } } },
          { $group: { _id: "$pass", count: { $sum: 1 } } },
        ]),
      ]);

    const branchBreakdown = Object.fromEntries(
      PASS_VALUES.map((p) => [p, 0])
    ) as Record<string, number>;

    for (const item of passCounts) {
      branchBreakdown[item._id] = item.count;
    }

    const eraCounts = new Map<string, number>();
    for (const bucket of ERA_BUCKETS) {
      eraCounts.set(bucket.label, 0);
    }
    let unassignedEraCount = 0;
    for (const item of yearCounts) {
      const label = bucketYear(item._id);
      if (label) {
        eraCounts.set(label, (eraCounts.get(label) ?? 0) + item.count);
      } else {
        unassignedEraCount += item.count;
      }
    }

    const eraBreakdown: EraBreakdown[] = [
      ...ERA_BUCKETS.map((bucket) => ({
        label: bucket.label,
        count: eraCounts.get(bucket.label) ?? 0,
      })),
    ];
    if (unassignedEraCount > 0) {
      eraBreakdown.push({ label: "Unknown / Pre-1950", count: unassignedEraCount });
    }

    const contactCoverage = {
      withContact: withContact,
      total,
      percentage: total > 0 ? Math.round((withContact / total) * 1000) / 10 : 0,
    };

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalAlumni: total,
          uniqueBatches: batchCount,
          recentSignups7d: recent7d,
          recentSignups30d: recent30d,
          contactCoverage,
          branchBreakdown,
          eraBreakdown,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error computing stats, returning zero-value fallback:", error);
    return NextResponse.json(
      { success: true, stats: ZERO_STATS, degraded: true },
      { status: 200 }
    );
  }
}
