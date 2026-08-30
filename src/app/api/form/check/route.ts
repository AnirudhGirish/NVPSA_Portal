import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { Form } from "@/models/form.model";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const numberRaw = searchParams.get("number")?.trim() ?? "";

  if (!/^\d{10}$/.test(numberRaw)) {
    return NextResponse.json(
      { success: false, message: "Invalid phone number format" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const exists = await Form.exists({ number: Number(numberRaw) });
    return NextResponse.json(
      { success: true, exists: Boolean(exists) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking phone number", error);
    return NextResponse.json(
      { success: false, message: "Could not verify phone number" },
      { status: 500 }
    );
  }
}
