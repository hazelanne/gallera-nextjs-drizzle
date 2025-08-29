import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { placeBet, getBetsTotals } from "@/lib/bets";

export async function POST(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const res = await placeBet(
      Number((t as any).sub),
      body.fightId,
      body.bet,
      Number(body.amount),
    );
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const fightId = Number(url.searchParams.get("fightId"));

  try {
    const betsTotals = await getBetsTotals(Number((t as any).sub), fightId);
    return NextResponse.json({ bets: betsTotals });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
