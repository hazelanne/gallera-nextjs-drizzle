export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentEvent } from "@/lib/events";
import { countFights, getFightsWinners } from "@/lib/fights";

export async function GET() {
  const currentEvent = await getCurrentEvent();

  if (!currentEvent)
    return NextResponse.json({ error: "No current event" }, { status: 500 });

  try {
    const currentFightCount = await countFights(currentEvent.id);
    const winners = await getFightsWinners(currentEvent.id);

    return NextResponse.json({
      ...currentEvent, 
      fightCount: currentFightCount,
      tally: winners
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
