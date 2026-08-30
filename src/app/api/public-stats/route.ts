import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";

/**
 * Public-safe statistics for the landing page counter ribbon.
 * Returns only aggregate counts — no PII, no auth required.
 */
export async function GET() {
  await connectDB();

  try {
    const [total, batches] = await Promise.all([
      Form.countDocuments({}),
      Form.distinct("year").then((years) => years.filter((y) => y).length),
    ]);

    return NextResponse.json(
      { success: true, totalAlumni: total, uniqueBatches: batches },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error computing public stats:", error);
    return NextResponse.json(
      { success: true, totalAlumni: 0, uniqueBatches: 0, degraded: true },
      { status: 200 }
    );
  }
}
