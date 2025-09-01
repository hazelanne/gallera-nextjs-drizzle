import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { createNewFight } from "@/lib/fights";
import { getCurrentEvent } from "@/lib/events";

export async function POST(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) 
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const event = await getCurrentEvent();
  if (!event) {
    return NextResponse.json({ error: "No ongoing event" }, { status: 400 });
  }

  const fight = await createNewFight("", event.id);
  return NextResponse.json(fight);
}
