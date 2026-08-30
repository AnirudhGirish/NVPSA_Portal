import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { requireAdmin } from "@/utils/auth";

const MAX_BULK_DELETE = 500;

export async function POST(req: Request) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const { ids } = (body ?? {}) as { ids?: unknown };
  if (!Array.isArray(ids)) {
    return NextResponse.json({ success: false, message: "ids must be an array" }, { status: 400 });
  }

  const validIds = ids.filter((id): id is string => typeof id === "string" && isValidObjectId(id));
  if (validIds.length === 0) {
    return NextResponse.json({ success: false, message: "No valid ids provided" }, { status: 400 });
  }
  if (validIds.length > MAX_BULK_DELETE) {
    return NextResponse.json(
      { success: false, message: `At most ${MAX_BULK_DELETE} members can be deleted at once` },
      { status: 400 }
    );
  }

  try {
    const result = await Form.deleteMany({ _id: { $in: validIds } });
    return NextResponse.json(
      { success: true, message: "Members deleted", deletedCount: result.deletedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bulk deleting members", error);
    return NextResponse.json(
      { success: false, message: "Could not delete members" },
      { status: 500 }
    );
  }
}
