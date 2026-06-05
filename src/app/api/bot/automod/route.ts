import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

const GUILD_ID = process.env.GUILD_ID || "1056412836433240074";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await botApi(`/api/automod/${GUILD_ID}`);
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !(session.user as any).isAdmin) return NextResponse.json({ error: "Admin required" }, { status: 403 });
  try {
    const body = await req.json();
    const { endpoint, ...data } = body;
    const result = await botApi(`/api/automod/${GUILD_ID}/${endpoint}`, { method: "POST", body: data, userId: (session.user as any).id });
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
