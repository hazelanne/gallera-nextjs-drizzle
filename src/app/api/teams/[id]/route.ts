import { NextResponse } from "next/server";
import { getTeamById } from "@/lib/teams";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: number } }) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const team = await getTeamById(id);
  return NextResponse.json(team);
}

