import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import {
  buildFormFilter,
  clampInt,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  SORTABLE_COLUMNS,
  SORT_ORDERS,
  isPassValue,
  type PassValue,
  type SortableColumn,
  type SortOrder,
} from "@/lib/query";
import { requireAdmin } from "@/utils/auth";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export async function GET(req: Request) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const pageParam = Number(searchParams.get("page") ?? "1");
  const pageSizeParam = Number(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeParam)
    ? pageSizeParam
    : clampInt(pageSizeParam, 1, MAX_PAGE_SIZE);

  const search = searchParams.get("search")?.trim().slice(0, 200) ?? "";

  const sortByRaw = (searchParams.get("sortBy") ?? "createdAt") as string;
  const sortBy = (SORTABLE_COLUMNS as readonly string[]).includes(sortByRaw)
    ? (sortByRaw as SortableColumn)
    : "createdAt";

  const sortOrderRaw = (searchParams.get("sortOrder") ?? "desc") as string;
  const sortOrder = (SORT_ORDERS as readonly string[]).includes(sortOrderRaw)
    ? (sortOrderRaw as SortOrder)
    : "desc";

  const passRaw = searchParams.getAll("pass").filter(isPassValue);
  const pass = passRaw.length > 0 ? (passRaw as PassValue[]) : undefined;

  const yearRaw = searchParams.getAll("year").filter((y) => /^\d{4}$/.test(y));
  const year = yearRaw.length > 0 ? yearRaw : undefined;

  const yearRangeRaw = searchParams.get("yearRange") ?? "";
  const yearRange = /^\d{4}-\d{4}$/.test(yearRangeRaw) ? yearRangeRaw : undefined;

  try {
    const filter = buildFormFilter({ search, pass, year, yearRange });

    // Numeric search: if the term is a pure integer, also match serialNumber exactly.
    const numericSearch = /^\d+$/.test(search) ? Number(search) : null;
    if (numericSearch !== null) {
      const serialMatch = { serialNumber: numericSearch };
      filter.$or = filter.$or ? [...(filter.$or as object[]), serialMatch] : [serialMatch];
    }

    const [responses, total] = await Promise.all([
      Form.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Form.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Data Fetching Successfull!!",
        responses,
        pagination: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data", error);
    return NextResponse.json(
      { success: false, message: "Data Fetching Failed!! Internal Server Error" },
      { status: 500 }
    );
  }
}
