import { NextRequest, NextResponse } from "next/server";
import { addTeamToEvent, getTeamsByEventId } from "@/lib/teams"; // your helper functions
import { z } from "zod";

const bodySchema = z.object({
  teamId: z.number().int(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await req.json();
    const parsed = bodySchema.parse(json);
    const eventId = parseInt(params.id, 10);

    const eventTeam = await addTeamToEvent(eventId, parsed.teamId);

    return NextResponse.json(eventTeam, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = parseInt(params.id, 10);
    const teams = await getTeamsByEventId(eventId);

    return NextResponse.json(teams);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
