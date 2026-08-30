import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken, AUTH_COOKIE_NAME } from "@/utils/auth";
import AdminDashboard from "./admin-dashboard";

/**
 * Lightweight auth gate: cryptographically verifies the JWT (TOKEN_SECRET)
 * without any blocking database query, so the dashboard shell renders
 * instantly after sign-in. Data fetching happens client-side via the cache.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token || !verifyAdminToken(token)) {
    redirect("/signin");
  }

  return <AdminDashboard />;
}
