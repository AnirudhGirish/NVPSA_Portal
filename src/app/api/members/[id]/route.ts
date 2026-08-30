import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { formSchema } from "@/schemas/form.schema";
import { requireAdmin } from "@/utils/auth";
import { isValidObjectId } from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid member id" }, { status: 400 });
  }

  try {
    const member = await Form.findById(id).lean();
    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, member }, { status: 200 });
  } catch (error) {
    console.error("Error fetching member", error);
    return NextResponse.json({ success: false, message: "Could not fetch member" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid member id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return NextResponse.json({ success: false, message: "Validation failed", errors }, { status: 400 });
  }

  const { name, number, email, address, aadhar, pass, year } = parsed.data;

  try {
    const duplicate = await Form.findOne({ number, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Another member already has this phone number" },
        { status: 409 }
      );
    }

    const updated = await Form.findByIdAndUpdate(
      id,
      {
        name,
        number,
        email: email || undefined,
        address,
        aadhar: aadhar || undefined,
        pass: pass || undefined,
        year: year || undefined,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Member updated", member: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating member", error);
    return NextResponse.json({ success: false, message: "Could not update member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "Invalid member id" }, { status: 400 });
  }

  try {
    const deleted = await Form.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Member deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting member", error);
    return NextResponse.json({ success: false, message: "Could not delete member" }, { status: 500 });
  }
}
