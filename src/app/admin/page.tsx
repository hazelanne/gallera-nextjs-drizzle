import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AdminPanel from "@/components/AdminPanel";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export default async function AdminPage() {
  const token = cookies().get("auth-token")?.value;
  if (!token) {
    redirect("/login");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, SECRET);
  } catch {
    redirect("/login"); // invalid/expired token
  }

  if (!decoded.isAdmin) {
    redirect("/"); // not admin, send back to main screen
  }

  return <AdminPanel />;
}
