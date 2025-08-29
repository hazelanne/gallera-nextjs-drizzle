import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserById } from "@/lib/user";

export async function GET() {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(Number((t as any).sub));
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ balance: parseFloat(user.credits) });
}
