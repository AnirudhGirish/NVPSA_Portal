import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { PASS_VALUES } from "@/lib/query";
import { requireAdmin } from "@/utils/auth";

const ZERO_STATS = {
  totalAlumni: 0,
  uniqueBatches: 0,
  recentSignups: 0,
  branchBreakdown: Object.fromEntries(PASS_VALUES.map((p) => [p, 0])) as Record<
    string,
    number
  >,
};

export async function GET() {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 7);

    const [total, batchCount, recentCount, passCounts] = await Promise.all([
      Form.countDocuments({}),
      Form.distinct("year").then((years) => years.filter((y) => y).length),
      Form.countDocuments({ createdAt: { $gte: since } }),
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

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalAlumni: total,
          uniqueBatches: batchCount,
          recentSignups: recentCount,
          branchBreakdown,
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
