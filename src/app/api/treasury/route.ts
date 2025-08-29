import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTodayFinancials, getTotalFinancials } from "@/lib/treasury";

export async function GET() {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [today, overall] = await Promise.all([
      getTodayFinancials(),
      getTotalFinancials(),
    ]);

    return NextResponse.json({ today, overall });
  } catch (err) {
    console.error("Error fetching treasury data:", err);
    return NextResponse.json(
      { error: "Failed to fetch treasury data" },
      { status: 500 }
    );
  }
}
