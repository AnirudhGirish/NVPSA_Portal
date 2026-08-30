import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { requireAdmin } from "@/utils/auth";
import { buildFormFilter, isPassValue } from "@/lib/query";

const MAX_IDS = 5000;

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() ?? undefined;
  const pass = searchParams.getAll("pass").filter(isPassValue);
  const year = searchParams.getAll("year").filter((y) => /^\d{4}$/.test(y));
  const yearRangeRaw = searchParams.get("yearRange") ?? "";
  const yearRange = /^\d{4}-\d{4}$/.test(yearRangeRaw) ? yearRangeRaw : undefined;

  try {
    const filter = buildFormFilter({ search, pass, year, yearRange });
    const rows = await Form.find(filter).select("_id").limit(MAX_IDS).lean();
    return NextResponse.json(
      {
        success: true,
        ids: rows.map((row) => String(row._id)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching matching ids", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch matching ids" },
      { status: 500 }
    );
  }
}
