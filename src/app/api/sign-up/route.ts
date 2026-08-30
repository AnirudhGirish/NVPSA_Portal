import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { Admin } from "@/models/admin.model";
import { adminSchema } from "@/schemas/admin.schema";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/utils/rateLimit";

export async function POST(req: Request) {
  const allowSignup = process.env.ALLOW_SIGNUP;
  if (allowSignup !== "true") {
    return NextResponse.json(
      { success: false, message: "Admin registration is disabled" },
      { status: 403 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`signup:${ip}`, 5)) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  await dbConnect();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Error !! Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = adminSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return NextResponse.json(
      { success: false, message: "Error !! Validation failed", errors: issues },
      { status: 400 }
    );
  }

  const { username, email, password } = parsed.data;

  try {
    const existing = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Error !! Username or email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword });
    await newAdmin.save();
    return NextResponse.json(
      { success: true, message: "Admin registered successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error registring admin! Internal server Error", error);
    return NextResponse.json(
      { success: false, message: "Error registring admin! Internal server Error" },
      { status: 500 }
    );
  }
}
