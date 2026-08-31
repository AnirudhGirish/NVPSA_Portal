import { NextResponse } from "next/server";
import { connectDB } from "@/utils/dbconnect";
import { Inquiry } from "@/models/inquiry.model";
import { rateLimit } from "@/utils/rateLimit";
import { getClientIp, rateLimitedResponse } from "@/lib/http";

/**
 * Strip HTML/script characters to prevent stored XSS when inquiries are
 * displayed in the admin dashboard.
 */
function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLen);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`contact:${ip}`, 5)) {
    return rateLimitedResponse();
  }

  await connectDB();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }

  const { name, email, phone, subject, message } = (body ?? {}) as Record<
    string,
    unknown
  >;

  const cleanName = sanitizeText(name, 100);
  const cleanEmail = sanitizeText(email, 150).toLowerCase();
  const cleanPhone = sanitizeText(phone, 20);
  const cleanSubject = sanitizeText(subject, 200) || "General Inquiry";
  const cleanMessage = sanitizeText(message, 3000);

  if (!cleanName) {
    return NextResponse.json(
      { success: false, message: "Name is required" },
      { status: 400 }
    );
  }
  if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
    return NextResponse.json(
      { success: false, message: "A valid email address is required" },
      { status: 400 }
    );
  }
  if (!cleanMessage) {
    return NextResponse.json(
      { success: false, message: "Message is required" },
      { status: 400 }
    );
  }

  try {
    await Inquiry.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      subject: cleanSubject,
      message: cleanMessage,
    });

    return NextResponse.json(
      { success: true, message: "Your message has been received." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Could not submit your message. Please try again later." },
      { status: 500 }
    );
  }
}
