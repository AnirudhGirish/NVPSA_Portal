import { NextResponse } from "next/server";

const RETRY_AFTER_SECONDS = 60;

/**
 * Shared rate-limit reject helper that sets Retry-After so clients
 * can show a friendly countdown instead of a raw 429.
 */
export function rateLimitedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, message: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(RETRY_AFTER_SECONDS) },
    }
  );
}

export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
