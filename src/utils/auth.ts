import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { Admin } from "@/models/admin.model";
import type { AdminTokenPayload } from "@/types";

export const AUTH_COOKIE_NAME = "token";

function getTokenSecret(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    throw new Error("Please define TOKEN_SECRET in the environment");
  }
  return secret;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, getTokenSecret(), { expiresIn: "1d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, getTokenSecret()) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24,
  };
}

/**
 * Verifies the JWT cookie AND that the referenced admin still exists in the DB.
 * Returns the payload on success, otherwise null (caller must return 401).
 */
export async function requireAdmin(): Promise<AdminTokenPayload | null> {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return null;
  }

  const admin = await Admin.exists({ _id: payload.id });
  if (!admin) {
    return null;
  }

  return payload;
}
