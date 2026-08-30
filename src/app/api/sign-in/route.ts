import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbconnect";
import { Admin } from "@/models/admin.model";
import { adminSignInSchema } from "@/schemas/adminSignIn.schema";
import bcrypt from "bcryptjs";
import { authCookieOptions, signAdminToken } from "@/utils/auth";
import { rateLimit } from "@/utils/rateLimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!rateLimit(`signin:${ip}`, 10)) {
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
      { success: false, message: "Error!! Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = adminSignInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Error!! Invalid credentials" },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  try {
    const user = await Admin.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Error!! Admin User doesnot exist" },
        { status: 404 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Error!! Incorrect password" },
        { status: 400 }
      );
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };
    const token = signAdminToken(payload);

    const response = NextResponse.json(
      { success: true, message: "Admin User Sign In successfull" },
      { status: 200 }
    );
    response.cookies.set("token", token, authCookieOptions());
    return response;
  } catch (error) {
    console.error("Error signing in Admin User!! Internal Server Error", error);
    return NextResponse.json(
      { success: false, message: "Error signing in Admin User!! Internal Server Error" },
      { status: 500 }
    );
  }
}
