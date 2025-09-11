import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getBetHistoryOfUserByEvent } from "@/lib/bets";

export async function GET(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = Number((t as any).sub);
  if (!userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const eventIdString = searchParams.get('eventId');
  if (!eventIdString) 
    return NextResponse.json({ error: "No event id" }, { status: 400 });

  const eventId = parseInt(eventIdString);

  const h = await getBetHistoryOfUserByEvent(userId, eventId);
  return NextResponse.json(h);
}
