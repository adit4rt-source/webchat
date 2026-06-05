import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !(session.user as any).isAdmin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  try {
    const body = await req.json();
    const { guildId } = body;
    if (!guildId) return NextResponse.json({ error: "Missing guildId" }, { status: 400 });
    const result = await botApi(`/api/welcomer/test/${guildId}`, { method: "POST", body: {}, userId: (session.user as any).id });
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
