import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { requireAdmin } from "@/utils/auth";
import { buildFormFilter, sanitizeFormRow, isPassValue } from "@/lib/query";

const EXCEL_COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: "Member ID", key: "serialNumber", width: 12 },
  { header: "Name", key: "name", width: 24 },
  { header: "Phone", key: "number", width: 16 },
  { header: "Email", key: "email", width: 28 },
  { header: "Address", key: "address", width: 36 },
  { header: "Aadhar", key: "aadhar", width: 18 },
  { header: "Education", key: "pass", width: 14 },
  { header: "Year", key: "year", width: 10 },
];

export async function GET(req: Request) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");
  const scope = searchParams.get("scope") ?? "all";

  if (format !== "csv" && format !== "xlsx") {
    return NextResponse.json(
      { success: false, message: "Invalid format. Use format=csv or format=xlsx" },
      { status: 400 }
    );
  }

  try {
    let rows: Record<string, unknown>[];

    if (scope === "selected") {
      const ids = searchParams.getAll("id").filter((id) => isValidObjectId(id));
      if (ids.length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid member ids provided" },
          { status: 400 }
        );
      }
      rows = await Form.find({ _id: { $in: ids } }).lean();
    } else {
      const filter =
        scope === "filtered"
          ? buildFormFilter({
              search: searchParams.get("search")?.trim() ?? undefined,
              pass: searchParams.getAll("pass").filter(isPassValue),
              year: searchParams.getAll("year"),
              yearRange: searchParams.get("yearRange") ?? undefined,
            })
          : {};

      rows = await Form.find(filter).sort({ createdAt: -1 }).lean();
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "No data to export" },
        { status: 400 }
      );
    }

    const cleanRows = rows.map((row) => sanitizeFormRow(row as Record<string, unknown>));

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "NVPSA Portal";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Members", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    worksheet.columns = EXCEL_COLUMNS;

    cleanRows.forEach((row) => {
      worksheet.addRow(row);
    });

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF312E81" },
    };
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: EXCEL_COLUMNS.length },
    };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          const colIndex = Number(cell.col);
          if (colIndex === 3) {
            cell.numFmt = "0000000000";
          }
          if (rowNumber % 2 === 0) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
          }
        });
      }
    });

    if (format === "csv") {
      const buffer = await workbook.csv.writeBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="forms.csv"',
        },
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="forms.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error exporting forms:", error);
    return NextResponse.json({ success: false, message: "Export failed" }, { status: 500 });
  }
}
