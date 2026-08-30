import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/utils/dbconnect";
import { verifyAdminToken, AUTH_COOKIE_NAME } from "@/utils/auth";
import AdminDashboard from "./admin-dashboard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token || !verifyAdminToken(token)) {
    redirect("/signin");
  }

  await connectDB();

  return <AdminDashboard />;
}
