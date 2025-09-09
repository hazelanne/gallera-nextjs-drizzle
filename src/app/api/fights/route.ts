import { NextResponse } from "next/server";
import { getFights, createNewFight } from "@/lib/fights";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Get list of fights
export async function GET(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const eventIdString = searchParams.get('eventId');
  if (!eventIdString) 
    return NextResponse.json({ error: "No event id" }, { status: 400 });

  const eventId = parseInt(eventIdString);
  const page = parseInt(searchParams.get('page') || "0");
  const limit = parseInt(searchParams.get('limit') || "10");

  const fights = await getFights(eventId, page, limit);
  return NextResponse.json(fights);
}

// Create new fight
export async function POST(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId, aSideId, bSideId } = await req.json();
  if (!eventId || !aSideId || !bSideId) 
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  const fight = await createNewFight(eventId, aSideId, bSideId);
  return NextResponse.json(fight);
}
