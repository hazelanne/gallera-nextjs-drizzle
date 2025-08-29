import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
// import { getHistoryForUser } from "@/lib/bets";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || undefined;
  const t = verifyToken(token);
  if (!t) return NextResponse.json([], { status: 200 });
  // const h = await getHistoryForUser(Number((t as any).sub));
  const h = {};
  return NextResponse.json(h);
}
