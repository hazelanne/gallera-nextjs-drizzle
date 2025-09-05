export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentFight } from "@/lib/fights";
export async function GET() {
  try {
    const currentFight = await getCurrentFight();
    return NextResponse.json(currentFight);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
