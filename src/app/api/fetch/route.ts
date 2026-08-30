import { NextResponse } from "next/server";
import type { FilterQuery } from "mongoose";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import {
  buildFormFilter,
  clampInt,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  escapeRegex,
  isPassValue,
  type PassValue,
} from "@/lib/query";
import { requireAdmin } from "@/utils/auth";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Whitelisted sort field mapping. Accepts UI column ids and friendly
 * aliases (phone / education) and maps them to real document fields.
 * Anything unknown falls back to serialNumber.
 */
const SORT_FIELD_MAP: Record<string, string> = {
  serialNumber: "serialNumber",
  name: "name",
  phone: "number",
  number: "number",
  email: "email",
  education: "pass",
  pass: "pass",
  year: "year",
  address: "address",
  aadhar: "aadhar",
  createdAt: "createdAt",
};

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

  const sortByRaw = searchParams.get("sortBy") ?? "serialNumber";
  const sortField = SORT_FIELD_MAP[sortByRaw] ?? "serialNumber";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const passRaw = searchParams.getAll("pass").filter(isPassValue);
  const pass = passRaw.length > 0 ? (passRaw as PassValue[]) : undefined;

  const yearRaw = searchParams.getAll("year").filter((y) => /^\d{4}$/.test(y));
  const year = yearRaw.length > 0 ? yearRaw : undefined;

  const yearRangeRaw = searchParams.get("yearRange") ?? "";
  const yearRange = /^\d{4}-\d{4}$/.test(yearRangeRaw) ? yearRangeRaw : undefined;

  // Cached mode: the dashboard requests the complete dataset once and then
  // performs search/filter/sort/pagination fully client-side.
  const allMode = searchParams.get("all") === "true";

  try {
    const filter: FilterQuery<typeof Form> = buildFormFilter({ pass, year, yearRange });

    const isNumeric = /^\d+$/.test(search);
    const numVal = isNumeric ? Number(search) : null;

    if (search) {
      const sanitized = escapeRegex(search);
      // Strictly 4 searchable fields: name, email, phone number, member ID.
      const orConditions: FilterQuery<typeof Form>[] = [
        { name: { $regex: sanitized, $options: "i" } },
        { email: { $regex: sanitized, $options: "i" } },
        // Phones are stored as Numbers; convert to string inside the query
        // so partial phone searches (e.g. "9880") match.
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$number" },
              regex: sanitized,
            },
          },
        } as FilterQuery<typeof Form>,
      ];

      if (isNumeric && numVal !== null) {
        // Exact Member ID match (#3 → serialNumber: 3).
        orConditions.push({ serialNumber: numVal });
      }

      filter.$or = orConditions;
    }

    const [responses, total] = await Promise.all([
      allMode
        ? Form.find(filter)
            .sort({ serialNumber: -1, _id: 1 })
            .lean()
        : isNumeric && numVal !== null
          ? Form.aggregate([
              { $match: filter },
              {
                $addFields: {
                  _exactSerialMatch: {
                    $cond: [{ $eq: ["$serialNumber", numVal] }, 0, 1],
                  },
                },
              },
              { $sort: { _exactSerialMatch: 1, [sortField]: sortOrder, _id: 1 } },
              { $skip: (page - 1) * pageSize },
              { $limit: pageSize },
              { $unset: "_exactSerialMatch" },
            ])
          : Form.find(filter)
              .sort({ [sortField]: sortOrder, _id: 1 })
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
        pagination: {
          page: allMode ? 1 : page,
          pageSize: allMode ? Math.max(total, 1) : pageSize,
          total,
          totalPages: allMode ? 1 : Math.max(Math.ceil(total / pageSize), 1),
        },
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
