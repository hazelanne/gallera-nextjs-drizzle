import { NextResponse } from "next/server";
import { createTeam, getTeams } from "@/lib/teams";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Get list of teams
export async function GET(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await getTeams();
  return NextResponse.json(teams);
}

export async function POST(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, owner } = await req.json();
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const team = await createTeam(name, owner);
  return NextResponse.json(team);
}
