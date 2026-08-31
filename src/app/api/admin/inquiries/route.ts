import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/utils/dbconnect";
import { Inquiry } from "@/models/inquiry.model";
import { requireAdmin } from "@/utils/auth";

const VALID_STATUSES = ["unread", "read", "resolved"] as const;

export async function GET() {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [inquiries, unreadCount] = await Promise.all([
      Inquiry.find().sort({ createdAt: -1 }).limit(500).lean(),
      Inquiry.countDocuments({ status: "unread" }),
    ]);

    return NextResponse.json(
      { success: true, inquiries, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid body" }, { status: 400 });
  }

  const { id, status } = (body ?? {}) as { id?: string; status?: string };

  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid inquiry id" }, { status: 400 });
  }

  if (!status || !(VALID_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { success: false, message: "Status must be 'unread', 'read', or 'resolved'" },
      { status: 400 }
    );
  }

  try {
    const updated = await Inquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Inquiry not found" }, { status: 404 });
    }

    const unreadCount = await Inquiry.countDocuments({ status: "unread" });

    return NextResponse.json(
      { success: true, inquiry: updated, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Could not update inquiry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid inquiry id" }, { status: 400 });
  }

  try {
    const deleted = await Inquiry.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Inquiry not found" }, { status: 404 });
    }

    const unreadCount = await Inquiry.countDocuments({ status: "unread" });

    return NextResponse.json(
      { success: true, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete inquiry" },
      { status: 500 }
    );
  }
}
