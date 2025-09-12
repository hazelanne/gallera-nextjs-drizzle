import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserMainScreen from "@/components/player/UserMainScreen";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";

export default async function Page() {
  const token = cookies().get("auth-token")?.value;
  if (!token) {
    redirect("/login");
  } else {
    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch {
      redirect("/login"); // invalid/expired token
    }

    if (decoded.isAdmin) {
      redirect("/admin");
    }
  }

  return <UserMainScreen />;
}
