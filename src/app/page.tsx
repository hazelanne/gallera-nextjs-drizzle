import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UserMainScreen from "@/components/UserMainScreen";

export default async function Page() {
  const token = cookies().get("auth-token")?.value;
  if (!token) {
    redirect("/login");
  }
  return <UserMainScreen />;
}
