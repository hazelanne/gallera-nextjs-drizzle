import { NextResponse } from "next/server";
import { getEvent, updateStatus } from "@/lib/events";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";


export async function GET(req: Request, { params }: { params: { id: number } }) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const event = await getEvent(id);
  return NextResponse.json(event);
}

export async function PUT(req: Request, { params }: { params: { id: number } }) {
  const token = cookies().get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const t = verifyToken(token);
  if (!t) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!t.isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const { status } = await req.json();

  const result = await updateStatus(id, status);
  return NextResponse.json(result);
}
