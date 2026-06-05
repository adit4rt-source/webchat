import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId");
  if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });
  try {
    const data = await botApi(`/api/welcomer/settings/${guildId}`, { userId: (session.user as any).id });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !(session.user as any).isAdmin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  try {
    const body = await req.json();
    const { guildId, settings } = body;
    if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });
    const result = await botApi(`/api/welcomer/settings/${guildId}`, { method: "POST", body: { settings }, userId: (session.user as any).id });
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
