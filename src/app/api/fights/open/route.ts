import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createNewFight } from "@/lib/fights";

export async function POST(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fight = await createNewFight();
  return NextResponse.json(fight);
}
