import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTotalBalance } from "@/lib/funds";

export async function GET() {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const overall = await getTotalBalance();
    return NextResponse.json({ overall });
  } catch (err) {
    console.error("Error fetching funds data:", err);
    return NextResponse.json(
      { error: "Failed to fetch funds data" },
      { status: 500 }
    );
  }
}
