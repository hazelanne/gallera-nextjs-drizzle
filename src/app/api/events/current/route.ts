export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentEvent } from "@/lib/events";
import { getEventBalance } from "@/lib/funds";
import { countFights } from "@/lib/fights";

export async function GET() {
  const currentEvent = await getCurrentEvent();

  if (!currentEvent)
    return NextResponse.json({ error: "No current event" }, { status: 500 });

  const currentBalance = await getEventBalance(currentEvent.id);
  const currentFightCount = await countFights(currentEvent.id);

  return NextResponse.json({
    ...currentEvent, 
    fightCount: currentFightCount,
    balance: currentBalance
  });
}
