import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { endFight } from "@/lib/fights";

export async function POST(req: Request, { params }: { params: { id: number } }) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const { id } = params;
    const fight = await endFight(id, body.result);
    return NextResponse.json(fight);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  
}
