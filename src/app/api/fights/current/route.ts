export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentFight } from "@/lib/fights";
export async function GET() {
  const currentFight = await getCurrentFight();
  return NextResponse.json(currentFight);
}
