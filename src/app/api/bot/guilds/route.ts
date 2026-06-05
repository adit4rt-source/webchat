import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await botApi("/api/user/guilds", { userId: (session.user as any).id });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, guilds: [] }, { status: 500 });
  }
}
