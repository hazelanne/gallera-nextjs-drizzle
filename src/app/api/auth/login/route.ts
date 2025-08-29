import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const found = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (found.length === 0)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const user = found[0];
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = signToken({ sub: user.id, isAdmin: user.role === "admin" });
  const res = NextResponse.json({
    id: user.id,
    username: user.username,
    credits: user.credits
  });
  res.cookies.set("auth-token", token, { httpOnly: true, path: "/" });
  return res;
}
