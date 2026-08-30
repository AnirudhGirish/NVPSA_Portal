import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Form } from "@/models/form.model";
import { formSchema } from "@/schemas/form.schema";
import { rateLimit } from "@/utils/rateLimit";
import { getClientIp, rateLimitedResponse } from "@/lib/http";
import { getNextSerialNumber } from "@/utils/counter";

export async function POST(req: Request) {
  const ip = getClientIp(req);

  if (!rateLimit(`form:${ip}`, 10)) {
    return rateLimitedResponse();
  }

  await connectDB();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
  }

  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return NextResponse.json(
      { success: false, message: "Validation failed", errors: issues },
      { status: 400 }
    );
  }

  const { name, number, email, address, aadhar, pass, year } = parsed.data;

  try {
    const dataExists = await Form.findOne({ number });
    if (dataExists) {
      return NextResponse.json(
        { success: false, message: "User exists with these credentials" },
        { status: 400 }
      );
    }

    const serialNumber = await getNextSerialNumber();

    const newForm = new Form({
      serialNumber,
      name,
      number,
      email: email || undefined,
      address,
      aadhar: aadhar || undefined,
      pass: pass || undefined,
      year: year || undefined,
    });
    await newForm.save();
    return NextResponse.json(
      { success: true, message: "Form Submission Successfull!!!", member: newForm.toObject() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting the form", error);
    return NextResponse.json(
      { success: false, message: "Submitting form Failed!! Internal Server Error" },
      { status: 500 }
    );
  }
}
